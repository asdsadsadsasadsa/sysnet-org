import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const features = [
  {
    num: "01",
    title: "Find credible peers",
    body: "Search by domain, tooling, and availability to connect with engineers who actually work in your space.",
  },
  {
    num: "02",
    title: "Trade practical knowledge",
    body: "Share implementation notes, field-tested patterns, and hard-won lessons with engineers who care about the same problems.",
  },
  {
    num: "03",
    title: "Build professional trust",
    body: "Make it easier to discover mentors, consultants, collaborators, and hiring leads inside a systems-focused network.",
  },
];

const pillars = [
  {
    title: "Directory by expertise",
    body: "Filter by aerospace, automotive, medical, defense, MBSE, SysML, DOORS, Cameo, verification, and more.",
  },
  {
    title: "Signal over noise",
    body: "Focused on genuine professional exchange — not resume spam, vendor pitches, or algorithm-bait.",
  },
  {
    title: "Institutional feel",
    body: "Designed to grow toward events, resources, working groups, and a durable systems-engineering knowledge base.",
  },
];

const reasonsToJoin = [
  ["Mentorship & consulting", "Make it obvious who is open to advising, collaborating, or taking on short-term systems work."],
  ["Domain-specific discovery", "Find people working in safety-critical, embedded, MBSE, verification, and adjacent disciplines."],
  ["Useful professional discussion", "Post implementation questions, hard-won patterns, and practical lessons from real projects."],
  ["Long-term network building", "Build the professional relationships that lead to referrals, working groups, and lasting collaboration."],
];

const futureSlices = [
  ["Mentorship & growth", "A dedicated matcher for junior and senior practitioners to connect on career growth and technical skill-building."],
  ["Events & meetups", "A place to surface webinars, chapter events, and conferences relevant to systems engineers."],
  ["Resources & patterns", "Shared templates, references, and practical artifacts that make the network useful between conversations."],
  ["Working groups", "Smaller communities around domains, methods, and tools — not one giant undifferentiated feed."],
];

const bleed = {
  marginLeft: "calc(50% - 50vw)",
  width: "100vw",
} as React.CSSProperties;

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
    <div className="overflow-x-clip">

      {/* ── Hero ── full-width dark gradient */}
      <section
        className="-mt-8 md:-mt-10 relative overflow-hidden"
        style={bleed}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 15% 55%, rgba(37,99,235,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 85% 20%, rgba(99,102,241,0.14) 0%, transparent 55%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-6 pt-24 pb-28 md:px-10 md:pt-32 md:pb-36">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-blue-400">
            SYLEN — SYstems Leadership & Engineering Network
          </p>
          <h1 className="mb-6 max-w-3xl text-5xl font-bold leading-[1.07] tracking-tight text-white md:text-7xl">
            A professional home for systems engineering.
          </h1>
          <p className="mb-10 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
            SYLEN connects systems engineers to find serious peers, share practical knowledge,
            and build professional trust — without the noise of generic social networks.
          </p>

          {/* CTAs */}
          <div className="mb-8 flex flex-wrap gap-3">
            <Link href="/onboarding" className="primary-button">
              Join the network
            </Link>
            <Link
              href="/people"
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/16"
            >
              Browse people
            </Link>
            <Link
              href="/feed"
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/16"
            >
              Explore feed
            </Link>
          </div>

          {/* Explore links */}
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["/g", "Groups"],
                ["/events", "Events"],
                ["/submissions", "Papers"],
                ["/library", "Library"],
              ] as [string, string][]
            ).map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="inline-flex items-center rounded-full border border-white/12 bg-white/6 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-white/12"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features — 3-column grid ── */}
      <section className="py-20 md:py-28">
        <div className="mb-12">
          <p className="eyebrow mb-3">What it's for</p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Built for how systems engineers actually work.
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="shell-card p-7">
              <span className="mb-4 block font-mono text-xs font-semibold text-blue-600">
                {f.num}
              </span>
              <h3 className="mb-3 text-base font-semibold text-slate-900">{f.title}</h3>
              <p className="text-sm leading-6 soft-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pillars — full-width muted band ── */}
      <section
        className="border-y border-slate-200/60 bg-white/50 py-16 md:py-20"
        style={bleed}
      >
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <div className="grid gap-10 md:grid-cols-3">
            {pillars.map((p) => (
              <div key={p.title}>
                <div className="mb-4 h-0.5 w-8 bg-blue-600" />
                <h3 className="mb-2 text-base font-semibold text-slate-900">{p.title}</h3>
                <p className="text-sm leading-6 soft-muted">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why join + Roadmap ── */}
      <section className="grid gap-16 py-20 md:py-28 lg:grid-cols-2">
        {/* Why join */}
        <div>
          <p className="eyebrow mb-3">What you get out of it</p>
          <h2 className="mb-10 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Made for engineers who take their craft seriously.
          </h2>
          <div className="space-y-6">
            {reasonsToJoin.map(([title, body]) => (
              <div key={title} className="flex gap-4">
                <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600" />
                <div>
                  <h3 className="mb-1 text-sm font-semibold text-slate-900">{title}</h3>
                  <p className="text-sm leading-6 soft-muted">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Roadmap */}
        <div>
          <p className="eyebrow mb-3">Where the product is heading</p>
          <h2 className="mb-10 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Growing toward a full professional institution.
          </h2>
          <div className="space-y-6">
            {futureSlices.map(([title, body]) => (
              <div key={title} className="flex gap-4">
                <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-400" />
                <div>
                  <h3 className="mb-1 text-sm font-semibold text-slate-900">{title}</h3>
                  <p className="text-sm leading-6 soft-muted">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA — full-width dark ── */}
      <section
        className="-mb-8 md:-mb-10 relative overflow-hidden"
        style={bleed}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 80% at 50% 110%, rgba(37,99,235,0.22) 0%, transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-6 py-20 text-center md:px-10 md:py-28">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Ready to find your people?
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-lg text-slate-300">
            Join a growing network of systems engineers who prefer depth over noise.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/onboarding" className="primary-button">
              Join the network
            </Link>
            <Link
              href="/people"
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/16"
            >
              Browse people
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
