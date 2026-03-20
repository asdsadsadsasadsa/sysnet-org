"use client";
export const dynamic = "force-dynamic";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { PublicProfileSummary } from "@/lib/types";

type CommentRecord = {
  id: string;
  author_id: string;
  body: string;
  created_at: string;
};

type Comment = CommentRecord & {
  author: PublicProfileSummary | null;
};

type PostRecord = {
  id: string;
  author_id: string;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
};

type PostDetail = PostRecord & {
  author: PublicProfileSummary | null;
  likedByViewer: boolean;
  likeCount: number;
};

type LikeRow = {
  post_id: string;
  user_id: string;
};

export default function PostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();
  const [viewerId, setViewerId] = useState("");
  const [post, setPost] = useState<PostDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState("spam");
  const [msg, setMsg] = useState("");

  async function load() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const currentViewerId = user?.id || "";
    setViewerId(currentViewerId);

    const { data: postData } = await supabase
      .from("posts")
      .select("id,author_id,title,body,created_at,updated_at")
      .eq("id", id)
      .maybeSingle();

    const postRow = (postData as PostRecord | null) || null;
    if (!postRow) {
      setPost(null);
      setComments([]);
      return;
    }

    const [{ data: likeRows }, { data: commentData }] = await Promise.all([
      supabase.from("likes").select("post_id,user_id").eq("post_id", id),
      supabase.from("comments").select("id,author_id,body,created_at").eq("post_id", id).order("created_at", {
        ascending: true,
      }),
    ]);

    const commentRows = (commentData || []) as CommentRecord[];
    const identityIds = [...new Set([postRow.author_id, ...commentRows.map((comment) => comment.author_id)])];
    const { data: identityRows } = identityIds.length
      ? await supabase.from("profile_identities").select("id,handle,display_name").in("id", identityIds)
      : { data: [] as PublicProfileSummary[] };

    const identities = new Map(
      ((identityRows || []) as PublicProfileSummary[]).map((identity) => [identity.id, identity]),
    );
    const likes = (likeRows || []) as LikeRow[];

    setPost({
      ...postRow,
      author: identities.get(postRow.author_id) || null,
      likedByViewer: likes.some((like) => like.user_id === currentViewerId),
      likeCount: likes.length,
    });
    setEditTitle(postRow.title);
    setEditBody(postRow.body);
    setComments(
      commentRows.map((comment) => ({
        ...comment,
        author: identities.get(comment.author_id) || null,
      })),
    );
  }

  useEffect(() => {
    if (id) void load();
  }, [id]);

  async function ensureViewer() {
    if (viewerId) return viewerId;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const currentViewerId = user?.id || "";
    setViewerId(currentViewerId);
    return currentViewerId;
  }

  async function addComment(e: FormEvent) {
    e.preventDefault();
    const currentViewerId = await ensureViewer();
    if (!currentViewerId) return setMsg("Sign in first");

    const { error } = await supabase.from("comments").insert({ post_id: id, author_id: currentViewerId, body });
    if (error) return setMsg(error.message);

    setBody("");
    setMsg("Comment added");
    await load();
  }

  async function toggleLike() {
    if (!post) return;
    const currentViewerId = await ensureViewer();
    if (!currentViewerId) return setMsg("Sign in first");

    setBusy(true);
    const { error } = post.likedByViewer
      ? await supabase.from("likes").delete().eq("post_id", post.id).eq("user_id", currentViewerId)
      : await supabase.from("likes").insert({ post_id: post.id, user_id: currentViewerId });
    setBusy(false);

    if (error && !error.message.toLowerCase().includes("duplicate")) return setMsg(error.message);
    if (error) {
      await load();
      return;
    }

    setPost((currentPost) =>
      currentPost
        ? {
            ...currentPost,
            likedByViewer: !currentPost.likedByViewer,
            likeCount: Math.max(0, currentPost.likeCount + (currentPost.likedByViewer ? -1 : 1)),
          }
        : currentPost,
    );
    setMsg(post.likedByViewer ? "Like removed" : "Post liked");
  }

  async function savePost(e: FormEvent) {
    e.preventDefault();
    if (!post) return;

    const trimmedTitle = editTitle.trim();
    const trimmedBody = editBody.trim();
    if (!trimmedTitle || !trimmedBody) return setMsg("Title and body are required.");

    setBusy(true);
    const { error } = await supabase
      .from("posts")
      .update({ title: trimmedTitle, body: trimmedBody, updated_at: new Date().toISOString() })
      .eq("id", post.id);
    setBusy(false);

    if (error) return setMsg(error.message);

    setIsEditing(false);
    setMsg("Post updated");
    await load();
  }

  async function deletePost() {
    if (!post) return;
    if (!window.confirm("Delete this post? This will also remove its comments and likes.")) return;

    setBusy(true);
    const { error } = await supabase.from("posts").delete().eq("id", post.id);
    setBusy(false);
    if (error) return setMsg(error.message);

    router.push("/feed");
  }

  async function report(e: FormEvent) {
    e.preventDefault();
    const currentViewerId = await ensureViewer();
    if (!currentViewerId) return setMsg("Sign in first");

    const { error } = await supabase
      .from("reports")
      .insert({ reporter_id: currentViewerId, entity_type: "post", entity_id: id, reason });
    setMsg(error ? error.message : "Report submitted");
  }

  function startEditing() {
    if (!post) return;
    setEditTitle(post.title);
    setEditBody(post.body);
    setIsEditing(true);
    setMsg("");
  }

  function cancelEditing() {
    if (!post) return;
    setEditTitle(post.title);
    setEditBody(post.body);
    setIsEditing(false);
  }

  if (!post) return <p>Loading...</p>;

  const isOwner = viewerId === post.author_id;

  return (
    <div className="space-y-6">
      <article className="shell-card p-5 md:p-6">
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
          <form onSubmit={savePost} className="mt-4 space-y-3">
            <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            <textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} />
            <div className="flex flex-wrap gap-3">
              <button className="primary-button px-4 py-2 text-sm" disabled={busy}>
                Save
              </button>
              <button type="button" onClick={cancelEditing} className="secondary-button px-4 py-2 text-sm">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">{post.title}</h1>
            <p className="mt-3 whitespace-pre-wrap text-[15px] leading-7 text-slate-700">{post.body}</p>
          </>
        )}

        {!isEditing && (
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <button
              type="button"
              onClick={() => void toggleLike()}
              className={`${post.likedByViewer ? "primary-button" : "secondary-button"} px-4 py-2 text-sm`}
              disabled={busy}
            >
              {busy ? "Working..." : post.likedByViewer ? `Liked · ${post.likeCount}` : `Like · ${post.likeCount}`}
            </button>
            {isOwner && (
              <>
                <button type="button" onClick={startEditing} className="secondary-button px-4 py-2 text-sm">
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => void deletePost()}
                  className="secondary-button px-4 py-2 text-sm"
                  disabled={busy}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        )}
      </article>

      <form onSubmit={addComment} className="shell-card space-y-3 p-4 md:p-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Comments</h2>
          <p className="mt-1 text-sm soft-muted">Comments stay attributable so discussion feels like a real network, not an anonymous dump.</p>
        </div>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Add comment" />
        <button className="primary-button px-4 py-2 text-sm">Comment</button>
      </form>

      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="shell-card p-4">
            <div className="flex flex-wrap items-center gap-2 text-xs soft-muted">
              {comment.author ? (
                <Link href={`/u/${comment.author.handle}`} className="font-medium text-slate-700 hover:text-blue-700">
                  {comment.author.display_name} · @{comment.author.handle}
                </Link>
              ) : (
                <span className="font-medium text-slate-700">Unknown member</span>
              )}
              <span>{new Date(comment.created_at).toLocaleString()}</span>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{comment.body}</p>
          </div>
        ))}
      </div>

      <form id="report" onSubmit={report} className="shell-card space-y-3 p-4 md:p-5">
        <h2 className="text-lg font-semibold text-slate-900">Report post</h2>
        <select value={reason} onChange={(e) => setReason(e.target.value)}>
          <option value="spam">Spam</option>
          <option value="abuse">Abuse</option>
          <option value="off-topic">Off-topic</option>
        </select>
        <button className="primary-button px-4 py-2 text-sm">Submit report</button>
      </form>

      {msg && <p className="text-sm soft-muted">{msg}</p>}
    </div>
  );
}
