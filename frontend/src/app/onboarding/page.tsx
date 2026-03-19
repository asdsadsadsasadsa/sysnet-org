"use client";
export const dynamic = "force-dynamic";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { normalizeHandle, parseCsvList } from "@/lib/profile-utils";
import { sanitizeOpenTo } from "@/lib/open-to";

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  async function refreshUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const uid = user?.id || "";
    setUserId(uid);

    if (!uid) {
      setHasProfile(false);
      setAuthChecked(true);
      return;
    }

    const { data: p } = await supabase
      .from("profiles")
      .select("handle,display_name,headline,location,domains,tags,open_to")
      .eq("id", uid)
      .maybeSingle();

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
  }

  useEffect(() => {
    refreshUser();
  }, []);

  async function signIn(e: FormEvent) {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setMsg("Signing in...");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMsg(error.message);
      setSending(false);
      return;
    }
    await refreshUser();
    setMsg("Signed in.");
    setSending(false);
    router.refresh();
  }

  async function signUp(e: FormEvent) {
    e.preventDefault();
    if (sending) return;
    if (password.length < 8) return setMsg("Use a password with at least 8 characters.");
    if (password !== confirmPassword) return setMsg("Passwords do not match.");
    setSending(true);
    setMsg("Creating account...");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setMsg(body.error || "Unable to create account.");
        setSending(false);
        return;
      }

      const loginResult = await supabase.auth.signInWithPassword({ email, password });
      if (loginResult.error) {
        setMsg(`Account created, but login failed: ${loginResult.error.message}`);
        setSending(false);
        return;
      }

      await refreshUser();
      setMsg("Account created. Complete your profile.");
      setMode("login");
      setSending(false);
      router.refresh();
    } catch {
      setMsg("Unexpected network error while creating the account.");
      setSending(false);
    }
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
    if (!error) {
      setHasProfile(true);
      router.push("/feed");
      router.refresh();
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUserId("");
    setHasProfile(false);
    setAuthChecked(true);
    setMsg("Signed out.");
    router.refresh();
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {!userId && (
        <div className="rounded-xl border bg-white p-6 space-y-4 md:col-span-2">
          <div className="flex gap-2 text-sm">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`rounded-lg px-3 py-2 ${mode === "login" ? "bg-slate-900 text-white" : "border border-slate-300 text-slate-700"}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`rounded-lg px-3 py-2 ${mode === "signup" ? "bg-slate-900 text-white" : "border border-slate-300 text-slate-700"}`}
            >
              Create account
            </button>
          </div>

          <form onSubmit={mode === "login" ? signIn : signUp} className="space-y-3">
            <h1 className="text-xl font-semibold">
              {mode === "login" ? "Sign in with email and password" : "Create your account"}
            </h1>
            <input
              type="email"
              required
              className="w-full rounded border px-3 py-2"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              required
              className="w-full rounded border px-3 py-2"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {mode === "signup" && (
              <input
                type="password"
                required
                className="w-full rounded border px-3 py-2"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            )}
            <button
              type="submit"
              disabled={sending}
              className="w-full rounded bg-slate-900 px-4 py-2 text-white active:scale-[0.99] disabled:opacity-60"
            >
              {sending ? "Working..." : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>
        </div>
      )}

      {userId && authChecked && !hasProfile && (
        <form onSubmit={saveProfile} className="rounded-xl border bg-white p-6 space-y-3 md:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Complete your profile</h2>
              <p className="mt-1 text-sm text-slate-600">Your login works. Now add the public profile people will see.</p>
            </div>
            <button type="button" onClick={signOut} className="rounded border border-slate-300 px-3 py-2 text-sm text-slate-700">
              Sign out
            </button>
          </div>
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
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">You’re signed in</h2>
              <p className="text-slate-600">Your profile exists. Continue to the feed.</p>
            </div>
            <button type="button" onClick={signOut} className="rounded border border-slate-300 px-3 py-2 text-sm text-slate-700">
              Sign out
            </button>
          </div>
          <Link href="/feed" className="inline-block rounded bg-slate-900 px-4 py-2 text-white">
            Go to feed
          </Link>
        </div>
      )}

      {msg && <p className="md:col-span-2 text-sm text-slate-600">{msg}</p>}
    </div>
  );
}
