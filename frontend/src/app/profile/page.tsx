"use client";
export const dynamic = "force-dynamic";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { parseCsvList, normalizeHandle } from "@/lib/profile-utils";
import { sanitizeOpenTo } from "@/lib/open-to";
import type { Profile, ProfileVisibility } from "@/lib/types";

type MessageTone = "info" | "success" | "error";

const DEFAULT_DOMAINS = "systems engineering";
const DEFAULT_TAGS = "mbse, sysml";
const DEFAULT_OPEN_TO = "mentoring";
const DEFAULT_VISIBILITY: ProfileVisibility = "public";

export default function ProfileManagementPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [profileExists, setProfileExists] = useState(false);

  const [handle, setHandle] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [visibility, setVisibility] = useState<ProfileVisibility>(DEFAULT_VISIBILITY);
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [timezone, setTimezone] = useState("");
  const [domains, setDomains] = useState(DEFAULT_DOMAINS);
  const [tags, setTags] = useState(DEFAULT_TAGS);
  const [openTo, setOpenTo] = useState(DEFAULT_OPEN_TO);

  const [msg, setMsg] = useState("");
  const [msgTone, setMsgTone] = useState<MessageTone>("info");

  const publicProfileHref = useMemo(() => {
    const normalized = normalizeHandle(handle);
    return normalized ? `/u/${normalized}` : null;
  }, [handle]);

  async function loadProfile() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setUserId("");
      setLoading(false);
      return;
    }

    setUserId(user.id);
    setUserEmail(user.email || "");

    const { data } = await supabase
      .from("profiles")
      .select("id,handle,display_name,visibility,headline,bio,location,timezone,domains,tags,open_to")
      .eq("id", user.id)
      .maybeSingle();

    if (data) {
      const profile = data as Profile;
      setProfileExists(true);
      setHandle(profile.handle || "");
      setDisplayName(profile.display_name || "");
      setVisibility(profile.visibility || DEFAULT_VISIBILITY);
      setHeadline(profile.headline || "");
      setBio(profile.bio || "");
      setLocation(profile.location || "");
      setTimezone(profile.timezone || "");
      setDomains((profile.domains || []).join(", "));
      setTags((profile.tags || []).join(", "));
      setOpenTo((profile.open_to || []).join(", "));
    } else {
      const guessedHandle = normalizeHandle((user.email || "").split("@")[0] || "member");
      const guessedName = (user.email || "").split("@")[0]?.replace(/[._-]+/g, " ") || "";
      setProfileExists(false);
      setHandle(guessedHandle);
      setDisplayName(
        guessedName
          .split(" ")
          .filter(Boolean)
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ")
      );
      setVisibility(DEFAULT_VISIBILITY);
      setHeadline("");
      setBio("");
      setLocation("");
      setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone || "");
      setDomains(DEFAULT_DOMAINS);
      setTags(DEFAULT_TAGS);
      setOpenTo(DEFAULT_OPEN_TO);
    }

    setLoading(false);
  }

  useEffect(() => {
    void loadProfile();
  }, []);

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    if (!userId) {
      setMsgTone("error");
      setMsg("Sign in first.");
      return;
    }

    const normalizedHandle = normalizeHandle(handle);
    if (!normalizedHandle) {
      setMsgTone("error");
      setMsg("Handle is invalid. Use letters, numbers, underscore, and dashes.");
      return;
    }

    if (!displayName.trim()) {
      setMsgTone("error");
      setMsg("Display name is required.");
      return;
    }

    setSaving(true);
    setMsgTone("info");
    setMsg(profileExists ? "Saving profile changes..." : "Creating your profile...");

    const payload = {
      id: userId,
      handle: normalizedHandle,
      display_name: displayName.trim(),
      visibility,
      headline: headline.trim(),
      bio: bio.trim(),
      location: location.trim(),
      timezone: timezone.trim(),
      domains: parseCsvList(domains),
      tags: parseCsvList(tags),
      open_to: sanitizeOpenTo(parseCsvList(openTo, { maxItems: 6, maxLen: 24 })),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("profiles").upsert(payload);

    if (error) {
      setMsgTone("error");
      setMsg(error.message);
      setSaving(false);
      return;
    }

    setProfileExists(true);
    setHandle(normalizedHandle);
    setMsgTone("success");
    setMsg("Profile saved.");
    setSaving(false);
    router.refresh();
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.assign("/onboarding");
  }

  if (loading) {
    return (
      <div className="shell-card p-8">
        <p className="eyebrow">Profile management</p>
        <h1 className="section-title mt-3 text-2xl md:text-3xl">Loading your profile...</h1>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="space-y-6">
        <section className="shell-card-strong p-6 md:p-8">
          <p className="eyebrow">Profile management</p>
          <h1 className="section-title mt-3">Sign in to manage your professional profile.</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 soft-muted">
            This is where members should be able to edit their public identity instead of getting trapped in one-time onboarding.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/onboarding" className="primary-button">
              Sign in
            </Link>
            <Link href="/people" className="secondary-button">
              Browse directory
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="page-grid">
        <div className="shell-card-strong p-6 md:p-8">
          <p className="eyebrow">Profile management</p>
          <h1 className="section-title mt-3">Manage the member profile people can discover.</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 soft-muted">
            This should function like a professional member record: credible headline, useful expertise tags, clear availability,
            and enough context that another systems engineer can tell why they should care.
          </p>
          {userEmail && <p className="mt-4 text-sm soft-muted">Signed in as {userEmail}</p>}
        </div>

        <aside className="shell-card p-6">
          <p className="eyebrow">Quick actions</p>
          <div className="mt-4 flex flex-col gap-3">
            {publicProfileHref && (
              <Link href={publicProfileHref} className="secondary-button">
                {visibility === "public" ? "View public profile" : "Preview profile route"}
              </Link>
            )}
            <Link href="/feed" className="secondary-button">
              Go to feed
            </Link>
            <Link href="/people" className="secondary-button">
              Browse directory
            </Link>
            <button type="button" onClick={signOut} className="secondary-button">
              Sign out
            </button>
          </div>
          <div className="mt-5 space-y-2 text-sm leading-6 soft-muted">
            <p>Keep the handle stable if other people may already be linking to it.</p>
            <p>Private profiles stay accessible to you, but disappear from the public directory and direct profile page.</p>
            <p>Use domains for big buckets and tags for specific methods, tools, or topics.</p>
            <p>Availability only accepts: mentoring, consulting, hiring.</p>
          </div>
        </aside>
      </section>

      <form onSubmit={saveProfile} className="shell-card p-6 space-y-4 md:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{profileExists ? "Edit your profile" : "Create your profile"}</h2>
            <p className="mt-1 text-sm soft-muted">
              {profileExists
                ? "Update your profile details and choose whether it is public or private."
                : "You’re signed in. Create the profile that will show up across the network if you keep it public."}
            </p>
          </div>
          <button disabled={saving} className="primary-button px-4 py-2.5 disabled:opacity-60">
            {saving ? "Saving..." : profileExists ? "Save changes" : "Create profile"}
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <input placeholder="handle" value={handle} onChange={(e) => setHandle(e.target.value)} />
          <input placeholder="display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          <label className="md:col-span-2 rounded-2xl border border-slate-200/80 bg-white/80 p-4 text-sm text-slate-700">
            <span className="block text-sm font-semibold text-slate-900">Profile visibility</span>
            <span className="mt-1 block soft-muted">Public profiles appear in the directory and can be viewed at your handle link.</span>
            <select className="mt-3" value={visibility} onChange={(e) => setVisibility(e.target.value as ProfileVisibility)}>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </label>
          <input className="md:col-span-2" placeholder="headline" value={headline} onChange={(e) => setHeadline(e.target.value)} />
          <textarea className="md:col-span-2" placeholder="bio" value={bio} onChange={(e) => setBio(e.target.value)} />
          <input placeholder="location" value={location} onChange={(e) => setLocation(e.target.value)} />
          <input placeholder="timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
          <input placeholder="domains csv" value={domains} onChange={(e) => setDomains(e.target.value)} />
          <input placeholder="tags csv" value={tags} onChange={(e) => setTags(e.target.value)} />
          <input className="md:col-span-2" placeholder="open_to csv" value={openTo} onChange={(e) => setOpenTo(e.target.value)} />
        </div>
      </form>

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
