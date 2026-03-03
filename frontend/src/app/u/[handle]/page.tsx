"use client";
export const dynamic = 'force-dynamic';

 

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

export default function ProfilePage() {
  const { handle } = useParams<{ handle: string }>();
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    supabase
      .from("profiles")
      .select("id,handle,display_name,headline,bio,location,timezone,domains,tags,open_to")
      .eq("handle", handle)
      .maybeSingle()
      .then(({ data }) => setProfile((data as Profile) || null));
  }, [handle]);

  async function connect(e: FormEvent) {
    e.preventDefault();
    if (!profile) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setMsg("Sign in first");
    const { error } = await supabase.from("connection_requests").insert({ from_user: user.id, to_user: profile.id, status: "pending" });
    setMsg(error ? error.message : "Connection request sent");
  }

  if (!profile) return <p>Profile not found.</p>;

  return (
    <div className="space-y-4 rounded-xl border bg-white p-6">
      <h1 className="text-2xl font-semibold">@{profile.handle}</h1>
      <p className="text-lg">{profile.display_name}</p>
      <p className="text-slate-600">{profile.headline}</p>
      <p className="text-sm text-slate-600">{profile.location}</p>
      <div className="flex flex-wrap gap-2">{(profile.tags || []).map((t) => <span key={t} className="rounded bg-slate-100 px-2 py-1 text-xs">{t}</span>)}</div>
      <form onSubmit={connect}><button className="rounded bg-slate-900 px-3 py-2 text-white">Connect</button></form>
      {msg && <p className="text-sm text-slate-600">{msg}</p>}
    </div>
  );
}