"use client";
export const dynamic = 'force-dynamic';

 

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Comment = { id: string; body: string; created_at: string };

export default function PostPage() {
  const { id } = useParams<{ id: string }>();
  const supabase = createClient();
  const [post, setPost] = useState<{ title: string; body: string } | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState("");
  const [reason, setReason] = useState("spam");
  const [msg, setMsg] = useState("");

  async function load() {
    const { data: p } = await supabase.from("posts").select("title,body").eq("id", id).maybeSingle();
    setPost((p as { title: string; body: string }) || null);
    const { data: c } = await supabase
      .from("comments")
      .select("id,body,created_at")
      .eq("post_id", id)
      .order("created_at", { ascending: true });
    setComments((c || []) as Comment[]);
  }

  useEffect(() => {
    if (id) load();
  }, [id]);

  async function addComment(e: FormEvent) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setMsg("Sign in first");
    const { error } = await supabase.from("comments").insert({ post_id: id, author_id: user.id, body });
    if (error) return setMsg(error.message);
    setBody("");
    await load();
  }

  async function report(e: FormEvent) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setMsg("Sign in first");
    const { error } = await supabase.from("reports").insert({ reporter_id: user.id, entity_type: "post", entity_id: id, reason });
    setMsg(error ? error.message : "Report submitted");
  }

  if (!post) return <p>Loading...</p>;

  return (
    <div className="space-y-4">
      <article className="rounded-xl border bg-white p-5">
        <h1 className="text-2xl font-semibold">{post.title}</h1>
        <p className="mt-2 text-slate-700">{post.body}</p>
      </article>

      <form onSubmit={addComment} className="rounded-xl border bg-white p-4 space-y-2">
        <h2 className="font-semibold">Comments</h2>
        <textarea className="w-full rounded border px-3 py-2" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Add comment" />
        <button className="rounded bg-slate-900 px-3 py-2 text-white">Comment</button>
      </form>

      <div className="space-y-2">
        {comments.map((c) => (
          <div key={c.id} className="rounded border bg-white p-3 text-sm">{c.body}</div>
        ))}
      </div>

      <form id="report" onSubmit={report} className="rounded-xl border bg-white p-4 space-y-2">
        <h2 className="font-semibold">Report post</h2>
        <select className="rounded border px-3 py-2" value={reason} onChange={(e) => setReason(e.target.value)}>
          <option value="spam">Spam</option>
          <option value="abuse">Abuse</option>
          <option value="off-topic">Off-topic</option>
        </select>
        <button className="rounded bg-slate-900 px-3 py-2 text-white">Submit report</button>
      </form>

      {msg && <p className="text-sm text-slate-600">{msg}</p>}
    </div>
  );
}