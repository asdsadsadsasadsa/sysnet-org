"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Post, PublicProfileSummary } from "@/lib/types";

type GroupPost = Post & {
  author?: PublicProfileSummary | null;
  commentCount: number;
  likeCount: number;
};

const GROUP_META: Record<string, { name: string, description: string }> = {
  mbse: { name: "Model-Based Systems Engineering", description: "SysML, Capella, DOORS, and the transition from documents to models." },
  aerospace: { name: "Aerospace & Defense", description: "Safety-critical systems, DO-178C, and mission planning." },
  embedded: { name: "Embedded Systems", description: "Hardware/software integration, RTOS, and physical interfaces." },
  medical: { name: "Medical Devices", description: "Regulated environments, risk management, and ISO 13485." },
  robotics: { name: "Robotics & Autonomy", description: "Perception, planning, safety envelopes, and sensor fusion." }
};

export default function GroupFeedPage() {
  const { slug } = useParams<{ slug: string }>();
  const supabase = createClient();
  const [posts, setPosts] = useState<GroupPost[]>([]);
  const meta = GROUP_META[slug] || { name: slug, description: "Community discussion space." };

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
    
    load();
  }, [slug]);

  return (
    <div className="space-y-6">
      <section className="page-grid">
        <div className="shell-card-strong p-6 md:p-8">
          <div className="flex gap-2">
            <Link href="/g" className="pill hover:bg-slate-200">← All Groups</Link>
            <span className="pill bg-blue-50 text-blue-700">Domain Space</span>
          </div>
          <h1 className="section-title mt-4">{meta.name}</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 soft-muted">
            {meta.description}
          </p>
        </div>
      </section>

      <section className="space-y-4">
        {posts.length === 0 ? (
          <div className="shell-card p-8 text-center">
            <h2 className="text-lg font-semibold text-slate-900">No posts in this space yet</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 soft-muted">
              Be the first to start a domain-specific discussion here.
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <article key={post.id} className="shell-card p-5 md:p-6">
              <div className="flex flex-wrap items-center gap-2">
                {post.author && (
                  <Link href={`/u/${post.author.handle}`} className="text-xs font-medium text-slate-700 hover:text-blue-700">
                    {post.author.display_name}
                  </Link>
                )}
                <span className="text-xs soft-muted">· {new Date(post.created_at).toLocaleDateString()}</span>
              </div>
              <Link
                href={`/post/${post.id}`}
                className="mt-3 block text-lg font-semibold tracking-tight text-slate-900 hover:text-blue-700"
              >
                {post.title}
              </Link>
              <p className="mt-2 text-[15px] leading-6 text-slate-600 line-clamp-2">{post.body}</p>
              
              <div className="mt-4 flex gap-4 text-xs font-medium text-slate-500">
                <span>{post.likeCount} {post.likeCount === 1 ? 'like' : 'likes'}</span>
                <span>{post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}</span>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
