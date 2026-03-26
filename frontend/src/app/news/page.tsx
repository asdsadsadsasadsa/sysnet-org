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
      .select(
        "id,headline,summary,body,topic,image_url,hn_url,original_url,source_domain,published_at,hn_points,hn_comments",
      )
      .order("published_at", { ascending: false })
      .limit(60);

    if (error || !data) return [];
    return data as NewsArticle[];
  } catch {
    return [];
  }
}

function formatInlineMarkdown(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="underline underline-offset-4">$1</a>',
    );
}

function renderMarkdown(body: string) {
  const blocks = body
    .split(/\n\n+/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks.map((block, index) => {
    if (/^###\s+/.test(block)) {
      return (
        <h3
          key={index}
          className="text-2xl font-semibold tracking-[-0.03em] text-slate-950"
          dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(block.replace(/^###\s+/, "")) }}
        />
      );
    }

    if (/^##\s+/.test(block)) {
      return (
        <h2
          key={index}
          className="text-3xl font-semibold tracking-[-0.03em] text-slate-950"
          dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(block.replace(/^##\s+/, "")) }}
        />
      );
    }

    if (/^#\s+/.test(block)) {
      return (
        <h1
          key={index}
          className="text-4xl font-semibold tracking-[-0.04em] text-slate-950"
          dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(block.replace(/^#\s+/, "")) }}
        />
      );
    }

    if (/^(?:- |\* )/m.test(block)) {
      const items = block
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => /^(?:- |\* )/.test(line))
        .map((line) => line.replace(/^(?:- |\* )/, ""));

      return (
        <ul key={index} className="list-disc space-y-3 pl-6 text-base leading-8 text-slate-700">
          {items.map((item, itemIndex) => (
            <li key={itemIndex} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(item) }} />
          ))}
        </ul>
      );
    }

    return (
      <p
        key={index}
        className="text-base leading-8 text-slate-700"
        dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(block) }}
      />
    );
  });
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; article?: string }>;
}) {
  const { topic: selectedTopic, article: articleId } = await searchParams;
  const dbArticles = await getArticles();
  const hasDbArticles = dbArticles.length > 0;

  const fallbackArticles = newsItems.map((item) => ({
    id: item.id,
    headline: item.headline,
    summary: item.summary,
    body: item.summary,
    topic: item.topic,
    image_url: null,
    hn_url: "",
    original_url: item.sourceUrl,
    source_domain: (() => {
      try {
        return new URL(item.sourceUrl).hostname.replace("www.", "");
      } catch {
        return null;
      }
    })(),
    published_at: item.publishedAt,
    hn_points: 0,
    hn_comments: 0,
  }));

  const allArticles = hasDbArticles ? dbArticles : fallbackArticles;
  const articles = selectedTopic
    ? allArticles.filter((article) => article.topic === selectedTopic)
    : allArticles;
  const topics = Array.from(new Set(allArticles.map((article) => article.topic))).sort();

  if (articleId) {
    const article = allArticles.find((entry) => entry.id === articleId);
    if (article) {
      return (
        <div className="mx-auto max-w-4xl px-6 py-8 md:px-10">
          <Link href="/news" className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500 hover:text-slate-900">
            Back to news
          </Link>

          <article className="mt-6 space-y-8 bg-white p-8 md:p-12">
            {article.image_url && (
              <div className="space-y-2 overflow-hidden bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.image_url}
                  alt={article.headline}
                  className="h-auto w-full object-cover"
                  loading="lazy"
                />
                <p className="px-1 pb-1 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  {article.image_url.includes("pollinations.ai")
                    ? "Illustration: generated for SYLEN"
                    : `Image courtesy of ${article.source_domain ?? "the original source"}`}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                <span>{article.topic}</span>
                {article.source_domain && <span>Source: {article.source_domain}</span>}
                <time dateTime={article.published_at}>
                  {new Date(article.published_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </div>

              <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-slate-950 md:text-6xl">
                {article.headline}
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-slate-600">{article.summary}</p>
            </div>

            <div className="space-y-6">{renderMarkdown(article.body)}</div>

            {article.original_url && (
              <div className="bg-slate-50 p-5 text-sm text-slate-700">
                Read the original article at{" "}
                <a
                  href={article.original_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline underline-offset-4"
                >
                  {article.source_domain ?? article.original_url}
                </a>
                .
              </div>
            )}
          </article>
        </div>
      );
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
      <section className="grid gap-8 bg-white p-8 md:grid-cols-[minmax(0,1.5fr)_320px] md:p-12">
        <div className="space-y-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">SYLEN News Desk</p>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-slate-950 md:text-6xl">
            Synthesized articles for systems engineers.
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-slate-600">
            Technical analysis on reliability, architecture, safety-critical systems, defense, embedded platforms,
            software delivery, and engineering practice — written for the people building real systems.
          </p>
        </div>

        <div className="space-y-4 bg-slate-50 p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Coverage</p>
          <div className="space-y-3 text-sm text-slate-700">
            <p>New articles are sourced from strong technical discussions and rewritten as editorial analysis for SYLEN.</p>
            <p>We credit the original source directly — not the aggregator.</p>
            <p>{articles.length} article{articles.length === 1 ? "" : "s"} available now.</p>
          </div>
        </div>
      </section>

      {topics.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/news"
            className={`px-4 py-2 text-sm ${!selectedTopic ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
          >
            All
          </Link>
          {topics.map((topic) => (
            <Link
              key={topic}
              href={`/news?topic=${encodeURIComponent(topic)}`}
              className={`px-4 py-2 text-sm ${selectedTopic === topic ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
            >
              {topic}
            </Link>
          ))}
        </div>
      )}

      {articles.length === 0 ? (
        <div className="mt-10 bg-white p-10 text-slate-600">
          No articles published yet. The newsGenerator pipeline is ready and will populate this page automatically.
        </div>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.9fr)]">
          {articles[0] && (
            <article className="bg-white p-8 md:p-10">
              {articles[0].image_url && (
                <Link href={`/news?article=${articles[0].id}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={articles[0].image_url}
                    alt={articles[0].headline}
                    className="mb-6 h-auto w-full object-cover"
                    loading="lazy"
                  />
                </Link>
              )}
              <div className="space-y-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  {articles[0].topic}
                </p>
                <Link href={`/news?article=${articles[0].id}`} className="block text-3xl font-semibold tracking-[-0.03em] text-slate-950 hover:text-slate-700 md:text-5xl">
                  {articles[0].headline}
                </Link>
                <p className="text-lg leading-8 text-slate-600">{articles[0].summary}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                  <time dateTime={articles[0].published_at}>
                    {new Date(articles[0].published_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                </div>
              </div>
            </article>
          )}

          <div className="space-y-5">
            {articles.slice(1).map((article) => (
              <article key={article.id} className="bg-white p-6">
                <div className="space-y-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">{article.topic}</p>
                  <Link href={`/news?article=${article.id}`} className="block text-2xl font-semibold tracking-[-0.03em] text-slate-950 hover:text-slate-700">
                    {article.headline}
                  </Link>
                  <p className="text-sm leading-7 text-slate-600">{article.summary}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.18em] text-slate-500">
                    <time dateTime={article.published_at}>
                      {new Date(article.published_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
