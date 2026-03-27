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
    return <div className="max-w-md mx-auto py-12 text-sm text-on-surface-variant">Loading…</div>;
  }

  if (!userId) {
    return (
      <div className="max-w-md mx-auto py-12 space-y-4">
        <p className="text-sm text-on-surface-variant">Sign in to manage your profile.</p>
        <Link href="/onboarding" className="primary-button inline-block">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-12 space-y-6">
      <form onSubmit={saveProfile} className="shell-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-label uppercase tracking-widest text-brand-navy">
            {profileExists ? "Edit profile" : "Create profile"}
          </h2>
          <div className="flex items-center gap-4">
            {publicProfileHref && (
              <Link href={publicProfileHref} className="text-xs font-label uppercase tracking-widest text-on-surface-variant hover:text-brand-navy transition-colors">
                View
              </Link>
            )}
            <button type="button" onClick={signOut} className="text-xs font-label uppercase tracking-widest text-on-surface-variant hover:text-brand-navy transition-colors">
              Sign out
            </button>
            <button disabled={saving} className="px-4 py-1.5 text-xs font-label uppercase tracking-widest bg-brand-navy text-white hover:bg-slate-800 transition-all disabled:opacity-60">
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <input placeholder="Handle" value={handle} onChange={(e) => setHandle(e.target.value)} />
          <input placeholder="Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          <input className="md:col-span-2" placeholder="Headline" value={headline} onChange={(e) => setHeadline(e.target.value)} />
          <textarea className="md:col-span-2" placeholder="Bio" value={bio} onChange={(e) => setBio(e.target.value)} />
          <input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
          <input placeholder="Timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
          <input placeholder="Domains (comma-separated)" value={domains} onChange={(e) => setDomains(e.target.value)} />
          <input placeholder="Tags (comma-separated)" value={tags} onChange={(e) => setTags(e.target.value)} />
          <select className="md:col-span-2" value={visibility} onChange={(e) => setVisibility(e.target.value as ProfileVisibility)}>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
      </form>

      {msg && (
        <div className={`border px-4 py-3 text-sm ${
          msgTone === "error" ? "border-rose-300 bg-rose-50 text-rose-700"
          : msgTone === "success" ? "border-emerald-300 bg-emerald-50 text-emerald-700"
          : "border-blue-200 bg-blue-50 text-blue-700"
        }`}>
          {msg}
        </div>
      )}
    </div>
  );
}
