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
    return <div className={`animate-pulse rounded-full bg-slate-100 ${mobile ? "h-8 w-16" : "h-9 w-24"}`} />;
  }

  if (state === "authed") {
    if (mobile) {
      return (
        <div className="flex items-center gap-1">
          <Link href="/feed" className="rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-white/80 hover:text-slate-900">
            Feed
          </Link>
          <Link href={handle ? `/u/${handle}` : "/profile"} className="rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-white/80 hover:text-slate-900">
            {handle ? `@${handle}` : "Profile"}
          </Link>
          <button
            type="button"
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.assign("/");
            }}
            className="rounded-full px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-white/80 hover:text-slate-900"
          >
            Sign out
          </button>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <Link href="/feed" className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white/80 hover:text-slate-900">
          Feed
        </Link>
        <Link href={handle ? `/u/${handle}` : "/profile"} className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white/80 hover:text-slate-900">
          {handle ? `@${handle}` : "Profile"}
        </Link>
        <button
          type="button"
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.assign("/");
          }}
          className="rounded-full px-4 py-2 text-sm font-medium text-slate-500 hover:bg-white/80 hover:text-slate-900"
        >
          Sign out
        </button>
      </div>
    );
  }

  if (mobile) {
    return (
      <div className="flex items-center gap-1">
        <Link href="/onboarding" className="rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-white/80 hover:text-slate-900">
          Sign in
        </Link>
        <Link href="/onboarding" className="primary-button px-3 py-2 text-xs">
          Join SYLEN
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/onboarding" className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white/80 hover:text-slate-900">
        Sign in
      </Link>
      <Link href="/onboarding" className="primary-button ml-1 px-4 py-2.5">
        Join SYLEN
      </Link>
    </div>
  );
}
