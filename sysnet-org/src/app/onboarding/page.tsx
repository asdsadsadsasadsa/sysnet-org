"use client";
export const dynamic = 'force-dynamic';

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function OnboardingPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [handle, setHandle] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [headline, setHeadline] = useState("");
  const [location, setLocation] = useState("");
  const [domains, setDomains] = useState("Systems");
  const [tags, setTags] = useState("MBSE,SysML");
  const [openTo, setOpenTo] = useState("mentoring");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id || "";
      setUserId(uid);
      if (!uid) return;
      supabase
        .from("profiles")
        .select("handle,display_name,headline,location,domains,tags,open_to")
        .eq("id", uid)
        .maybeSingle()
        .then(({ data: p }) => {
          if (!p) return;
          setHandle(p.handle || "");
          setDisplayName(p.display_name || "");
          setHeadline(p.headline || "");
          setLocation(p.location || "");
          setDomains((p.domains || []).join(","));
          setTags((p.tags || []).join(","));
          setOpenTo((p.open_to || []).join(","));
        });
    });
  }, [supabase]);

  async function sendMagicLink(e: FormEvent) {
    e.preventDefault();
    setMsg("Sending magic link...");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/onboarding` },
    });
    setMsg(error ? error.message : "Magic link sent. Check your email.");
  }

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    if (!userId) return setMsg("Sign in first.");
    const payload = {
      id: userId,
      handle: handle.toLowerCase().trim(),
      display_name: displayName.trim(),
      headline: headline.trim(),
      location: location.trim(),
      domains: domains.split(",").map((s) => s.trim()).filter(Boolean),
      tags: tags.split(",").map((s) => s.trim()).filter(Boolean),
      open_to: openTo.split(",").map((s) => s.trim()).filter(Boolean),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("profiles").upsert(payload);
    setMsg(error ? error.message : "Profile saved.");
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <form onSubmit={sendMagicLink} className="rounded-xl border bg-white p-6 space-y-3">
        <h1 className="text-xl font-semibold">Step 1: Sign in</h1>
        <input className="w-full rounded border px-3 py-2" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button className="rounded bg-slate-900 px-4 py-2 text-white">Send magic link</button>
      </form>

      <form onSubmit={saveProfile} className="rounded-xl border bg-white p-6 space-y-3">
        <h2 className="text-xl font-semibold">Step 2: Create profile</h2>
        <input className="w-full rounded border px-3 py-2" placeholder="handle" value={handle} onChange={(e) => setHandle(e.target.value)} />
        <input className="w-full rounded border px-3 py-2" placeholder="display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        <input className="w-full rounded border px-3 py-2" placeholder="headline" value={headline} onChange={(e) => setHeadline(e.target.value)} />
        <input className="w-full rounded border px-3 py-2" placeholder="location" value={location} onChange={(e) => setLocation(e.target.value)} />
        <input className="w-full rounded border px-3 py-2" placeholder="domains csv" value={domains} onChange={(e) => setDomains(e.target.value)} />
        <input className="w-full rounded border px-3 py-2" placeholder="tags csv" value={tags} onChange={(e) => setTags(e.target.value)} />
        <input className="w-full rounded border px-3 py-2" placeholder="open_to csv" value={openTo} onChange={(e) => setOpenTo(e.target.value)} />
        <button className="rounded bg-slate-900 px-4 py-2 text-white">Save profile</button>
      </form>

      {msg && <p className="md:col-span-2 text-sm text-slate-600">{msg}</p>}
    </div>
  );
}