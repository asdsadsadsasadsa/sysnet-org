import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const supabase = await createClient();

  // Fallback: if auth provider sends user back to homepage with code,
  // complete auth here and route deterministically.
  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/onboarding?auth=failed");

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    redirect(profile ? "/feed" : "/onboarding?auth=ok");
  }

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
            Sign in
          </Link>
          <Link href="/people" className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700">
            Browse directory
          </Link>
        </div>
        <p className="soft-muted mt-4 text-xs">
          Tiny deploy check: homepage updated so we can confirm the Vercel pipeline is live.
        </p>
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
