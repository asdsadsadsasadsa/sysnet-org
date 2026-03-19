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
            Join the network
          </Link>
          <Link href="/people" className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700">
            Browse directory
          </Link>
          <Link href="/feed" className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700">
            Explore feed
          </Link>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            ["Find credible peers", "Search by domain, tooling, and availability to connect with engineers who actually work in your space."],
            ["Trade practical knowledge", "Share implementation notes, patterns, and questions instead of shouting into a generic social feed."],
            ["Build professional trust", "Discover mentors, consultants, collaborators, and hiring leads inside a systems-focused network."],
          ].map(([title, body]) => (
            <div key={title} className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur">
              <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
              <p className="soft-muted mt-2 text-sm">{body}</p>
            </div>
          ))}
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

      <section className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
        <article className="shell-card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Why members join</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {[
              ["Mentorship & consulting", "Make it obvious who is open to advising, collaborating, or taking on short-term systems work."],
              ["Domain-specific discovery", "Find people working in safety-critical, embedded, MBSE, verification, and adjacent disciplines."],
              ["Useful professional discussion", "Surface implementation questions, hard-won patterns, and lessons learned from real projects."],
              ["Long-term network building", "Create the kind of trusted graph that leads to referrals, working groups, and durable collaboration."],
            ].map(([title, body]) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
                <p className="soft-muted mt-2 text-sm">{body}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="shell-card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">What the platform is growing toward</p>
          <div className="mt-4 space-y-4">
            {[
              ["Events & meetups", "A place to surface webinars, chapter events, and conferences relevant to systems engineers."],
              ["Resources & patterns", "Shared templates, references, and practical artifacts that make the network useful between conversations."],
              ["Working groups", "Smaller communities around domains, methods, and tools — not one giant undifferentiated feed."],
            ].map(([title, body]) => (
              <div key={title} className="border-l-2 border-blue-200 pl-4">
                <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
                <p className="soft-muted mt-1 text-sm">{body}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
