"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    let cancelled = false;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || cancelled) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (cancelled) return;
      router.replace(profile ? "/feed" : "/onboarding?auth=ok");
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="space-y-10">
      <section className="shell-card relative overflow-hidden p-10">
        <div className="absolute -right-10 -top-16 h-52 w-52 rounded-full bg-blue-100/70 blur-2xl" />
        <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-indigo-100/70 blur-2xl" />
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Professional network for systems engineers</p>
        <h1 className="grad-title mt-3 text-4xl font-bold tracking-tight md:text-5xl">
          Find peers. Share patterns. Build trusted networks.
        </h1>
        <p className="soft-muted mt-4 max-w-2xl text-base">
          ABRAKADABRA helps systems engineers connect by domain and tooling, discuss real implementation problems,
          and find mentorship, consulting, and hiring opportunities.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/onboarding" className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm">
            Create profile
          </Link>
          <Link href="/people" className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700">
            Browse directory
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["Directory by expertise", "Filter by aerospace, automotive, medical, defense, MBSE, SysML, DOORS, Cameo and more."],
          ["Signal over noise", "Built for professional collaboration, not resume spam or vendor ad blasts."],
          ["Community-first", "Ask implementation questions, share templates, and build long-term trust."],
        ].map(([title, body]) => (
          <article key={title} className="shell-card p-5">
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            <p className="soft-muted mt-2 text-sm">{body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
