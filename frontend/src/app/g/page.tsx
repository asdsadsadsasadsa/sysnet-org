"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { GROUPS } from "@/data/groups";

export default function GroupsIndexPage() {
  const supabase = createClient();
  const [postCounts, setPostCounts] = useState<Record<string, number>>({});
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    async function loadCounts() {
      const [{ data: postData }, { data: memberData }] = await Promise.all([
        supabase.from("posts").select("group_slug").not("group_slug", "is", null),
        supabase.from("profiles").select("domains,tags").eq("visibility", "public"),
      ]);

      if (postData) {
        const counts: Record<string, number> = {};
        for (const row of postData) {
          if (row.group_slug) counts[row.group_slug] = (counts[row.group_slug] || 0) + 1;
        }
        setPostCounts(counts);
      }

      if (memberData) {
        const mCounts: Record<string, number> = {};
        for (const group of GROUPS) {
          const norm = group.slug.toLowerCase().replace(/-/g, " ");
          mCounts[group.slug] = memberData.filter((m: { domains: string[]; tags: string[] }) =>
            [...(m.domains || []), ...(m.tags || [])].some((v) => {
              const vn = v.toLowerCase().replace(/-/g, " ").trim();
              return vn === norm || vn.includes(norm);
            })
          ).length;
        }
        setMemberCounts(mCounts);
      }
    }
    void loadCounts();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {GROUPS.map((g) => {
          const liveCount = postCounts[g.slug];
          const liveMemberCount = memberCounts[g.slug];
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
                  {liveMemberCount !== undefined && liveMemberCount > 0 && (
                    <div>
                      <div className="text-xs font-bold text-slate-900">{liveMemberCount}</div>
                      <div className="text-[10px] uppercase text-slate-400 font-medium">Members</div>
                    </div>
                  )}
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
