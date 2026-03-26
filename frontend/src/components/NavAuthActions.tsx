"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function NavAuthActions({ mobile = false }: { mobile?: boolean }) {
  const [state, setState] = useState<"loading" | "anon" | "authed">("loading");
  const [handle, setHandle] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setState("anon"); return; }
      const { data: p } = await supabase.from("profiles").select("handle").eq("id", user.id).maybeSingle();
      setHandle(p?.handle ?? null);
      setState("authed");
    }
    void check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => { void check(); });
    return () => subscription.unsubscribe();
  }, []);

  if (state === "loading") {
    return <div className={`bg-slate-100 ${mobile ? "h-7 w-16" : "h-7 w-24"}`} />;
  }

  if (state === "authed") {
    if (mobile) {
      return (
        <div className="flex items-center gap-2">
          <Link href="/feed" className="text-xs font-label uppercase tracking-widest text-on-surface-variant hover:text-brand-navy transition-colors px-2 py-1">
            Feed
          </Link>
          <Link href={handle ? `/u/${handle}` : "/profile"} className="text-xs font-label uppercase tracking-widest text-on-surface-variant hover:text-brand-navy transition-colors px-2 py-1">
            {handle ? `@${handle}` : "Profile"}
          </Link>
          <button
            type="button"
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.assign("/");
            }}
            className="text-xs font-label uppercase tracking-widest text-on-surface-variant hover:text-brand-navy transition-colors px-2 py-1"
          >
            Sign out
          </button>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-4">
        <Link href="/feed" className="text-xs font-label uppercase tracking-widest text-on-surface-variant hover:text-brand-navy transition-colors">
          Feed
        </Link>
        <Link href={handle ? `/u/${handle}` : "/profile"} className="text-xs font-label uppercase tracking-widest text-on-surface-variant hover:text-brand-navy transition-colors">
          {handle ? `@${handle}` : "Profile"}
        </Link>
        <button
          type="button"
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.assign("/");
          }}
          className="px-4 py-1.5 text-xs font-label uppercase tracking-widest text-on-surface-variant border border-outline-variant hover:bg-slate-50 transition-all"
        >
          Sign out
        </button>
      </div>
    );
  }

  if (mobile) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/onboarding" className="text-xs font-label uppercase tracking-widest text-on-surface-variant hover:text-brand-navy transition-colors px-2 py-1">
          Sign in
        </Link>
        <Link href="/onboarding" className="primary-button px-3 py-1.5 text-[10px]">
          Join
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/onboarding"
        className="px-4 py-1.5 text-xs font-label uppercase tracking-widest text-brand-navy border border-outline-variant hover:bg-slate-50 transition-all"
      >
        Sign In
      </Link>
      <Link href="/onboarding" className="primary-button px-4 py-1.5">
        Join
      </Link>
    </div>
  );
}
