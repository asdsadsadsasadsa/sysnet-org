"use client";
export const dynamic = "force-dynamic";

import { FormEvent, Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { normalizeHandle, parseCsvList } from "@/lib/profile-utils";
import { sanitizeOpenTo } from "@/lib/open-to";
import type { ProfileVisibility } from "@/lib/types";

const DEFAULT_VISIBILITY: ProfileVisibility = "public";

function OnboardingInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState<string>("");
  const [msgTone, setMsgTone] = useState<"info" | "success" | "error">("info");
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [handle, setHandle] = useState("");
  const [handleStatus, setHandleStatus] = useState<"idle" | "checking" | "taken" | "available">("idle");
  const handleDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [visibility, setVisibility] = useState<ProfileVisibility>(DEFAULT_VISIBILITY);
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
      .select("handle,display_name,visibility,headline,location,domains,tags,open_to")
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
    setVisibility(p.visibility || DEFAULT_VISIBILITY);
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

  // Surface auth errors from OAuth redirect (?auth=failed&reason=...)
  useEffect(() => {
    const authParam = searchParams.get("auth");
    const reason = searchParams.get("reason");
    if (authParam === "failed") {
      setMsgTone("error");
      setMsg(reason ? `Sign-in failed: ${decodeURIComponent(reason)}` : "Sign-in failed. Please try again.");
    }
  }, [searchParams]);

  // Real-time handle uniqueness check
  function onHandleChange(val: string) {
    setHandle(val);
    const normalized = normalizeHandle(val);
    if (!normalized) {
      setHandleStatus("idle");
      return;
    }
    setHandleStatus("checking");
    if (handleDebounceRef.current) clearTimeout(handleDebounceRef.current);
    handleDebounceRef.current = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("handle", normalized)
        .neq("id", userId || "00000000-0000-0000-0000-000000000000")
        .maybeSingle();
      setHandleStatus(data ? "taken" : "available");
    }, 400);
  }

  async function signIn(e: FormEvent) {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setMsgTone("info");
    setMsg("Signing in...");

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMsgTone("error");
      setMsg(error.message || "Unable to sign in.");
      setSending(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMsgTone("error");
      setMsg("Sign-in did not complete cleanly. Try again.");
      setSending(false);
      return;
    }

    setUserId(user.id);
    setAuthChecked(true);

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    setHasProfile(!!profile);
    setMsgTone("success");
    setMsg(profile ? "Signed in. Redirecting to feed..." : "Signed in. Complete your profile to continue.");
    setSending(false);

    if (profile) {
      window.location.assign("/feed");
      return;
    }

    window.location.assign("/onboarding?login=ok");
  }

  async function signUp(e: FormEvent) {
    e.preventDefault();
    if (sending) return;
    if (password.length < 8) {
      setMsgTone("error");
      return setMsg("Use a password with at least 8 characters.");
    }
    if (password !== confirmPassword) {
      setMsgTone("error");
      return setMsg("Passwords do not match.");
    }
    setSending(true);
    setMsgTone("info");
    setMsg("Creating account...");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setMsgTone("error");
        setMsg(body.error || "Unable to create account.");
        setSending(false);
        return;
      }

      const loginResult = await supabase.auth.signInWithPassword({ email, password });
      if (loginResult.error) {
        setMsgTone("error");
        setMsg(`Account created, but login failed: ${loginResult.error.message}`);
        setSending(false);
        return;
      }

      await refreshUser();
      setMsgTone("success");
      setMsg("Account created. Complete your profile.");
      setMode("login");
      setSending(false);
      router.refresh();
    } catch {
      setMsgTone("error");
      setMsg("Unexpected network error while creating the account.");
      setSending(false);
    }
  }

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    if (!userId) {
      setMsgTone("error");
      return setMsg("Sign in first.");
    }
    const normalizedHandle = normalizeHandle(handle);
    if (!normalizedHandle) {
      setMsgTone("error");
      return setMsg("Handle is invalid. Use letters, numbers, underscore, and dashes.");
    }
    if (handleStatus === "taken") {
      setMsgTone("error");
      return setMsg("That handle is already taken. Pick a different one.");
    }

    const payload = {
      id: userId,
      handle: normalizedHandle,
      display_name: displayName.trim(),
      visibility,
      headline: headline.trim(),
      location: location.trim(),
      domains: parseCsvList(domains),
      tags: parseCsvList(tags),
      open_to: sanitizeOpenTo(parseCsvList(openTo, { maxItems: 6, maxLen: 24 })),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("profiles").upsert(payload);
    setMsgTone(error ? "error" : "success");
    setMsg(error ? error.message : hasProfile ? "Profile updated." : "Profile saved. Redirecting to feed...");
    if (!error) {
      setHasProfile(true);
      if (!hasProfile) {
        router.push("/feed");
      }
      router.refresh();
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUserId("");
    setHasProfile(false);
    setAuthChecked(true);
    setMsgTone("success");
    setMsg("Signed out.");
    router.refresh();
  }

  return (
    <div className="max-w-md mx-auto py-12 space-y-6">

      {!userId && (
        <div className="shell-card p-6 space-y-5 md:p-8">
          <div className="inline-flex rounded-full border border-slate-200/80 bg-white/80 p-1 text-sm">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`rounded-full px-4 py-2 ${mode === "login" ? "bg-slate-900 text-white" : "text-slate-600"}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`rounded-full px-4 py-2 ${mode === "signup" ? "bg-slate-900 text-white" : "text-slate-600"}`}
            >
              Create account
            </button>
          </div>

          <div className="space-y-4">

            <button
              type="button"
              disabled={sending}
              onClick={async () => {
                setSending(true);
                await supabase.auth.signInWithOAuth({
                  provider: "google",
                  options: { redirectTo: `${window.location.origin}/auth/callback` },
                });
                setSending(false);
              }}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
            >
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#4285F4" d="M47.52 24.56c0-1.56-.14-3.06-.4-4.5H24v8.51h13.18c-.57 2.97-2.29 5.48-4.88 7.17v5.96h7.9c4.63-4.27 7.3-10.56 7.3-17.14z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.92-2.15 15.9-5.82l-7.9-5.96c-2.15 1.44-4.9 2.29-8 2.29-6.15 0-11.36-4.15-13.22-9.73H2.58v6.16C6.55 42.53 14.72 48 24 48z" />
                <path fill="#FBBC05" d="M10.78 28.78A14.97 14.97 0 0 1 9.88 24c0-1.65.28-3.26.9-4.78v-6.16H2.58A23.99 23.99 0 0 0 0 24c0 3.88.93 7.54 2.58 10.94l8.2-6.16z" />
                <path fill="#EA4335" d="M24 9.54c3.47 0 6.58 1.19 9.03 3.53l6.77-6.77C35.9 2.38 30.48 0 24 0 14.72 0 6.55 5.47 2.58 13.06l8.2 6.16C12.64 13.69 17.85 9.54 24 9.54z" />
              </svg>
              Continue with Google
            </button>

            <div className="relative flex items-center gap-3 text-sm text-slate-400">
              <div className="h-px flex-1 bg-slate-200" />
              <span>or continue with email</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <form onSubmit={mode === "login" ? signIn : signUp} className="space-y-4">
            <input
              type="email"
              required
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {mode === "signup" && (
              <input
                type="password"
                required
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            )}
            <button type="submit" disabled={sending} className="primary-button w-full disabled:opacity-60">
              {sending ? "Working..." : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>
          </div>
        </div>
      )}

      {userId && authChecked && (
        <form onSubmit={saveProfile} className="shell-card p-6 space-y-4 md:p-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-headline font-semibold text-brand-navy">
              {hasProfile ? "Your profile" : "Complete your profile"}
            </h2>
            <button type="button" onClick={signOut} className="text-xs font-label uppercase tracking-widest text-on-surface-variant hover:text-brand-navy transition-colors">
              Sign out
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <input
                placeholder="Handle (e.g. jsmith)"
                value={handle}
                onChange={(e) => onHandleChange(e.target.value)}
                className={handleStatus === "taken" ? "border-rose-300 focus:ring-rose-300" : handleStatus === "available" ? "border-emerald-300" : ""}
              />
              {handleStatus === "checking" && (
                <p className="mt-1 text-xs text-slate-400">Checking...</p>
              )}
              {handleStatus === "taken" && (
                <p className="mt-1 text-xs text-rose-600">Handle already taken. Try another.</p>
              )}
              {handleStatus === "available" && (
                <p className="mt-1 text-xs text-emerald-600">@{normalizeHandle(handle)} is available</p>
              )}
            </div>
            <input placeholder="Full name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            <label className="md:col-span-2 rounded-2xl border border-slate-200/80 bg-white/80 p-4 text-sm text-slate-700">
              <span className="block text-sm font-semibold text-slate-900">Profile visibility</span>
              <span className="mt-1 block soft-muted">Public profiles appear in the member directory. Private profiles are visible only to you.</span>
              <select className="mt-3" value={visibility} onChange={(e) => setVisibility(e.target.value as ProfileVisibility)}>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </label>
            <input className="md:col-span-2" placeholder="Headline (e.g. Systems architect, aerospace & defense)" value={headline} onChange={(e) => setHeadline(e.target.value)} />
            <input placeholder="Location (e.g. Seattle, WA)" value={location} onChange={(e) => setLocation(e.target.value)} />
            <input placeholder="Domains, comma-separated (e.g. MBSE, safety, embedded)" value={domains} onChange={(e) => setDomains(e.target.value)} />
            <input placeholder="Tags, comma-separated (e.g. SysML, DOORS, Cameo)" value={tags} onChange={(e) => setTags(e.target.value)} />
            <input placeholder="Open to (e.g. mentoring, consulting, hiring)" value={openTo} onChange={(e) => setOpenTo(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="primary-button">{hasProfile ? "Save changes" : "Save profile"}</button>
            {hasProfile && (
              <Link href="/feed" className="secondary-button px-4 py-2">
                Go to feed
              </Link>
            )}
          </div>
        </form>
      )}

      {msg && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            msgTone === "error"
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : msgTone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-blue-200 bg-blue-50 text-blue-700"
          }`}
        >
          {msg}
        </div>
      )}
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="shell-card p-8"><p className="text-slate-500 text-sm">Loading...</p></div>}>
      <OnboardingInner />
    </Suspense>
  );
}
