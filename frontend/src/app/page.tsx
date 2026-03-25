import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const proofPoints = [
  ["Find credible peers", "Search by domain, tooling, and availability to connect with engineers who actually work in your space."],
  ["Trade practical knowledge", "Share implementation notes, patterns, and field-tested lessons instead of shouting into a generic social app."],
  ["Build professional trust", "Make it easier to discover mentors, consultants, collaborators, and hiring leads inside a systems-focused network."],
];

const pillars = [
  ["Directory by expertise", "Filter by aerospace, automotive, medical, defense, MBSE, SysML, DOORS, Cameo, verification, and more."],
  ["Signal over noise", "Focused on genuine professional exchange — not resume spam, vendor pitches, or algorithm-bait."],
  ["Institutional feel", "Designed to grow toward events, resources, working groups, and a durable systems-engineering knowledge base."],
];

const reasonsToJoin = [
  ["Mentorship & consulting", "Make it obvious who is open to advising, collaborating, or taking on short-term systems work."],
  ["Domain-specific discovery", "Find people working in safety-critical, embedded, MBSE, verification, and adjacent disciplines."],
  ["Useful professional discussion", "Surface implementation questions, hard-won patterns, and practical artifacts from real projects."],
  ["Long-term network building", "Create the kind of trusted graph that leads to referrals, working groups, and durable collaboration."],
];

const futureSlices = [
  ["Mentorship & growth", "A dedicated matcher for junior and senior practitioners to connect on career growth and technical skill-building."],
  ["Events & meetups", "A place to surface webinars, chapter events, and conferences relevant to systems engineers."],
  ["Resources & patterns", "Shared templates, references, and practical artifacts that make the network useful between conversations."],
  ["Working groups", "Smaller communities around domains, methods, and tools — not one giant undifferentiated feed."],
];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const supabase = await createClient();

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
    <div className="space-y-6 md:space-y-8">
      <section className="shell-card-strong relative overflow-hidden p-8 md:p-12">
        <div className="absolute inset-y-0 right-0 hidden w-[42%] bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.28),transparent_55%),radial-gradient(circle_at_bottom,rgba(99,102,241,0.2),transparent_50%)] lg:block" />
        <div className="relative max-w-3xl space-y-6">
          <div className="flex flex-wrap gap-2">
            <span className="pill">Professional network for systems engineers</span>
            <span className="pill">MBSE • Systems thinking • Trusted peers</span>
          </div>
          <div className="space-y-4">
            <h1 className="grad-title text-4xl font-semibold tracking-tight md:text-6xl">
              A professional home for systems engineering.
            </h1>
            <p className="max-w-2xl text-lg leading-8 soft-muted md:text-xl">
              Sysnet helps systems engineers find serious peers, share practical knowledge,
              and build professional trust — without the noise of generic social networks.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/onboarding" className="primary-button">
              Join the network
            </Link>
            <Link href="/people" className="secondary-button">
              Browse people
            </Link>
            <Link href="/feed" className="secondary-button">
              Explore feed
            </Link>
          </div>
          <div className="grid gap-3 pt-2 md:grid-cols-3">
            {proofPoints.map(([title, body]) => (
              <div key={title} className="rounded-[24px] border border-white/60 bg-white/72 p-4 shadow-sm backdrop-blur-xl">
                <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
                <p className="mt-2 text-sm leading-6 soft-muted">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {pillars.map(([title, body]) => (
          <article key={title} className="shell-card p-6">
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <p className="mt-3 text-sm leading-6 soft-muted">{body}</p>
          </article>
        ))}
      </section>

      <section className="page-grid">
        <article className="shell-card p-6 md:p-8">
          <p className="eyebrow">What you get out of it</p>
          <h2 className="section-title mt-3">Built for how systems engineers actually work</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {reasonsToJoin.map(([title, body]) => (
              <div key={title} className="rounded-[24px] border border-slate-200/70 bg-white/80 p-5">
                <h3 className="text-base font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-6 soft-muted">{body}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="shell-card p-6 md:p-8">
          <p className="eyebrow">Where the product is heading</p>
          <h2 className="section-title mt-3 text-2xl md:text-3xl">More institution, less empty app.</h2>
          <div className="mt-6 space-y-5">
            {futureSlices.map(([title, body]) => (
              <div key={title} className="rounded-[22px] border border-slate-200/70 bg-white/78 p-5">
                <h3 className="text-base font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-6 soft-muted">{body}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
