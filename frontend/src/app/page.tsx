import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GROUPS } from "@/data/groups";

export const dynamic = "force-dynamic";

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

  // Fetch stats
  let memberCount: number | null = null;
  let postCount: number | null = null;
  try {
    const { count: mc } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("visibility", "public");
    memberCount = mc;

    const { count: pc } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true });
    postCount = pc;
  } catch (_) {
    // Non-fatal
  }

  // Fetch recent public posts for homepage preview
  type RecentPost = { id: string; title: string; body: string; author: string | null; handle: string | null };
  let recentPosts: RecentPost[] = [];
  try {
    const { data: postRows } = await supabase
      .from("posts")
      .select("id,title,body,author_id")
      .order("created_at", { ascending: false })
      .limit(6);
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
    // Non-fatal
  }

  const fmt = (n: number | null) => (n == null ? "—" : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));

  return (
    <div className="overflow-x-clip">

      {/* ── Hero — asymmetric 2-col editorial grid ── */}
      <section
        className="relative py-12 md:py-24 overflow-hidden"
        style={bleed}
      >
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">

          {/* Left 8 cols: headline */}
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-brand-navy text-[10px] font-label uppercase tracking-[0.2em] mb-6 border border-outline-variant/50">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-navy opacity-40"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-navy"></span>
              </span>
              Network Active
            </div>
            <h1 className="text-5xl md:text-7xl font-headline font-bold tracking-tighter text-brand-navy leading-[0.9] mb-8">
              The professional home for <span className="text-brand-accent italic">systems</span> engineers.
            </h1>
            <p className="text-on-surface-variant text-lg max-w-2xl leading-relaxed font-light">
              SYLEN connects engineers who design, build, and verify complex systems. Find credible peers,
              share implementation knowledge, and build professional trust — without the noise.
            </p>
          </div>

          {/* Right 4 cols: CTA card */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="p-6 bg-white border border-outline-variant shadow-sm relative overflow-hidden">
              <h3 className="font-headline font-bold text-xl mb-2 text-brand-navy">Join the Network</h3>
              <p className="text-sm text-on-surface-variant mb-6 leading-snug">
                Connect with systems engineers worldwide. Share knowledge, find collaborators, and grow your practice.
              </p>
              <div className="flex gap-3">
                <Link href="/onboarding" className="primary-button flex-1 justify-center py-3">
                  Join SYLEN
                </Link>
                <Link href="/people" className="secondary-button flex-1 justify-center py-3">
                  Browse people
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Stats strip ── */}
      <section
        className="bg-slate-50 py-16 px-6 border-y border-outline-variant/30"
        style={bleed}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-3 gap-12 text-center">
          <div>
            <div className="text-4xl font-headline font-bold text-brand-navy mb-2">{fmt(memberCount)}</div>
            <div className="text-[10px] font-label uppercase tracking-[0.2em] text-on-surface-variant">Network Members</div>
          </div>
          <div>
            <div className="text-4xl font-headline font-bold text-brand-navy mb-2">{fmt(postCount)}</div>
            <div className="text-[10px] font-label uppercase tracking-[0.2em] text-on-surface-variant">Discussions Posted</div>
          </div>
          <div>
            <div className="text-4xl font-headline font-bold text-brand-navy mb-2">{groupCount}</div>
            <div className="text-[10px] font-label uppercase tracking-[0.2em] text-on-surface-variant">Working Groups</div>
          </div>
        </div>
      </section>

      {/* ── Trending Discussions ── */}
      {recentPosts.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="flex items-center justify-between mb-12 border-b border-outline-variant/30 pb-6">
            <h2 className="font-headline text-2xl font-bold tracking-tight uppercase flex items-center gap-3 text-brand-navy">
              <span className="w-8 h-[2px] bg-brand-navy inline-block"></span>
              Trending Discussions
            </h2>
            <div className="hidden md:flex gap-6 text-xs font-label uppercase tracking-widest text-on-surface-variant">
              <Link href="/feed" className="text-brand-navy font-bold border-b border-brand-navy">Recent</Link>
              <Link href="/onboarding" className="hover:text-brand-navy transition-colors">Join to see more</Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Featured post */}
            <article className="md:col-span-2 bg-white border border-outline-variant/60 p-8 flex flex-col justify-between relative hover:border-brand-navy/30 hover:shadow-lg transition-all group">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <span className="pill">Discussion</span>
                  {recentPosts[0].author && (
                    <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">
                      {recentPosts[0].author}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-headline font-bold leading-tight mb-4 text-brand-navy">
                  {recentPosts[0].title}
                </h3>
                <p className="text-on-surface-variant font-light leading-relaxed mb-6 line-clamp-4">
                  {recentPosts[0].body}
                </p>
              </div>
              <div className="flex items-center justify-between pt-6 border-t border-outline-variant/30">
                <Link href="/onboarding" className="text-xs font-label uppercase tracking-widest text-brand-accent hover:underline">
                  Join to read &amp; reply →
                </Link>
              </div>
            </article>

            {/* Sidebar: smaller posts + join nudge */}
            <div className="flex flex-col gap-6">
              {recentPosts.slice(1, 3).map((post) => (
                <article key={post.id} className="bg-white border border-outline-variant/60 p-6 hover:border-brand-navy/30 hover:shadow-sm transition-all">
                  <span className="text-[10px] font-label text-brand-accent font-bold uppercase tracking-[0.2em] mb-3 block">Discussion</span>
                  <h4 className="font-headline font-bold text-base mb-2 text-brand-navy leading-tight line-clamp-2">
                    {post.title}
                  </h4>
                  <p className="text-sm text-on-surface-variant line-clamp-2 mb-3">{post.body}</p>
                  {post.author && (
                    <span className="text-[10px] font-label uppercase text-on-surface-variant">{post.author}</span>
                  )}
                </article>
              ))}

              <div className="p-6 bg-slate-50 border border-outline-variant/30">
                <h5 className="font-headline font-bold text-sm uppercase tracking-widest mb-2 text-brand-navy">Join the Network</h5>
                <p className="text-xs text-on-surface-variant mb-4">
                  Access all discussions, post questions, and connect with peers.
                </p>
                <Link href="/onboarding" className="secondary-button w-full justify-center py-2 text-[10px]">
                  Get access
                </Link>
              </div>
            </div>
          </div>

          {/* Industry Dispatch — horizontal ticker */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6 pt-12 border-t border-outline-variant/30">
            <div className="md:col-span-1 md:border-r border-outline-variant/30 md:pr-6">
              <h3 className="font-headline font-bold text-sm uppercase tracking-widest mb-4 text-brand-navy">
                Industry Dispatch
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Latest discussions from systems engineers worldwide.
              </p>
            </div>
            <div className="md:col-span-3 flex overflow-x-auto gap-8 no-scrollbar pb-4">
              {recentPosts.map((post) => (
                <div key={post.id} className="min-w-[280px] group cursor-pointer shrink-0">
                  {post.author && (
                    <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest mb-2 block">
                      {post.author}
                    </span>
                  )}
                  <h4 className="font-headline font-bold text-base group-hover:text-brand-navy transition-colors text-brand-navy/80 line-clamp-2">
                    {post.title}
                  </h4>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Working groups ── */}
      <section
        className="border-t border-outline-variant/30 bg-slate-50 py-16 px-6"
        style={bleed}
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow mb-3">Community</p>
              <h2 className="text-2xl font-headline font-bold tracking-tight text-brand-navy md:text-3xl">
                Find your working group.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 soft-muted">
                Each group has a focused discussion feed, curated resources, and a directory of members in that domain.
              </p>
            </div>
            <Link href="/g" className="secondary-button shrink-0 self-start md:self-auto">
              All {groupCount} groups →
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
                  className="shell-card p-6 block hover:border-brand-navy/30 transition-colors group bg-white"
                >
                  <h3 className="text-base font-headline font-semibold text-brand-navy group-hover:text-brand-accent transition-colors">
                    {g.name}
                  </h3>
                  <p className="mt-2 text-sm leading-6 soft-muted line-clamp-2">{g.description}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {g.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="pill">
                        {tag}
                      </span>
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="py-20 md:py-28 border-t border-outline-variant/30">
        <div className="max-w-2xl">
          <p className="eyebrow mb-3">Get started</p>
          <h2 className="mb-4 text-3xl font-headline font-bold tracking-tight text-brand-navy md:text-4xl">
            Ready to find your people?
          </h2>
          <p className="mb-10 max-w-xl text-lg text-on-surface-variant font-light">
            Join a growing network of systems engineers who prefer depth over noise.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/onboarding" className="primary-button">
              Join the network
            </Link>
            <Link href="/people" className="secondary-button">
              Browse people
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
