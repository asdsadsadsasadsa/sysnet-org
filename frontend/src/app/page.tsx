import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GROUPS } from "@/data/groups";
import { ARTIFACTS } from "@/data/artifacts";

export const dynamic = "force-dynamic";

const reasonsToJoin = [
  ["Find credible peers", "Search by domain, tooling, and availability to reach engineers who actually work in your space."],
  ["Trade practical knowledge", "Share implementation notes, field-tested patterns, and hard-won lessons with engineers who care about the same problems."],
  ["Build professional trust", "Discover mentors, consultants, collaborators, and hiring leads inside a systems-focused network."],
  ["Signal over noise", "A focused professional exchange — not resume spam, vendor pitches, or algorithm-bait."],
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

  // Redirect already-logged-in users straight to the feed
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/feed");

  const groupCount = GROUPS.length;
  const artifactCount = ARTIFACTS.length;

  // Fetch recent public posts for homepage preview
  type RecentPost = { id: string; title: string; body: string; author: string | null; handle: string | null };
  let recentPosts: RecentPost[] = [];
  try {
    const { data: postRows } = await supabase
      .from("posts")
      .select("id,title,body,author_id")
      .order("created_at", { ascending: false })
      .limit(5);
    if (postRows && postRows.length > 0) {
      const authorIds = [...new Set(postRows.map((p: { author_id: string }) => p.author_id))];
      const { data: authorRows } = await supabase
        .from("profile_identities")
        .select("id,display_name,handle")
        .in("id", authorIds);
      const authorsById = new Map(
        (authorRows || []).map((a: { id: string; display_name: string; handle: string }) => [a.id, a])
      );
      recentPosts = postRows.map((p: { id: string; title: string; body: string; author_id: string }) => {
        const author = authorsById.get(p.author_id) as { display_name: string; handle: string } | undefined;
        return { id: p.id, title: p.title, body: p.body, author: author?.display_name ?? null, handle: author?.handle ?? null };
      });
    }
  } catch (_) {
    // Non-fatal — homepage works fine without recent posts
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

          <div className="flex flex-wrap gap-3">
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
        </div>
      </section>

      {/* ── What's available — 3 feature cards ── */}
      <section className="py-20 md:py-28">
        <div className="mb-12">
          <p className="eyebrow mb-3">What&apos;s here</p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            A network built around the work itself.
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Link href="/people" className="shell-card p-7 block group hover:border-blue-300 transition-colors">
            <span className="mb-4 block font-mono text-xs font-semibold text-blue-600">Directory</span>
            <h3 className="mb-3 text-base font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">Member Directory</h3>
            <p className="text-sm leading-6 soft-muted">
              Find engineers by domain, tooling, and availability. Filter by aerospace, automotive, medical, embedded, MBSE, and more.
            </p>
          </Link>
          <Link href="/g" className="shell-card p-7 block group hover:border-blue-300 transition-colors">
            <span className="mb-4 block font-mono text-xs font-semibold text-blue-600">{groupCount} domains</span>
            <h3 className="mb-3 text-base font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">Working Groups</h3>
            <p className="text-sm leading-6 soft-muted">
              Focused communities organised around specific engineering disciplines — from MBSE and functional safety to robotics and space systems.
            </p>
          </Link>
          <Link href="/artifacts" className="shell-card p-7 block group hover:border-blue-300 transition-colors">
            <span className="mb-4 block font-mono text-xs font-semibold text-blue-600">{artifactCount} resources</span>
            <h3 className="mb-3 text-base font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">Artifact Library</h3>
            <p className="text-sm leading-6 soft-muted">
              Curated templates, patterns, case studies, and standard references from practising systems engineers — ready to adapt.
            </p>
          </Link>
        </div>
      </section>

      {/* ── Domain coverage strip — full-width muted band ── */}
      <section
        className="border-y border-slate-200/60 bg-white/50 py-14 md:py-16"
        style={bleed}
      >
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <div className="shrink-0 md:w-56">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-2">Domains covered</p>
              <p className="text-sm leading-6 text-slate-600">
                Working groups exist for all major systems engineering disciplines.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {GROUPS.map((g) => (
                <Link
                  key={g.slug}
                  href={`/g/${g.slug}`}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-blue-300 hover:text-blue-700"
                >
                  {g.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured working groups ── */}
      <section className="py-20 md:py-24">
        <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow mb-3">Community</p>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Find your working group.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 soft-muted">
              Each group has a focused discussion feed, curated resources, and a directory of members in that domain.
            </p>
          </div>
          <Link href="/g" className="secondary-button shrink-0 self-start md:self-auto">
            All groups →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {["mbse", "embedded", "safety", "aerospace", "architecture", "robotics"].map((slug) => {
            const g = GROUPS.find((x) => x.slug === slug);
            if (!g) return null;
            return (
              <Link
                key={slug}
                href={`/g/${slug}`}
                className="shell-card p-6 block hover:border-blue-300 transition-colors group"
              >
                <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                  {g.name}
                </h3>
                <p className="mt-2 text-sm leading-6 soft-muted line-clamp-2">{g.description}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {g.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500 rounded border border-slate-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Why join ── */}
      <section className="py-20 md:py-28">
        <div className="max-w-2xl">
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
      </section>

      {/* ── Recent posts preview ── */}
      {recentPosts.length > 0 && (
        <section className="py-20 md:py-28 border-t border-slate-100">
          <div className="mb-10">
            <p className="eyebrow mb-3">Recent discussions</p>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              See what&apos;s being discussed right now.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 soft-muted">
              Systems engineers on SYLEN share implementation notes, verification lessons, and architecture tradeoffs.
              Join the network to read more and contribute.
            </p>
          </div>
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <div key={post.id} className="shell-card p-5 md:p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="pill">Post</span>
                  {post.author && post.handle && (
                    <span className="text-xs font-medium text-slate-500">
                      {post.author} · @{post.handle}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-slate-900">{post.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 line-clamp-2">{post.body}</p>
                <div className="mt-4">
                  <Link href="/onboarding" className="text-sm font-medium text-blue-600 hover:underline">
                    Join to read &amp; reply →
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/onboarding" className="primary-button">Join the network</Link>
            <Link href="/feed" className="secondary-button">Browse the feed</Link>
          </div>
        </section>
      )}

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
