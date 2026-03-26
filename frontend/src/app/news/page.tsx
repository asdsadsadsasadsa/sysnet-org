import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { newsItems } from "@/data/news";

export const dynamic = "force-dynamic";

type NewsArticle = {
  id: string;
  headline: string;
  summary: string;
  body: string;
  topic: string;
  image_url: string | null;
  hn_url: string;
  original_url: string | null;
  source_domain: string | null;
  published_at: string;
  hn_points: number;
  hn_comments: number;
};

async function getArticles(): Promise<NewsArticle[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("news_articles")
      .select("id,headline,summary,body,topic,image_url,hn_url,original_url,source_domain,published_at,hn_points,hn_comments")
      .order("published_at", { ascending: false })
      .limit(60);
    if (error || !data || data.length === 0) return [];
    return data as NewsArticle[];
  } catch {
    return [];
  }
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; article?: string }>;
}) {
  const { topic: selectedTopic, article: articleId } = await searchParams;
  const dbArticles = await getArticles();

  // If we have DB articles, use them; otherwise fall back to static data
  const hasDbArticles = dbArticles.length > 0;

  // Single article view
  if (articleId && hasDbArticles) {
    const article = dbArticles.find(a => a.id === articleId);
    if (article) {
      return (
        <div className="mx-auto max-w-3xl space-y-8 py-4">
          <Link href="/news" className="text-sm font-medium text-blue-700 hover:underline">
            ← Back to news
          </Link>
          <article>
            {article.image_url && (
              <div className="mb-8 overflow-hidden rounded-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.image_url}
                  alt={article.headline}
                  className="w-full object-cover"
                  style={{ maxHeight: 400 }}
                  loading="lazy"
                />
              </div>
            )}
            <span className="pill">{article.topic}</span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              {article.headline}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm soft-muted">
              <time dateTime={article.published_at}>
                {new Date(article.published_at).toLocaleDateString(undefined, {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </time>
              {article.source_domain && <span>Source: {article.source_domain}</span>}
              <a href={article.hn_url} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">
                {article.hn_comments} HN comments ↗
              </a>
            </div>
            <div className="prose prose-slate mt-8 max-w-none">
              {article.body.split('\n').map((line, i) => {
                if (line.startsWith('## ')) return <h2 key={i} className="mt-8 text-xl font-semibold text-slate-900">{line.slice(3)}</h2>;
                if (line.startsWith('### ')) return <h3 key={i} className="mt-6 text-lg font-semibold text-slate-900">{line.slice(4)}</h3>;
                if (line.startsWith('# ')) return <h1 key={i} className="mt-8 text-2xl font-bold text-slate-900">{line.slice(2)}</h1>;
                if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 text-slate-700">{line.slice(2)}</li>;
                if (!line.trim()) return <div key={i} className="h-4" />;
                // Handle inline links [text](url)
                const parts = line.split(/(\[([^\]]+)\]\(([^)]+)\))/g);
                if (parts.length === 1) return <p key={i} className="text-[15px] leading-7 text-slate-700">{line}</p>;
                return (
                  <p key={i} className="text-[15px] leading-7 text-slate-700">
                    {parts.map((part, j) => {
                      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
                      if (linkMatch) return <a key={j} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">{linkMatch[1]}</a>;
                      return part;
                    })}
                  </p>
                );
              })}
            </div>
          </article>
        </div>
      );
    }
  }

  // List view
  const topics = hasDbArticles
    ? ["All", ...new Set(dbArticles.map(a => a.topic))]
    : ["All", ...new Set(newsItems.map(i => i.topic))];

  const filtered = hasDbArticles
    ? (selectedTopic && selectedTopic !== "All" ? dbArticles.filter(a => a.topic === selectedTopic) : dbArticles)
    : (selectedTopic && selectedTopic !== "All" ? newsItems.filter(i => i.topic === selectedTopic) : newsItems);

  return (
    <div className="space-y-6">
      <section className="page-grid">
        <div className="shell-card-strong p-6 md:p-8">
          <p className="eyebrow">SYLEN</p>
          <h1 className="section-title mt-3">Systems engineering news</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 soft-muted">
            Synthesized articles on reliability, MBSE, architecture, safety-critical systems, and engineering practice — sourced from the best technical discussions on the web.
          </p>
        </div>
        <aside className="shell-card p-6">
          <p className="eyebrow">Filter by topic</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {topics.map(topic => (
              <Link
                key={topic}
                href={topic === "All" ? "/news" : `/news?topic=${encodeURIComponent(topic)}`}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  (selectedTopic || "All") === topic
                    ? "bg-slate-900 text-white"
                    : "bg-white/80 text-slate-600 hover:bg-white hover:text-slate-900 border border-slate-200/80"
                }`}
              >
                {topic}
              </Link>
            ))}
          </div>
        </aside>
      </section>

      {hasDbArticles ? (
        <section className="grid gap-6 md:grid-cols-2">
          {(filtered as NewsArticle[]).map(article => (
            <article key={article.id} className="shell-card flex flex-col overflow-hidden transition-shadow hover:shadow-md">
              {article.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={article.image_url}
                  alt={article.headline}
                  className="h-48 w-full object-cover"
                  loading="lazy"
                />
              )}
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center justify-between gap-4">
                  <span className="pill">{article.topic}</span>
                  <time className="text-xs soft-muted" dateTime={article.published_at}>
                    {new Date(article.published_at).toLocaleDateString(undefined, {
                      year: "numeric", month: "short", day: "numeric",
                    })}
                  </time>
                </div>
                <h2 className="mt-4 text-xl font-semibold tracking-tight text-slate-900">
                  <Link href={`/news?article=${article.id}`} className="hover:text-blue-700">
                    {article.headline}
                  </Link>
                </h2>
                <p className="mt-3 flex-grow text-[15px] leading-7 text-slate-700">
                  {article.summary}
                </p>
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                  <div className="flex gap-3 text-xs soft-muted">
                    {article.source_domain && <span>{article.source_domain}</span>}
                    <a href={article.hn_url} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">
                      {article.hn_comments} comments ↗
                    </a>
                  </div>
                  <Link href={`/news?article=${article.id}`} className="text-sm font-semibold text-blue-700 hover:underline">
                    Read →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="grid gap-6 md:grid-cols-2">
          {(filtered as typeof newsItems).map(item => (
            <article key={item.id} className="shell-card flex flex-col p-6 transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between gap-4">
                <span className="pill">{item.topic}</span>
                <time className="text-xs soft-muted" dateTime={item.publishedAt}>
                  {new Date(item.publishedAt).toLocaleDateString(undefined, {
                    year: "numeric", month: "short", day: "numeric",
                  })}
                </time>
              </div>
              <h2 className="mt-4 text-xl font-semibold tracking-tight text-slate-900">
                <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-700">
                  {item.headline}
                </a>
              </h2>
              <p className="mt-3 flex-grow text-[15px] leading-7 text-slate-700">{item.summary}</p>
              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-xs font-medium text-slate-500">Source: {item.authorName || "External"}</span>
                <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-700 hover:underline">
                  Read more →
                </a>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
