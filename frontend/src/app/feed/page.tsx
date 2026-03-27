"use client";
export const dynamic = "force-dynamic";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/Avatar";
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

function FeedSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="shell-card p-5 md:p-6 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-slate-200" />
            <div className="h-3 w-36 rounded bg-slate-200" />
          </div>
          <div className="h-5 w-3/4 rounded bg-slate-200" />
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-slate-200" />
            <div className="h-3 w-5/6 rounded bg-slate-200" />
            <div className="h-3 w-4/6 rounded bg-slate-200" />
          </div>
          <div className="flex gap-3 pt-2">
            <div className="h-8 w-20 rounded bg-slate-200" />
            <div className="h-8 w-24 rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FeedPage() {
  const supabase = createClient();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [viewerId, setViewerId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [editingPostId, setEditingPostId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [busyPostId, setBusyPostId] = useState("");
  const [msg, setMsg] = useState("");
  const [msgTone, setMsgTone] = useState<"info" | "success" | "error">("info");
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);

  async function load() {
    setFeedLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const currentViewerId = user?.id || "";
    setViewerId(currentViewerId);

    // Check if the logged-in user has an incomplete profile
    if (currentViewerId) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("headline, location")
        .eq("id", currentViewerId)
        .maybeSingle();
      if (prof && (!prof.headline || !prof.location)) {
        setShowProfilePrompt(true);
      }
    }

    const { data, error: loadError } = await supabase
      .from("posts")
      .select("id,author_id,group_slug,title,body,created_at,updated_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (loadError) {
      setMsg(loadError.message);
      setMsgTone("error");
      setFeedLoading(false);
      return;
    }

    const postRows = (data || []) as Post[];
    const authorIds = [...new Set(postRows.map((post) => post.author_id))];
    const postIds = postRows.map((post) => post.id);

    const [{ data: authorRows }, { data: avatarRows }, { data: likeRows }, { data: commentRows }] =
      await Promise.all([
        authorIds.length
          ? supabase.from("profile_identities").select("id,handle,display_name").in("id", authorIds)
          : Promise.resolve({ data: [] as Pick<PublicProfileSummary, "id" | "handle" | "display_name">[] }),
        authorIds.length
          ? supabase.from("profiles").select("id,avatar_url").in("id", authorIds)
          : Promise.resolve({ data: [] as { id: string; avatar_url: string | null }[] }),
        postIds.length
          ? supabase.from("likes").select("post_id,user_id").in("post_id", postIds)
          : Promise.resolve({ data: [] as LikeRow[] }),
        postIds.length
          ? supabase.from("comments").select("post_id").in("post_id", postIds)
          : Promise.resolve({ data: [] as CommentRow[] }),
      ]);

    const avatarById = new Map(
      ((avatarRows || []) as { id: string; avatar_url: string | null }[]).map((r) => [r.id, r.avatar_url])
    );
    const authorsById = new Map(
      ((authorRows || []) as Pick<PublicProfileSummary, "id" | "handle" | "display_name">[]).map((a) => [
        a.id,
        { ...a, avatar_url: avatarById.get(a.id) ?? null } as PublicProfileSummary,
      ])
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
    setFeedLoading(false);
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
    <div className="max-w-2xl mx-auto py-10 space-y-6">

      <form onSubmit={createPost} className="shell-card space-y-4 p-5 md:p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-label uppercase tracking-widest text-brand-navy">New post</h2>
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
        {feedLoading ? (
          <FeedSkeleton />
        ) : posts.length === 0 ? (
          <div className="shell-card p-10 text-center space-y-3">
            <div className="text-2xl text-slate-300 select-none">✦</div>
            <p className="text-sm font-medium text-slate-700">Nothing here yet.</p>
            <p className="text-sm text-on-surface-variant">Be the first to share an insight.</p>
          </div>
        ) : (
          posts.map((post) => {
            const isEditing = editingPostId === post.id;

            return (
              <article key={post.id} className="shell-card p-5 md:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  {post.author ? (
                    <Link href={`/u/${post.author.handle}`} className="flex items-center gap-2 group/author">
                      <Avatar url={post.author.avatar_url} name={post.author.display_name} size="sm" />
                      <span className="text-xs font-medium text-slate-700 group-hover/author:text-blue-700">
                        {post.author.display_name} · @{post.author.handle}
                      </span>
                    </Link>
                  ) : (
                    <span className="pill">Post</span>
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
                      className="mt-4 block text-lg font-headline font-semibold tracking-tight text-brand-navy hover:text-brand-accent transition-colors"
                    >
                      {post.title}
                    </Link>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-on-surface-variant">{post.body}</p>
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
