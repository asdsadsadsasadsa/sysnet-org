"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function NavAuthActions() {
  const [state, setState] = useState<"loading" | "anon" | "authed">("loading");
  const supabase = createClient();

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      setState(user ? "authed" : "anon");
    }
    void check();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => { void check(); });
    return () => subscription.unsubscribe();
  }, []);

  if (state === "loading") {
    return <div className="h-7 w-20 bg-slate-100" />;
  }

  if (state === "authed") {
    return (
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
      <Link
        href="/onboarding"
        className="px-4 py-1.5 text-xs font-label uppercase tracking-widest bg-brand-navy text-white hover:bg-slate-800 transition-all"
      >
        Join
      </Link>
    </div>
  );
}
