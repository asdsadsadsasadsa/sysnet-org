"use client";
export const dynamic = 'force-dynamic';

 

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
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Global Feed</h1>
      <form onSubmit={createPost} className="rounded-xl border bg-white p-4 space-y-2">
        <input className="w-full rounded border px-3 py-2" placeholder="Post title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="w-full rounded border px-3 py-2" placeholder="Share a practical systems engineering insight..." value={body} onChange={(e) => setBody(e.target.value)} />
        <button className="rounded bg-slate-900 px-3 py-2 text-white">Publish</button>
      </form>
      {msg && <p className="text-sm text-slate-600">{msg}</p>}
      {posts.map((p) => (
        <article key={p.id} className="rounded-xl border bg-white p-4">
          <Link href={`/post/${p.id}`} className="font-semibold hover:underline">{p.title}</Link>
          <p className="mt-2 text-slate-700">{p.body}</p>
          <div className="mt-3 flex gap-3 text-sm">
            <button onClick={() => like(p.id)} className="text-slate-600 hover:text-slate-900">Like</button>
            <Link href={`/post/${p.id}`} className="text-slate-600 hover:text-slate-900">Comment</Link>
            <Link href={`/post/${p.id}#report`} className="text-slate-600 hover:text-slate-900">Report</Link>
          </div>
        </article>
      ))}
    </div>
  );
}