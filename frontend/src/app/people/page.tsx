"use client";
export const dynamic = 'force-dynamic';

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
      .select("id,handle,display_name,headline,bio,location,timezone,domains,tags,open_to")
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
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Member Directory</h1>
      <div className="flex flex-wrap gap-2">
        <input className="rounded border px-3 py-2" placeholder="Search tags, headline, domain" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="rounded border px-3 py-2" value={openTo} onChange={(e) => setOpenTo(e.target.value)}>
          <option value="">All availability</option>
          <option value="mentoring">Mentoring</option>
          <option value="consulting">Consulting</option>
          <option value="hiring">Hiring</option>
        </select>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((p) => (
          <article key={p.id} className="rounded-xl border bg-white p-4">
            <Link href={`/u/${p.handle}`} className="font-semibold hover:underline">{p.display_name}</Link>
            <p className="text-sm text-slate-600">{p.headline || "Systems Engineer"}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(p.tags || []).slice(0, 6).map((t) => <span key={t} className="rounded bg-slate-100 px-2 py-1 text-xs">{t}</span>)}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}