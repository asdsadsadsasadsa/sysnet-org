"use client";
export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

export default function MentorsPage() {
  const supabase = createClient();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    supabase
      .from("profiles")
      .select("id,handle,display_name,visibility,headline,bio,location,timezone,domains,tags,open_to")
      .eq("visibility", "public")
      // Currently filtering in memory since open_to is a text[] and Supabase JS .contains is sometimes tricky
      // depending on how the array was inserted. We fetch a broader set and filter on the client.
      .limit(500)
      .then(({ data }) => {
        const allProfiles = (data || []) as Profile[];
        // Filter strictly for those open to mentoring
        const mentors = allProfiles.filter(p => (p.open_to || []).includes("mentoring"));
        setProfiles(mentors);
      });
  }, [supabase]);

  const filtered = useMemo(() => {
    return profiles.filter((p) => {
      const hay = `${p.display_name} ${p.headline || ""} ${(p.tags || []).join(" ")} ${(p.domains || []).join(" ")}`.toLowerCase();
      return !q || hay.includes(q.toLowerCase());
    });
  }, [profiles, q]);

  return (
    <div className="space-y-6">
      <section className="page-grid">
        <div className="shell-card-strong p-6 md:p-8">
          <p className="eyebrow">Mentorship</p>
          <h1 className="section-title mt-3">Find a mentor</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 soft-muted">
            Engineers listed here have indicated they are open to mentoring. Search by domain or tooling to find someone relevant to your work.
          </p>
        </div>
        <div className="shell-card p-6">
          <p className="eyebrow">Search</p>
          <div className="mt-4 space-y-3">
            <input placeholder="Search domains (e.g. aerospace) or tags (e.g. sysml)" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="mt-5 space-y-3 text-sm leading-6 soft-muted">
            <p>Reach out with a specific question or context about what you are working on — not a generic request for mentorship.</p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.length === 0 ? (
          <div className="shell-card p-8 md:col-span-2 text-center">
            <h2 className="text-lg font-semibold text-slate-900">No mentors found</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 soft-muted mx-auto">
              We couldn't find any mentors matching your search. Try broadening your criteria.
            </p>
          </div>
        ) : (
          filtered.map((p) => (
            <article key={p.id} className="shell-card p-5 md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link href={`/u/${p.handle}`} className="text-lg font-semibold tracking-tight text-slate-900 hover:text-blue-700">
                    {p.display_name}
                  </Link>
                  <p className="mt-1 text-sm soft-muted">{p.headline || "Systems engineer"}</p>
                </div>
                <Link href={`/u/${p.handle}`} className="secondary-button whitespace-nowrap text-xs px-3 py-1.5">
                  View Profile
                </Link>
              </div>
              
              <div className="mt-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Expertise</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(p.domains || []).slice(0, 3).map((d) => (
                    <span key={d} className="pill bg-blue-50/50 text-blue-700 border-blue-100/50">
                      {d}
                    </span>
                  ))}
                  {(p.tags || []).slice(0, 3).map((t) => (
                    <span key={t} className="pill">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
