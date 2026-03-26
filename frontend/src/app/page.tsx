import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GROUPS } from "@/data/groups";

export const dynamic = "force-dynamic";

const bleed = {
  marginLeft: "calc(50% - 50vw)",
  width: "100vw",
} as React.CSSProperties;

// Filter out test-artifact posts
const TEST_ARTIFACT_RE = /e2e|test insight|automated test|\b17\d{2}\b/i;

type RecentPost = {
  id: string;
  title: string;
  body: string;
  author: string | null;
  handle: string | null;
  label?: string;
};

const STATIC_POSTS: RecentPost[] = [
  {
    id: "s1",
    title: "Model-Based Systems Engineering at Scale: Lessons from Aerospace Programs",
    body: "An analysis of MBSE adoption patterns across major aerospace programs, examining how teams handle tool interoperability and model governance at enterprise scale.",
    author: "SYLEN Editorial",
    handle: null,
    label: "Systems Architecture",
  },
  {
    id: "s2",
    title: "Formal Verification in Safety-Critical Embedded Systems",
    body: "Practical constraints of applying formal methods to DO-178C certified software — where the tooling falls short and what hybrid approaches work in production.",
    author: "SYLEN Editorial",
    handle: null,
    label: "Safety Engineering",
  },
  {
    id: "s3",
    title: "Redundancy Architectures for Autonomous Vehicle Control Planes",
    body: "Comparing fault-tolerant topologies for AV compute stacks: hot standby, triple modular redundancy, and probabilistic voting systems under real-world failure distributions.",
    author: "SYLEN Editorial",
    handle: null,
    label: "Autonomous Systems",
  },
];

const STATIC_DISPATCH = [
  { id: "d1", time: "08:00 UTC", title: "New Working Group Formed: Quantum-Classical Hybrid Control Systems" },
  { id: "d2", time: "06:30 UTC", title: "Community Report: MBSE Tool Benchmarks for 2026 Released" },
  { id: "d3", time: "04:15 UTC", title: "Discussion: Rust-Based Safety Monitors in Avionics — Real-World Tradeoffs" },
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
  let rawPosts: RecentPost[] = [];
  try {
    const { data: postRows } = await supabase
      .from("posts")
      .select("id,title,body,author_id")
      .order("created_at", { ascending: false })
      .limit(9);
    if (postRows && postRows.length > 0) {
      const authorIds = [...new Set(postRows.map((p: { author_id: string }) => p.author_id))];
      const { data: authorRows } = await supabase
        .from("profile_identities")
        .select("id,display_name,handle")
        .in("id", authorIds);
      const authorsById = new Map(
        (authorRows || []).map((a: { id: string; display_name: string; handle: string }) => [a.id, a])
      );
      rawPosts = postRows.map((p: { id: string; title: string; body: string; author_id: string }) => {
        const author = authorsById.get(p.author_id) as { display_name: string; handle: string } | undefined;
        return { id: p.id, title: p.title, body: p.body, author: author?.display_name ?? null, handle: author?.handle ?? null };
      });
    }
  } catch (_) {
    // Non-fatal
  }

  // Filter out test artifact posts
  const cleanPosts = rawPosts.filter(
    (p) => !TEST_ARTIFACT_RE.test(p.title) && !TEST_ARTIFACT_RE.test(p.body)
  );

  // Backfill with static editorial placeholders if fewer than 3 clean posts
  const displayPosts: RecentPost[] =
    cleanPosts.length >= 3
      ? cleanPosts
      : [...cleanPosts, ...STATIC_POSTS.slice(cleanPosts.length)];

  // Dispatch strip: use posts [3..5] if available, otherwise static placeholders
  const dispatchItems =
    displayPosts.length > 3
      ? displayPosts.slice(3, 6).map((p, i) => ({
          id: p.id,
          time: STATIC_DISPATCH[i]?.time ?? "UTC",
          title: p.title,
        }))
      : STATIC_DISPATCH;

  const fmt = (n: number | null) =>
    n == null ? "—" : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  return (
    <div>

      {/* ── Hero — asymmetric 2-col editorial grid ── */}
      <section className="relative py-12 md:py-24 overflow-hidden" style={bleed}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 50%, rgba(15,23,42,0.03) 0%, transparent 70%)" }}></div>
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">

          {/* Left 8 cols: headline */}
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-brand-navy text-[10px] font-label uppercase tracking-[0.2em] mb-6 border border-outline-variant/50">
              SYLEN — SYstems Leadership &amp; Engineering Network
            </div>
            <h1 className="text-5xl md:text-7xl font-headline font-bold tracking-tighter text-brand-navy leading-[0.9] mb-8">
              The Future of <span className="text-brand-accent italic">Autonomous</span> Systems Engineering.
            </h1>
            <p className="text-on-surface-variant text-lg max-w-2xl leading-relaxed font-light">
              SYLEN is the professional authority for systems engineers who design, build, and verify complex systems. Connect with credible peers, share implementation knowledge, and build professional trust — without the noise.
            </p>
          </div>

          {/* Right 4 cols: CTA card */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="p-6 bg-white border border-outline-variant shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100 -mr-16 -mt-16 rounded-full blur-3xl group-hover:bg-brand-accent/5 transition-colors pointer-events-none"></div>
              <h3 className="font-headline font-bold text-xl mb-2 text-brand-navy">Join the Network</h3>
              <p className="text-sm text-on-surface-variant mb-6 leading-snug">
                Connect with systems engineers worldwide. Share knowledge, find collaborators, and grow your practice.
              </p>
              <div className="flex gap-3">
                <Link
                  href="/onboarding"
                  className="flex-1 py-3 bg-brand-navy text-white font-label text-xs uppercase tracking-widest font-bold hover:bg-slate-800 transition-all text-center"
                >
                  Join SYLEN
                </Link>
                <Link
                  href="/people"
                  className="flex-1 py-3 border border-outline-variant text-brand-navy font-label text-xs uppercase tracking-widest hover:bg-slate-50 transition-all text-center"
                >
                  Browse
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Trending Discussions ── */}
      <section className="py-16 md:py-24">
        <div className="flex items-center justify-between mb-12 border-b border-outline-variant/30 pb-6">
          <h2 className="font-headline text-2xl font-bold tracking-tight uppercase flex items-center gap-3 text-brand-navy">
            <span className="w-8 h-[2px] bg-brand-navy inline-block"></span>
            Trending Discussions
          </h2>
          <div className="hidden md:flex gap-6 text-xs font-label uppercase tracking-widest text-on-surface-variant">
            <Link href="/feed" className="text-brand-navy font-bold border-b border-brand-navy">Recent</Link>
            <button className="hover:text-brand-navy transition-colors">Top Posts</button>
            <button className="hover:text-brand-navy transition-colors">Peer-Selected</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Large Featured Discussion */}
          <article className="md:col-span-2 bg-white border border-outline-variant/60 p-8 flex flex-col justify-between relative hover:border-brand-navy/30 hover:shadow-lg transition-all group">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[10px] font-label text-brand-navy font-bold uppercase tracking-widest px-2 py-1 border border-brand-navy/20 bg-slate-50">
                  {displayPosts[0]?.label ?? "Discussion"}
                </span>
                {displayPosts[0]?.author && (
                  <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest">
                    {displayPosts[0].author}
                  </span>
                )}
              </div>
              <h3 className="text-3xl font-headline font-bold leading-tight mb-4 group-hover:text-brand-navy transition-colors text-brand-navy">
                {displayPosts[0]?.title}
              </h3>
              <p className="text-on-surface-variant font-light leading-relaxed mb-6 line-clamp-4">
                {displayPosts[0]?.body}
              </p>
            </div>
            <div className="flex items-center justify-between pt-6 border-t border-outline-variant/30">
              <Link
                href="/onboarding"
                className="text-xs font-label uppercase tracking-widest text-brand-accent hover:underline"
              >
                Join to read &amp; reply →
              </Link>
            </div>
          </article>

          {/* Sidebar Secondary Items */}
          <div className="flex flex-col gap-8">
            {[displayPosts[1], displayPosts[2]].map((post, i) => (
              <article
                key={post?.id ?? `static-${i}`}
                className="bg-white border border-outline-variant/60 p-6 hover:border-brand-navy/30 hover:shadow-sm transition-all group"
              >
                <span className="text-[10px] font-label text-brand-accent font-bold uppercase tracking-[0.2em] mb-4 block">
                  {post?.label ?? "Discussion"}
                </span>
                <h4 className="font-headline font-bold text-lg mb-3 leading-tight group-hover:text-brand-navy text-brand-navy line-clamp-3">
                  {post?.title}
                </h4>
                <p className="text-sm text-on-surface-variant line-clamp-2 mb-4">{post?.body}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-label uppercase text-on-surface-variant">{post?.author}</span>
                  <span className="text-sm text-brand-navy">→</span>
                </div>
              </article>
            ))}

            <div className="mt-auto p-[1px] bg-outline-variant/30">
              <div className="bg-slate-50 p-6">
                <h5 className="font-headline font-bold text-sm uppercase tracking-widest mb-2 text-brand-navy">
                  Join the Network
                </h5>
                <p className="text-xs text-on-surface-variant mb-4">
                  Access all discussions, post questions, and connect with peers.
                </p>
                <Link
                  href="/onboarding"
                  className="block w-full py-2 bg-white text-brand-navy font-label text-[10px] uppercase tracking-[0.2em] border border-outline-variant hover:bg-slate-100 transition-all text-center"
                >
                  Get Access
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Industry Dispatch — horizontal scroll strip */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6 pt-12 border-t border-outline-variant/30">
          <div className="md:col-span-1 md:border-r border-outline-variant/30 md:pr-6">
            <h3 className="font-headline font-bold text-sm uppercase tracking-widest mb-4 text-brand-navy">
              Industry Dispatch
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Daily technical updates from our global field engineers and research labs.
            </p>
          </div>
          <div className="md:col-span-3 flex overflow-x-auto gap-8 no-scrollbar pb-4">
            {dispatchItems.map((item) => (
              <div key={item.id} className="min-w-[280px] group cursor-pointer shrink-0">
                <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest mb-2 block">
                  {item.time}
                </span>
                <h4 className="font-headline font-bold text-base group-hover:text-brand-navy transition-colors text-brand-navy/80 line-clamp-2">
                  {item.title}
                </h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <section
        className="bg-slate-50 py-16 px-6 border-y border-outline-variant/30"
        style={bleed}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
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
          <div>
            <div className="text-4xl font-headline font-bold text-brand-navy mb-2">99.9%</div>
            <div className="text-[10px] font-label uppercase tracking-[0.2em] text-on-surface-variant">Verification Index</div>
          </div>
        </div>
      </section>

      {/* ── Working Groups ── */}
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

      {/* ── Footer ── */}
      <footer
        className="bg-white pt-24 pb-12 px-6 border-t border-outline-variant/30"
        style={bleed}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <span className="text-2xl font-bold tracking-tighter text-brand-navy font-headline mb-6 block">
                SYLEN
              </span>
              <p className="text-on-surface-variant max-w-sm mb-8 leading-relaxed font-light">
                The professional network for systems engineers. We maintain the highest standards of technical depth and peer-verified knowledge sharing.
              </p>
              <div className="flex gap-6">
                <a href="#" className="text-on-surface-variant hover:text-brand-navy transition-colors font-label text-xs uppercase tracking-widest">Twitter</a>
                <a href="#" className="text-on-surface-variant hover:text-brand-navy transition-colors font-label text-xs uppercase tracking-widest">GitHub</a>
                <a href="#" className="text-on-surface-variant hover:text-brand-navy transition-colors font-label text-xs uppercase tracking-widest">LinkedIn</a>
              </div>
            </div>
            <div>
              <h5 className="font-headline font-bold text-xs uppercase tracking-widest mb-6 text-brand-navy">Explore</h5>
              <ul className="flex flex-col gap-4 text-sm text-on-surface-variant">
                <li><Link href="/feed" className="hover:text-brand-navy transition-all">News Feed</Link></li>
                <li><Link href="/people" className="hover:text-brand-navy transition-all">Network</Link></li>
                <li><Link href="/g" className="hover:text-brand-navy transition-all">Working Groups</Link></li>
                <li><Link href="/onboarding" className="hover:text-brand-navy transition-all">Join SYLEN</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-headline font-bold text-xs uppercase tracking-widest mb-6 text-brand-navy">Legal</h5>
              <ul className="flex flex-col gap-4 text-sm text-on-surface-variant">
                <li><a href="#" className="hover:text-brand-navy transition-all">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-brand-navy transition-all">Terms of Service</a></li>
                <li><a href="#" className="hover:text-brand-navy transition-all">Open Standards</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-outline-variant/30 flex flex-col md:flex-row justify-between items-center gap-6">
            <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest">
              © 2026 SYLEN.org — SYstems Leadership &amp; Engineering Network
            </span>
            <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-navy"></span>
              Version 1.0.0-Beta Build
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
