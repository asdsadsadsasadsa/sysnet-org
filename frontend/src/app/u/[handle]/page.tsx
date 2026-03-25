"use client";
export const dynamic = "force-dynamic";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Post } from "@/lib/types";

export default function ProfilePage() {
  const { handle } = useParams<{ handle: string }>();
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [viewerId, setViewerId] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setViewerId(user?.id || "");

    const { data: profileData } = await supabase
      .from("profiles")
      .select("id,handle,display_name,visibility,headline,bio,location,timezone,domains,tags,open_to")
      .eq("handle", handle)
      .maybeSingle();

    const p = (profileData as Profile) || null;
    setProfile(p);

    if (p) {
      const { data: postData } = await supabase
        .from("posts")
        .select("id,author_id,group_slug,title,body,created_at,updated_at")
        .eq("author_id", p.id)
        .order("created_at", { ascending: false });
      
      setPosts((postData as Post[]) || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, [handle]);

  async function connect(e: FormEvent) {
    e.preventDefault();
    if (!profile) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return setMsg("Sign in first");
    if (user.id === profile.id) return setMsg("This is your profile.");
    const { error } = await supabase
      .from("connection_requests")
      .insert({ from_user: user.id, to_user: profile.id, status: "pending" });
    setMsg(error ? error.message : "Connection request sent");
  }

  if (loading) {
    return (
      <div className="shell-card p-8">
        <h1 className="text-2xl font-semibold text-slate-900">Loading profile...</h1>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="shell-card p-8">
        <h1 className="text-2xl font-semibold text-slate-900">Profile unavailable.</h1>
        <p className="mt-2 text-sm soft-muted">This member record does not exist or is not currently listed in the member directory.</p>
      </div>
    );
  }

  const isSelf = viewerId === profile.id;

  return (
    <div className="space-y-6">
      <section className="page-grid">
        <div className="shell-card-strong p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="pill">Member profile</span>
            {isSelf && profile.visibility === "private" && <span className="pill">private to others</span>}
            {(profile.open_to || []).map((item) => (
              <span key={item} className="pill capitalize">
                {item}
              </span>
            ))}
          </div>
          <h1 className="section-title mt-4">{profile.display_name}</h1>
          <p className="mt-2 text-lg text-slate-700">@{profile.handle}</p>
          {profile.headline && <p className="mt-4 max-w-3xl text-base leading-7 soft-muted">{profile.headline}</p>}
          {(profile.location || profile.timezone) && (
            <p className="mt-4 text-sm soft-muted">
              {[profile.location, profile.timezone].filter(Boolean).join(" • ")}
            </p>
          )}
        </div>

        <aside className="shell-card p-6">
          <p className="eyebrow">Actions</p>
          <div className="mt-4 flex flex-col gap-3">
            {isSelf ? (
              <Link href="/profile" className="primary-button text-center">
                Manage your profile
              </Link>
            ) : (
              <form onSubmit={connect}>
                <button className="primary-button w-full">Connect</button>
              </form>
            )}
            <Link href="/people" className="secondary-button text-center">
              Browse directory
            </Link>
            <Link href="/feed" className="secondary-button text-center">
              View feed
            </Link>
          </div>
          {msg && <p className="mt-4 text-sm soft-muted">{msg}</p>}
        </aside>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="space-y-4">
          <article className="shell-card p-6 md:p-8">
            <p className="eyebrow">Professional summary</p>
            <div className="mt-4 space-y-4">
              {profile.bio ? (
                <p className="whitespace-pre-wrap text-[15px] leading-7 text-slate-700">{profile.bio}</p>
              ) : (
                <p className="text-[15px] leading-7 soft-muted">This member has not added a longer bio yet.</p>
              )}
            </div>
          </article>
          
          <article className="shell-card p-6 md:p-8">
            <p className="eyebrow">Posts & field notes</p>
            <div className="mt-4 space-y-6">
              {posts.length > 0 ? (
                posts.map(post => (
                  <div key={post.id} className="border-b border-slate-200/60 pb-6 last:border-0 last:pb-0">
                    <Link href={`/post/${post.id}`} className="block text-lg font-semibold tracking-tight text-slate-900 hover:text-blue-700">
                      {post.title}
                    </Link>
                    <p className="mt-2 text-sm text-slate-600 line-clamp-3 leading-6">{post.body}</p>
                    <p className="mt-3 text-xs text-slate-400">{new Date(post.created_at).toLocaleDateString()}</p>
                  </div>
                ))
              ) : (
                <p className="text-[15px] leading-7 soft-muted">No posts yet.</p>
              )}
            </div>
          </article>
        </div>

        <article className="shell-card p-6 md:p-8 h-fit">
          <p className="eyebrow">Focus areas</p>
          <div className="mt-4 space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Domains</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {(profile.domains || []).length > 0 ? (
                  profile.domains.map((domain) => (
                    <span key={domain} className="pill">
                      {domain}
                    </span>
                  ))
                ) : (
                  <span className="text-sm soft-muted">No domains listed yet.</span>
                )}
              </div>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Tags</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {(profile.tags || []).length > 0 ? (
                  profile.tags.map((tag) => (
                    <span key={tag} className="pill">
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-sm soft-muted">No tags listed yet.</span>
                )}
              </div>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
