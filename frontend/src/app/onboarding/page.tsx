"use client";
export const dynamic = 'force-dynamic';

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { normalizeHandle, parseCsvList } from "@/lib/profile-utils";
import { sanitizeOpenTo } from "@/lib/open-to";

export default function OnboardingPage() {
  const supabase = createClient();
  const [authState, setAuthState] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string>("");
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [handle, setHandle] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [headline, setHeadline] = useState("");
  const [location, setLocation] = useState("");
  const [domains, setDomains] = useState("Systems");
  const [tags, setTags] = useState("MBSE,SysML");
  const [openTo, setOpenTo] = useState("mentoring");
  const [hasProfile, setHasProfile] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id || "";
      setUserId(uid);
      if (!uid) {
        setHasProfile(false);
        setAuthChecked(true);
        return;
      }
      supabase
        .from("profiles")
        .select("handle,display_name,headline,location,domains,tags,open_to")
        .eq("id", uid)
        .maybeSingle()
        .then(({ data: p }) => {
          if (!p) {
            setHasProfile(false);
            setAuthChecked(true);
            return;
          }
          setHasProfile(true);
          setHandle(p.handle || "");
          setDisplayName(p.display_name || "");
          setHeadline(p.headline || "");
          setLocation(p.location || "");
          setDomains((p.domains || []).join(","));
          setTags((p.tags || []).join(","));
          setOpenTo((p.open_to || []).join(","));
          setAuthChecked(true);
        });
    });
  }, [supabase]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const value = new URLSearchParams(window.location.search).get("auth");
    setAuthState(value);
  }, []);

  async function sendMagicLink(e: FormEvent) {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setMsg("Sending magic link...");
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${siteUrl}/auth/callback` },
    });
    setMsg(error ? error.message : "Magic link sent. Check your email.");
    setSending(false);
  }

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    if (!userId) return setMsg("Sign in first.");
    const normalizedHandle = normalizeHandle(handle);
    if (!normalizedHandle) {
      return setMsg("Handle is invalid. Use letters, numbers, underscore, and dashes.");
    }

    const payload = {
      id: userId,
      handle: normalizedHandle,
      display_name: displayName.trim(),
      headline: headline.trim(),
      location: location.trim(),
      domains: parseCsvList(domains),
      tags: parseCsvList(tags),
      open_to: sanitizeOpenTo(parseCsvList(openTo, { maxItems: 6, maxLen: 24 })),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("profiles").upsert(payload);
    setMsg(error ? error.message : "Profile saved.");
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {!userId && (
        <form onSubmit={sendMagicLink} className="rounded-xl border bg-white p-6 space-y-3 md:col-span-2">
          <h1 className="text-xl font-semibold">Step 1: Sign in</h1>
          <input
            type="email"
            required
            className="w-full rounded border px-3 py-2"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="submit"
            disabled={sending}
            className="w-full rounded bg-slate-900 px-4 py-2 text-white active:scale-[0.99] disabled:opacity-60"
          >
            {sending ? "Sending..." : "Send magic link"}
          </button>
        </form>
      )}

      {userId && authChecked && !hasProfile && (
        <form onSubmit={saveProfile} className="rounded-xl border bg-white p-6 space-y-3 md:col-span-2">
          <h2 className="text-xl font-semibold">Create profile</h2>
          <input className="w-full rounded border px-3 py-2" placeholder="handle" value={handle} onChange={(e) => setHandle(e.target.value)} />
          <input className="w-full rounded border px-3 py-2" placeholder="display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          <input className="w-full rounded border px-3 py-2" placeholder="headline" value={headline} onChange={(e) => setHeadline(e.target.value)} />
          <input className="w-full rounded border px-3 py-2" placeholder="location" value={location} onChange={(e) => setLocation(e.target.value)} />
          <input className="w-full rounded border px-3 py-2" placeholder="domains csv" value={domains} onChange={(e) => setDomains(e.target.value)} />
          <input className="w-full rounded border px-3 py-2" placeholder="tags csv" value={tags} onChange={(e) => setTags(e.target.value)} />
          <input className="w-full rounded border px-3 py-2" placeholder="open_to csv" value={openTo} onChange={(e) => setOpenTo(e.target.value)} />
          <button className="rounded bg-slate-900 px-4 py-2 text-white">Save profile</button>
        </form>
      )}

      {userId && authChecked && hasProfile && (
        <div className="rounded-xl border bg-white p-6 space-y-3 md:col-span-2">
          <h2 className="text-xl font-semibold">You’re signed in</h2>
          <p className="text-slate-600">Your profile already exists. Continue to the feed.</p>
          <Link href="/feed" className="inline-block rounded bg-slate-900 px-4 py-2 text-white">
            Go to feed
          </Link>
        </div>
      )}


      {authState === "failed" && (
        <div className="md:col-span-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Login failed or expired link. Request a fresh magic link and try again.
        </div>
      )}

      {authState === "ok" && userId && !hasProfile && (
        <div className="md:col-span-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          You are signed in. Complete your profile to continue.
        </div>
      )}

      {msg && <p className="md:col-span-2 text-sm text-slate-600">{msg}</p>}
    </div>
  );
}