"use client";
export const dynamic = 'force-dynamic';

 

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Post } from "@/lib/types";

export default function GroupFeedPage() {
  const { slug } = useParams<{ slug: string }>();
  const supabase = createClient();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    supabase
      .from("posts")
      .select("id,author_id,group_slug,title,body,created_at")
      .eq("group_slug", slug)
      .order("created_at", { ascending: false })
      .then(({ data }) => setPosts((data || []) as Post[]));
  }, [slug]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Group: {slug}</h1>
      {posts.map((p) => (
        <article key={p.id} className="rounded border bg-white p-4">
          <Link className="font-semibold hover:underline" href={`/post/${p.id}`}>{p.title}</Link>
          <p className="mt-2 text-slate-700">{p.body}</p>
        </article>
      ))}
    </div>
  );
}