"use client";
export const dynamic = 'force-dynamic';

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Post, PublicProfileSummary } from "@/lib/types";
import { GROUP_META } from "@/data/groups";

type GroupPost = Post & {
  author?: PublicProfileSummary | null;
  commentCount: number;
  likeCount: number;
};

export default function GroupFeedPage() {
  const { slug } = useParams<{ slug: string }>();
  const supabase = createClient();
  const [posts, setPosts] = useState<GroupPost[]>([]);
  const [viewerId, setViewerId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgTone, setMsgTone] = useState<"info" | "success" | "error">("info");
  const meta = GROUP_META[slug];

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("posts")
        .select("id,author_id,group_slug,title,body,created_at")
        .eq("group_slug", slug)
        .order("created_at", { ascending: false })
        .limit(50);
      
      const postRows = (data || []) as Post[];
      if (postRows.length === 0) {
        setPosts([]);
        return;
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      setViewerId(user?.id || "");

      const authorIds = [...new Set(postRows.map(p => p.author_id))];
      const postIds = postRows.map(p => p.id);
      
      const [{ data: authors }, { data: comments }, { data: likes }] = await Promise.all([
        supabase.from("profile_identities").select("id,handle,display_name").in("id", authorIds),
        supabase.from("comments").select("post_id").in("post_id", postIds),
        supabase.from("likes").select("post_id").in("post_id", postIds)
      ]);
      
      const authorMap = new Map((authors as PublicProfileSummary[] || []).map(a => [a.id, a]));
      
      const commentCounts = new Map<string, number>();
      (comments || []).forEach(c => commentCounts.set(c.post_id, (commentCounts.get(c.post_id) || 0) + 1));
      
      const likeCounts = new Map<string, number>();
      (likes || []).forEach(l => likeCounts.set(l.post_id, (likeCounts.get(l.post_id) || 0) + 1));
      
      setPosts(postRows.map(p => ({
        ...p,
        author: authorMap.get(p.author_id) || null,
        commentCount: commentCounts.get(p.id) || 0,
        likeCount: likeCounts.get(p.id) || 0
      })));
    }
    
    void load();
  }, [slug]);

  async function createPost(e: FormEvent) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMsgTone("error");
      return setMsg("Sign in first on /onboarding to start a discussion.");
    }
    if (!title.trim() || !body.trim()) {
      setMsgTone("error");
      return setMsg("Title and body are required.");
    }
    setBusy(true);
    const { error } = await supabase.from("posts").insert({ author_id: user.id, title, body, group_slug: slug });
    setBusy(false);
    if (error) {
      setMsgTone("error");
      return setMsg(error.message);
    }
    setTitle("");
    setBody("");
    setMsgTone("success");
    setMsg("Discussion posted.");
    const { data: { user: u } } = await supabase.auth.getUser();
    setViewerId(u?.id || "");
    // reload posts
    const { data } = await supabase
      .from("posts")
      .select("id,author_id,group_slug,title,body,created_at,updated_at")
      .eq("group_slug", slug)
      .order("created_at", { ascending: false })
      .limit(50);
    const postRows = (data || []) as Post[];
    if (postRows.length === 0) { setPosts([]); return; }
    const authorIds = [...new Set(postRows.map(p => p.author_id))];
    const postIds = postRows.map(p => p.id);
    const [{ data: authors }, { data: comments }, { data: likes }] = await Promise.all([
      supabase.from("profile_identities").select("id,handle,display_name").in("id", authorIds),
      supabase.from("comments").select("post_id").in("post_id", postIds),
      supabase.from("likes").select("post_id").in("post_id", postIds)
    ]);
    const authorMap = new Map(((authors as PublicProfileSummary[]) || []).map(a => [a.id, a]));
    const commentCounts = new Map<string, number>();
    (comments || []).forEach((c: { post_id: string }) => commentCounts.set(c.post_id, (commentCounts.get(c.post_id) || 0) + 1));
    const likeCounts = new Map<string, number>();
    (likes || []).forEach((l: { post_id: string }) => likeCounts.set(l.post_id, (likeCounts.get(l.post_id) || 0) + 1));
    setPosts(postRows.map(p => ({
      ...p,
      author: authorMap.get(p.author_id) || null,
      commentCount: commentCounts.get(p.id) || 0,
      likeCount: likeCounts.get(p.id) || 0
    })));
  }

  if (!meta) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">Group not found</h1>
        <Link href="/g" className="text-blue-700 hover:underline mt-4 block">Back to all groups</Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sidebar - Desktop, Top - Mobile */}
      <aside className="lg:col-span-4 space-y-6">
        <div className="shell-card-strong p-6 sticky top-6">
          <div className="flex gap-2 mb-6">
            <Link href="/g" className="pill hover:bg-slate-200">← All Groups</Link>
            <span className="pill bg-blue-50 text-blue-700">{meta.name}</span>
          </div>
          
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{meta.name}</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
            {meta.description}
          </p>

          <div className="mt-6 flex flex-wrap gap-1.5">
            {meta.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500 rounded border border-slate-200">
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Resources</h3>
            <ul className="mt-4 space-y-3">
              {meta.resources.map((res, i) => (
                <li key={i}>
                  <a 
                    href={res.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-slate-700 hover:text-blue-700 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 group-hover:bg-blue-600 transition-colors" />
                    {res.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Active Members</span>
              <span className="font-bold text-slate-900">{meta.memberCount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm mt-2">
              <span className="text-slate-500">Total Discussions</span>
              <span className="font-bold text-slate-900">{meta.postCount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Feed */}
      <section className="lg:col-span-8 space-y-4">
        <div className="shell-card p-4 mb-2">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Discussion Feed</h2>
        </div>

        {viewerId && (
          <form onSubmit={createPost} className="shell-card space-y-4 p-5 md:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Start a discussion</h3>
                <p className="mt-1 text-sm soft-muted">Post a question, insight, or challenge for this group.</p>
              </div>
              <button disabled={busy} className="primary-button px-4 py-2.5 disabled:opacity-60">
                {busy ? "Publishing..." : "Publish"}
              </button>
            </div>
            <input placeholder="Discussion title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <textarea placeholder="Share a systems engineering insight relevant to this group..." value={body} onChange={(e) => setBody(e.target.value)} />
          </form>
        )}

        {!viewerId && (
          <div className="shell-card p-4 text-sm text-slate-600 flex items-center justify-between gap-4">
            <span>Sign in to start a discussion in this working group.</span>
            <Link href="/onboarding" className="primary-button px-4 py-2 text-sm shrink-0">Sign in</Link>
          </div>
        )}

        {msg && (
          <div className={`rounded-2xl border px-4 py-3 text-sm ${msgTone === "error" ? "border-rose-200 bg-rose-50 text-rose-700" : msgTone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-blue-200 bg-blue-50 text-blue-700"}`}>
            {msg}
          </div>
        )}

        {posts.length === 0 ? (
          <div className="shell-card p-12 text-center">
            <div className="mx-auto w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 border border-slate-100 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785 0.5 0.5 0 0 0 .412.822c1.27-.013 2.488-.417 3.553-1.154a0.707 0.707 0 0 1 .752-.086c.633.33 1.343.522 2.098.522Z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-900">The {meta.name} feed is quiet</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 soft-muted">
              Connect with fellow {meta.slug} specialists. Share a challenge, a recent breakthrough, or ask for peer review on an architecture decision.
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <article key={post.id} className="shell-card p-5 md:p-6 hover:border-slate-300 transition-colors">
              <div className="flex flex-wrap items-center gap-2">
                {post.author && (
                  <Link href={`/u/${post.author.handle}`} className="text-xs font-bold text-slate-800 hover:text-blue-700">
                    {post.author.display_name}
                  </Link>
                )}
                <span className="text-xs soft-muted">· {new Date(post.created_at).toLocaleDateString()}</span>
              </div>
              <Link
                href={`/post/${post.id}`}
                className="mt-3 block text-xl font-bold tracking-tight text-slate-900 hover:text-blue-700 transition-colors"
              >
                {post.title}
              </Link>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-600 line-clamp-3">{post.body}</p>
              
              <div className="mt-6 flex gap-4 text-xs font-bold text-slate-400">
                <span className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V3a.75.75 0 0 1 .75-.75A2.25 2.25 0 0 1 16.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
                  </svg>
                  {post.likeCount}
                </span>
                <span className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785 0.5 0.5 0 0 0 .412.822c1.27-.013 2.488-.417 3.553-1.154a0.707 0.707 0 0 1 .752-.086c.633.33 1.343.522 2.098.522Z" />
                  </svg>
                  {post.commentCount}
                </span>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
