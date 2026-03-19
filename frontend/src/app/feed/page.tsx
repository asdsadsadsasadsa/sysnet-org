"use client";
export const dynamic = "force-dynamic";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Post } from "@/lib/types";

export default function FeedPage() {
  const supabase = createClient();
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    const { data } = await supabase
      .from("posts")
      .select("id,author_id,group_slug,title,body,created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    setPosts((data || []) as Post[]);
  }

  useEffect(() => {
    load();
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

  async function like(postId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return setMsg("Sign in first");
    const { error } = await supabase.from("likes").insert({ post_id: postId, user_id: user.id });
    if (error && !error.message.toLowerCase().includes("duplicate")) setMsg(error.message);
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
        </aside>
      </section>

      <form onSubmit={createPost} className="shell-card p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Start a discussion</h2>
            <p className="mt-1 text-sm soft-muted">Post a concrete systems engineering insight, question, or pattern.</p>
          </div>
          <button className="primary-button px-4 py-2.5">Publish</button>
        </div>
        <input
          placeholder="Post title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
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
          posts.map((p) => (
            <article key={p.id} className="shell-card p-5 md:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="pill">Systems note</span>
                {p.created_at && <span className="text-xs soft-muted">{new Date(p.created_at).toLocaleString()}</span>}
              </div>
              <Link href={`/post/${p.id}`} className="mt-4 block text-xl font-semibold tracking-tight text-slate-900 hover:text-blue-700">
                {p.title}
              </Link>
              <p className="mt-3 whitespace-pre-wrap text-[15px] leading-7 text-slate-700">{p.body}</p>
              <div className="mt-5 flex gap-3 text-sm">
                <button onClick={() => like(p.id)} className="secondary-button px-4 py-2 text-sm">
                  Like
                </button>
                <Link href={`/post/${p.id}`} className="secondary-button px-4 py-2 text-sm">
                  Comment
                </Link>
                <Link href={`/post/${p.id}#report`} className="secondary-button px-4 py-2 text-sm">
                  Report
                </Link>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
