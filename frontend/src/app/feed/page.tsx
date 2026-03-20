"use client";
export const dynamic = "force-dynamic";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Post } from "@/lib/types";

type ProfileIdentity = {
  id: string;
  handle: string;
  display_name: string;
};

type FeedPost = Post & {
  author: ProfileIdentity | null;
  isOwner: boolean;
  likedByViewer: boolean;
  likeCount: number;
};

type LikeRow = {
  post_id: string;
  user_id: string;
};

export default function FeedPage() {
  const supabase = createClient();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [viewerId, setViewerId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [editingPostId, setEditingPostId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [busyPostId, setBusyPostId] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const currentViewerId = user?.id || "";
    setViewerId(currentViewerId);

    const { data } = await supabase
      .from("posts")
      .select("id,author_id,group_slug,title,body,created_at,updated_at")
      .order("created_at", { ascending: false })
      .limit(50);

    const postRows = (data || []) as Post[];
    const authorIds = [...new Set(postRows.map((post) => post.author_id))];
    const postIds = postRows.map((post) => post.id);

    const [{ data: authorRows }, { data: likeRows }] = await Promise.all([
      authorIds.length
        ? supabase.from("profile_identities").select("id,handle,display_name").in("id", authorIds)
        : Promise.resolve({ data: [] as ProfileIdentity[] }),
      postIds.length
        ? supabase.from("likes").select("post_id,user_id").in("post_id", postIds)
        : Promise.resolve({ data: [] as LikeRow[] }),
    ]);

    const authorsById = new Map(
      ((authorRows || []) as ProfileIdentity[]).map((author) => [author.id, author]),
    );
    const likeCountByPostId = new Map<string, number>();
    const likedPostIds = new Set<string>();

    ((likeRows || []) as LikeRow[]).forEach((like) => {
      likeCountByPostId.set(like.post_id, (likeCountByPostId.get(like.post_id) || 0) + 1);
      if (like.user_id === currentViewerId) likedPostIds.add(like.post_id);
    });

    setPosts(
      postRows.map((post) => ({
        ...post,
        author: authorsById.get(post.author_id) || null,
        isOwner: post.author_id === currentViewerId,
        likedByViewer: likedPostIds.has(post.id),
        likeCount: likeCountByPostId.get(post.id) || 0,
      })),
    );
  }

  useEffect(() => {
    void load();
  }, []);

  async function createPost(e: FormEvent) {
    e.preventDefault();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return setMsg("Sign in first on /onboarding");

    const { error } = await supabase.from("posts").insert({ author_id: user.id, title, body });
    if (error) return setMsg(error.message);

    setTitle("");
    setBody("");
    setMsg("Posted");
    await load();
  }

  function startEdit(post: FeedPost) {
    setEditingPostId(post.id);
    setEditTitle(post.title);
    setEditBody(post.body);
    setMsg("");
  }

  function cancelEdit() {
    setEditingPostId("");
    setEditTitle("");
    setEditBody("");
  }

  async function saveEdit(postId: string) {
    const trimmedTitle = editTitle.trim();
    const trimmedBody = editBody.trim();
    if (!trimmedTitle || !trimmedBody) {
      setMsg("Title and body are required.");
      return;
    }

    setBusyPostId(postId);
    const { error } = await supabase
      .from("posts")
      .update({ title: trimmedTitle, body: trimmedBody, updated_at: new Date().toISOString() })
      .eq("id", postId);
    setBusyPostId("");

    if (error) return setMsg(error.message);

    cancelEdit();
    setMsg("Post updated");
    await load();
  }

  async function deletePost(postId: string) {
    if (!window.confirm("Delete this post? This will also remove its comments and likes.")) return;

    setBusyPostId(postId);
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    setBusyPostId("");
    if (error) return setMsg(error.message);

    if (editingPostId === postId) cancelEdit();
    setMsg("Post deleted");
    await load();
  }

  async function toggleLike(postId: string) {
    const current = posts.find((post) => post.id === postId);
    if (!current) return;

    let currentViewerId = viewerId;
    if (!currentViewerId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      currentViewerId = user?.id || "";
      setViewerId(currentViewerId);
    }

    if (!currentViewerId) return setMsg("Sign in first");

    setBusyPostId(postId);
    const { error } = current.likedByViewer
      ? await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", currentViewerId)
      : await supabase.from("likes").insert({ post_id: postId, user_id: currentViewerId });
    setBusyPostId("");

    if (error && !error.message.toLowerCase().includes("duplicate")) return setMsg(error.message);
    if (error) {
      await load();
      return;
    }

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              likedByViewer: !current.likedByViewer,
              likeCount: Math.max(0, post.likeCount + (current.likedByViewer ? -1 : 1)),
            }
          : post,
      ),
    );
    setMsg("");
  }

  return (
    <div className="space-y-6">
      <section className="page-grid">
        <div className="shell-card-strong p-6 md:p-8">
          <p className="eyebrow">Community signal</p>
          <h1 className="section-title mt-3">Global feed</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 soft-muted">
            A place for implementation notes, systems thinking, verification lessons, architecture tradeoffs,
            and field-tested patterns — not generic status noise.
          </p>
        </div>
        <aside className="shell-card p-6">
          <p className="eyebrow">Posting intent</p>
          <div className="mt-4 space-y-3 text-sm leading-6 soft-muted">
            <p>Share practical lessons, not vague thought leadership.</p>
            <p>Good posts usually include context, method, failure mode, and what changed.</p>
            <p>If publishing fails, the message below should tell us exactly where the backend is unhappy.</p>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/profile" className="secondary-button px-4 py-2 text-sm">
              Manage profile
            </Link>
            <Link href="/people" className="secondary-button px-4 py-2 text-sm">
              Browse directory
            </Link>
          </div>
        </aside>
      </section>

      <form onSubmit={createPost} className="shell-card space-y-4 p-5 md:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Start a discussion</h2>
            <p className="mt-1 text-sm soft-muted">Post a concrete systems engineering insight, question, or pattern.</p>
          </div>
          <button className="primary-button px-4 py-2.5">Publish</button>
        </div>
        <input placeholder="Post title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea
          placeholder="Share a practical systems engineering insight..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </form>

      {msg && <p className="text-sm soft-muted">{msg}</p>}

      <section className="space-y-4">
        {posts.length === 0 ? (
          <div className="shell-card p-8 text-center">
            <h2 className="text-lg font-semibold text-slate-900">No posts yet</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 soft-muted">
              The feed still needs seeded content so it feels alive. Right now it’s structurally ready, but socially empty.
            </p>
          </div>
        ) : (
          posts.map((post) => {
            const isEditing = editingPostId === post.id;

            return (
              <article key={post.id} className="shell-card p-5 md:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="pill">Systems note</span>
                  {post.author && (
                    <Link href={`/u/${post.author.handle}`} className="text-xs font-medium text-slate-700 hover:text-blue-700">
                      {post.author.display_name} · @{post.author.handle}
                    </Link>
                  )}
                  <span className="text-xs soft-muted">{new Date(post.created_at).toLocaleString()}</span>
                  {post.updated_at !== post.created_at && <span className="text-xs soft-muted">edited</span>}
                </div>

                {isEditing ? (
                  <div className="mt-4 space-y-3">
                    <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                    <textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} />
                  </div>
                ) : (
                  <>
                    <Link
                      href={`/post/${post.id}`}
                      className="mt-4 block text-xl font-semibold tracking-tight text-slate-900 hover:text-blue-700"
                    >
                      {post.title}
                    </Link>
                    <p className="mt-3 whitespace-pre-wrap text-[15px] leading-7 text-slate-700">{post.body}</p>
                  </>
                )}

                <div className="mt-5 flex flex-wrap gap-3 text-sm">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => void saveEdit(post.id)}
                        className="primary-button px-4 py-2 text-sm"
                        disabled={busyPostId === post.id}
                      >
                        Save
                      </button>
                      <button type="button" onClick={cancelEdit} className="secondary-button px-4 py-2 text-sm">
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => void toggleLike(post.id)}
                        className="secondary-button px-4 py-2 text-sm"
                        disabled={busyPostId === post.id}
                      >
                        {post.likedByViewer ? `Liked · ${post.likeCount}` : `Like · ${post.likeCount}`}
                      </button>
                      <Link href={`/post/${post.id}`} className="secondary-button px-4 py-2 text-sm">
                        Comment
                      </Link>
                      <Link href={`/post/${post.id}#report`} className="secondary-button px-4 py-2 text-sm">
                        Report
                      </Link>
                      {post.isOwner && (
                        <>
                          <button
                            type="button"
                            onClick={() => startEdit(post)}
                            className="secondary-button px-4 py-2 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void deletePost(post.id)}
                            className="secondary-button px-4 py-2 text-sm"
                            disabled={busyPostId === post.id}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
