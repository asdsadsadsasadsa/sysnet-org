"use client";
export const dynamic = "force-dynamic";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Post, PublicProfileSummary } from "@/lib/types";

type FeedPost = Post & {
  author: PublicProfileSummary | null;
  isOwner: boolean;
  likedByViewer: boolean;
  likeCount: number;
  commentCount: number;
};

type LikeRow = {
  post_id: string;
  user_id: string;
};

type CommentRow = {
  post_id: string;
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
  const [msgTone, setMsgTone] = useState<"info" | "success" | "error">("info");

  async function load() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const currentViewerId = user?.id || "";
    setViewerId(currentViewerId);

    const { data, error: loadError } = await supabase
      .from("posts")
      .select("id,author_id,group_slug,title,body,created_at,updated_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (loadError) {
      setMsg(loadError.message);
      setMsgTone("error");
      return;
    }

    const postRows = (data || []) as Post[];
    const authorIds = [...new Set(postRows.map((post) => post.author_id))];
    const postIds = postRows.map((post) => post.id);

    const [{ data: authorRows }, { data: likeRows }, { data: commentRows }] = await Promise.all([
      authorIds.length
        ? supabase.from("profile_identities").select("id,handle,display_name").in("id", authorIds)
        : Promise.resolve({ data: [] as PublicProfileSummary[] }),
      postIds.length
        ? supabase.from("likes").select("post_id,user_id").in("post_id", postIds)
        : Promise.resolve({ data: [] as LikeRow[] }),
      postIds.length
        ? supabase.from("comments").select("post_id").in("post_id", postIds)
        : Promise.resolve({ data: [] as CommentRow[] }),
    ]);

    const authorsById = new Map(
      ((authorRows || []) as PublicProfileSummary[]).map((author) => [author.id, author]),
    );
    const likeCountByPostId = new Map<string, number>();
    const likedPostIds = new Set<string>();
    const commentCountByPostId = new Map<string, number>();

    ((likeRows || []) as LikeRow[]).forEach((like) => {
      likeCountByPostId.set(like.post_id, (likeCountByPostId.get(like.post_id) || 0) + 1);
      if (like.user_id === currentViewerId) likedPostIds.add(like.post_id);
    });
    ((commentRows || []) as CommentRow[]).forEach((comment) => {
      commentCountByPostId.set(comment.post_id, (commentCountByPostId.get(comment.post_id) || 0) + 1);
    });

    setPosts(
      postRows.map((post) => ({
        ...post,
        author: authorsById.get(post.author_id) || null,
        isOwner: post.author_id === currentViewerId,
        likedByViewer: likedPostIds.has(post.id),
        likeCount: likeCountByPostId.get(post.id) || 0,
        commentCount: commentCountByPostId.get(post.id) || 0,
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
    if (!user) {
      setMsgTone("error");
      return setMsg("Sign in first on /onboarding to start a discussion.");
    }

    if (!title.trim() || !body.trim()) {
      setMsgTone("error");
      return setMsg("Title and body are required to publish.");
    }

    setBusyPostId("new");
    const { error } = await supabase.from("posts").insert({ author_id: user.id, title, body });
    setBusyPostId("");

    if (error) {
      setMsgTone("error");
      return setMsg(error.message);
    }

    setTitle("");
    setBody("");
    setMsgTone("success");
    setMsg("Insight published to the global feed.");
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
      setMsgTone("error");
      setMsg("Title and body are required.");
      return;
    }

    setBusyPostId(postId);
    const { error } = await supabase
      .from("posts")
      .update({ title: trimmedTitle, body: trimmedBody, updated_at: new Date().toISOString() })
      .eq("id", postId);
    setBusyPostId("");

    if (error) {
      setMsgTone("error");
      return setMsg(error.message);
    }

    cancelEdit();
    setMsgTone("success");
    setMsg("Post updated");
    await load();
  }

  async function deletePost(postId: string) {
    if (!window.confirm("Delete this post? This will also remove its comments and likes.")) return;

    setBusyPostId(postId);
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    setBusyPostId("");
    if (error) {
      setMsgTone("error");
      return setMsg(error.message);
    }

    if (editingPostId === postId) cancelEdit();
    setMsgTone("success");
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

    if (!currentViewerId) {
      setMsgTone("error");
      return setMsg("Sign in first to like posts.");
    }

    setBusyPostId(postId);
    const { error } = current.likedByViewer
      ? await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", currentViewerId)
      : await supabase.from("likes").insert({ post_id: postId, user_id: currentViewerId });
    setBusyPostId("");

    if (error && !error.message.toLowerCase().includes("duplicate")) {
      setMsgTone("error");
      return setMsg(error.message);
    }
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
    setMsgTone("success");
    setMsg(current.likedByViewer ? "Like removed" : "Post liked");
  }

  return (
    <div className="space-y-6">
      <section className="page-grid">
        <div className="shell-card-strong p-6 md:p-8">
          <p className="eyebrow">Discussion</p>
          <h1 className="section-title mt-3">Feed</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 soft-muted">
            Implementation notes, verification lessons, architecture tradeoffs, and field-tested patterns from systems engineers.
          </p>
        </div>
        <aside className="shell-card p-6">
          <p className="eyebrow">What to post</p>
          <div className="mt-4 space-y-3 text-sm leading-6 soft-muted">
            <p>Share what you have learned in practice — implementation notes, failure modes, methods that worked.</p>
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

      <div className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-blue-800 flex items-center justify-between gap-4">
        <p>New here? See what is happening in systems engineering — <a href="/news" className="text-blue-700 hover:underline">read the latest news</a>.</p>
        <Link href="/news" className="shrink-0 font-medium underline underline-offset-2 hover:text-blue-900">
          Visit News
        </Link>
      </div>

      <form onSubmit={createPost} className="shell-card space-y-4 p-5 md:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Start a discussion</h2>
            <p className="mt-1 text-sm soft-muted">Post a concrete systems engineering insight, question, or pattern.</p>
          </div>
          <button disabled={busyPostId === "new"} className="primary-button px-4 py-2.5 disabled:opacity-60">
            {busyPostId === "new" ? "Publishing..." : "Publish"}
          </button>
        </div>
        <input placeholder="Post title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea
          placeholder="Share a practical systems engineering insight..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </form>

      {msg && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            msgTone === "error"
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : msgTone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-blue-200 bg-blue-50 text-blue-700"
          }`}
        >
          {msg}
        </div>
      )}

      <section className="space-y-4">
        {posts.length === 0 ? (
          <div className="shell-card p-12 text-center">
            <h2 className="text-xl font-semibold text-slate-900">Nothing here yet.</h2>
            <p className="mx-auto mt-3 max-w-xl text-base leading-7 soft-muted">
              Be the first to post — share an implementation note, a verification lesson, or a tradeoff you have worked through.
            </p>
            <div className="mt-6">
              <Link href="/onboarding" className="primary-button">
                Complete your profile to post
              </Link>
            </div>
          </div>
        ) : (
          posts.map((post) => {
            const isEditing = editingPostId === post.id;

            return (
              <article key={post.id} className="shell-card p-5 md:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="pill">Post</span>
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
                        className={`${post.likedByViewer ? "primary-button" : "secondary-button"} px-4 py-2 text-sm`}
                        disabled={busyPostId === post.id}
                      >
                        {busyPostId === post.id
                          ? "Working..."
                          : post.likedByViewer
                            ? `Liked · ${post.likeCount}`
                            : `Like · ${post.likeCount}`}
                      </button>
                      <Link href={`/post/${post.id}`} className="secondary-button px-4 py-2 text-sm">
                        {post.commentCount > 0 ? `Comments · ${post.commentCount}` : "Comment"}
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
