"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { GROUPS } from "@/data/groups";

export default function GroupsIndexPage() {
  const supabase = createClient();
  const [postCounts, setPostCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    async function loadCounts() {
      const { data } = await supabase
        .from("posts")
        .select("group_slug")
        .not("group_slug", "is", null);
      if (!data) return;
      const counts: Record<string, number> = {};
      for (const row of data) {
        if (row.group_slug) {
          counts[row.group_slug] = (counts[row.group_slug] || 0) + 1;
        }
      }
      setPostCounts(counts);
    }
    void loadCounts();
  }, []);

  return (
    <div className="space-y-8">
      <section className="page-grid">
        <div className="shell-card-strong p-6 md:p-8">
          <p className="eyebrow">Working Groups</p>
          <h1 className="section-title mt-3">Working Groups</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 soft-muted">
            Domain-focused communities for deep technical exchange. Each group has a dedicated feed, curated resources, and a member directory filtered to that discipline.
          </p>
        </div>
        <aside className="shell-card p-6">
          <p className="eyebrow mb-4">How groups work</p>
          <div className="space-y-3 text-sm leading-6 soft-muted">
            <p>Each working group has a discussion feed specific to that domain. Post questions, share insights, or ask for peer review on architecture decisions.</p>
            <p>Groups surface relevant artifacts from the library and members who list that domain in their profile.</p>
          </div>
        </aside>
      </section>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {GROUPS.map((g) => {
          const liveCount = postCounts[g.slug];
          return (
            <Link key={g.slug} href={`/g/${g.slug}`} className="shell-card p-6 block hover:border-blue-300 transition-colors group">
              <h2 className="text-lg font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">{g.name}</h2>
              <p className="mt-2 text-sm text-slate-600 leading-6 line-clamp-2">{g.description}</p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {g.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500 rounded border border-slate-200">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                <div className="flex gap-4">
                  <div>
                    <div className="text-xs font-bold text-slate-900">{liveCount !== undefined ? liveCount : "—"}</div>
                    <div className="text-[10px] uppercase text-slate-400 font-medium">Discussions</div>
                  </div>
                </div>
                <span className="text-xs font-medium text-blue-600 group-hover:underline">Open →</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
