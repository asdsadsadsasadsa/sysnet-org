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
    <div className="space-y-6">
      <section className="page-grid">
        <div className="shell-card-strong p-6 md:p-8">
          <p className="eyebrow">Working Groups</p>
          <h1 className="section-title mt-3">Working Groups</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 soft-muted">
            Specialized spaces for domain-specific patterns and discussions. Each working group focuses on deep, contextual problem solving within a specific engineering chapter.
          </p>
        </div>
      </section>

      <section className="shell-card p-6 md:p-8">
        <h2 className="text-xl font-bold text-slate-900">Find your domain</h2>
        <p className="mt-2 text-sm text-slate-600">
          Connect with specialists in your field, share domain-specific artifacts, and stay updated on relevant standards.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {GROUPS.map((g) => (
          <Link key={g.slug} href={`/g/${g.slug}`} className="shell-card p-6 block hover:border-blue-300 transition-colors group">
            <h2 className="text-lg font-semibold text-slate-900 group-hover:text-blue-700">{g.name}</h2>
            <p className="mt-2 text-sm text-slate-600 leading-6 line-clamp-2">{g.description}</p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {g.tags.slice(0, 3).map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500 rounded border border-slate-200">
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-6 flex items-center border-t border-slate-100 pt-4">
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-xs font-bold text-slate-900">{g.memberCount.toLocaleString()}</div>
                  <div className="text-[10px] uppercase text-slate-400 font-medium">Members</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-bold text-slate-900">{(postCounts[g.slug] ?? g.postCount).toLocaleString()}</div>
                  <div className="text-[10px] uppercase text-slate-400 font-medium">Discussions</div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
