"use client";

import { useState } from "react";
import { newsItems, NewsItem } from "@/data/news";

export default function NewsPage() {
  const [selectedTopic, setSelectedTopic] = useState<string>("All");

  const topics = ["All", ...new Set(newsItems.map((item) => item.topic))];

  const filteredItems =
    selectedTopic === "All"
      ? newsItems
      : newsItems.filter((item) => item.topic === selectedTopic);

  return (
    <div className="space-y-6">
      <section className="page-grid">
        <div className="shell-card-strong p-6 md:p-8">
          <p className="eyebrow">News</p>
          <h1 className="section-title mt-3">Systems engineering news</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 soft-muted">
            Updates on standards, MBSE, aerospace, defense, and the broader systems engineering community.
          </p>
        </div>
        <aside className="shell-card p-6">
          <p className="eyebrow">Filter by topic</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {topics.map((topic) => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  selectedTopic === topic
                    ? "bg-slate-900 text-white"
                    : "bg-white/80 text-slate-600 hover:bg-white hover:text-slate-900 border border-slate-200/80"
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </aside>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        {filteredItems.map((item) => (
          <article key={item.id} className="shell-card flex flex-col p-6 transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between gap-4">
              <span className="pill">{item.topic}</span>
              <time className="text-xs soft-muted" dateTime={item.publishedAt}>
                {new Date(item.publishedAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </time>
            </div>
            <h2 className="mt-4 text-xl font-semibold tracking-tight text-slate-900">
              <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-700">
                {item.headline}
              </a>
            </h2>
            <p className="mt-3 flex-grow text-[15px] leading-7 text-slate-700">
              {item.summary}
            </p>
            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-xs font-medium text-slate-500">
                Source: {item.authorName || "External"}
              </span>
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-blue-700 hover:underline"
              >
                Read more →
              </a>
            </div>
          </article>
        ))}
      </section>

      {filteredItems.length === 0 && (
        <div className="shell-card p-12 text-center">
          <p className="soft-muted">No news items found for this topic.</p>
        </div>
      )}
    </div>
  );
}
