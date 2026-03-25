"use client";
export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

export default function PeoplePage() {
  const supabase = createClient();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [q, setQ] = useState("");
  const [openTo, setOpenTo] = useState("");

  useEffect(() => {
    supabase
      .from("profiles")
      .select("id,handle,display_name,visibility,headline,bio,location,timezone,domains,tags,open_to")
      .eq("visibility", "public")
      .limit(200)
      .then(({ data }) => setProfiles((data || []) as Profile[]));
  }, [supabase]);

  const filtered = useMemo(() => {
    return profiles.filter((p) => {
      const hay = `${p.display_name} ${p.headline || ""} ${(p.tags || []).join(" ")} ${(p.domains || []).join(" ")}`.toLowerCase();
      const qOk = !q || hay.includes(q.toLowerCase());
      const oOk = !openTo || (p.open_to || []).includes(openTo);
      return qOk && oOk;
    });
  }, [profiles, q, openTo]);

  return (
    <div className="space-y-6">
      <section className="page-grid">
        <div className="shell-card-strong p-6 md:p-8">
          <p className="eyebrow">Expert discovery</p>
          <h1 className="section-title mt-3">Member directory</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 soft-muted">
            Search by domain, tooling, and availability to find engineers working in your area of practice.
          </p>
        </div>
        <div className="shell-card p-6">
          <p className="eyebrow">Filter</p>
          <div className="mt-4 space-y-3">
            <input placeholder="Search tags, headline, domain" value={q} onChange={(e) => setQ(e.target.value)} />
            <select value={openTo} onChange={(e) => setOpenTo(e.target.value)}>
              <option value="">All availability</option>
              <option value="mentoring">Mentoring</option>
              <option value="consulting">Consulting</option>
              <option value="hiring">Hiring</option>
            </select>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.length === 0 ? (
          <div className="shell-card p-8 md:col-span-2">
            <h2 className="text-lg font-semibold text-slate-900">No matching profiles</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 soft-muted">
              {q || openTo
                ? "No profiles match your current filters. Try adjusting your search or clearing the availability filter."
                : "No public profiles yet. Be the first to add yours — complete your profile on the onboarding page."}
            </p>
            {!q && !openTo && (
              <div className="mt-4 flex flex-wrap gap-3">
                <a href="/onboarding" className="secondary-button px-4 py-2 text-sm">Complete your profile</a>
              </div>
            )}
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
                {(p.open_to || []).slice(0, 1).map((state) => (
                  <span key={state} className="pill">
                    {state}
                  </span>
                ))}
              </div>
              {p.location && <p className="mt-3 text-sm soft-muted">{p.location}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                {(p.tags || []).slice(0, 6).map((t) => (
                  <span key={t} className="pill">
                    {t}
                  </span>
                ))}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
