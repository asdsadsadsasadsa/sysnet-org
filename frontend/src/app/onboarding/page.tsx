"use client";
export const dynamic = "force-dynamic";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { normalizeHandle, parseCsvList } from "@/lib/profile-utils";
import { sanitizeOpenTo } from "@/lib/open-to";
import type { ProfileVisibility } from "@/lib/types";

const DEFAULT_VISIBILITY: ProfileVisibility = "public";

export default function OnboardingPage() {
  const router = useRouter();
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
    <div className="space-y-6">
      <section className="page-grid">
        <div className="shell-card-strong p-6 md:p-8">
          <p className="eyebrow">Join the network</p>
          <h1 className="section-title mt-3">Join the network.</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 soft-muted">
            Create an account, fill out your profile, and you are in. The whole process takes a few minutes.
          </p>
        </div>
        <div className="shell-card p-6">
          <p className="eyebrow">What to include</p>
          <div className="mt-4 space-y-3 text-sm leading-6 soft-muted">
            <p>Pick a handle you use professionally.</p>
            <p>Add a headline that describes what you actually do — domains, tools, industry.</p>
            <p>Set your availability so others know if you are open to mentoring, consulting, or connecting.</p>
          </div>
        </div>
      </section>

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

          <form onSubmit={mode === "login" ? signIn : signUp} className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              {mode === "login" ? "Sign in" : "Create your account"}
            </h2>
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
      )}

      {userId && authChecked && (
        <form onSubmit={saveProfile} className="shell-card p-6 space-y-4 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                {hasProfile ? "Your profile" : "Complete your profile"}
              </h2>
              <p className="mt-1 text-sm soft-muted">
                {hasProfile
                  ? "Your profile is loaded below. Update anything and save, or head to the feed."
                  : "Account created. Fill in your profile so others can find and connect with you."}
              </p>
            </div>
            <button type="button" onClick={signOut} className="secondary-button px-4 py-2">
              Sign out
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <input placeholder="Handle (e.g. jsmith)" value={handle} onChange={(e) => setHandle(e.target.value)} />
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
