"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { ARTIFACTS, ARTIFACT_TYPES, ARTIFACT_DOMAINS, TYPE_LABELS, TYPE_COLORS, type ArtifactType } from "@/data/artifacts";

export default function ArtifactsPage() {
  const [typeFilter, setTypeFilter] = useState<ArtifactType | "">("");
  const [domainFilter, setDomainFilter] = useState("");
  const [query, setQuery] = useState("");

  const filtered = ARTIFACTS.filter((a) => {
    if (typeFilter && a.type !== typeFilter) return false;
    if (domainFilter && a.domain !== domainFilter) return false;
    if (query) {
      const q = query.toLowerCase();
      if (
        !a.title.toLowerCase().includes(q) &&
        !a.description.toLowerCase().includes(q) &&
        !a.tags.some((t) => t.toLowerCase().includes(q))
      ) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="shell-card p-4 flex flex-wrap gap-3 items-center">
        <input
          type="search"
          placeholder="Search artifacts…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 min-w-48"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as ArtifactType | "")}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {ARTIFACT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <select
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {ARTIFACT_DOMAINS.map((d) => (
            <option key={d} value={d}>{d || "All domains"}</option>
          ))}
        </select>
        {(typeFilter || domainFilter || query) && (
          <button
            onClick={() => { setTypeFilter(""); setDomainFilter(""); setQuery(""); }}
            className="secondary-button px-3 py-2 text-sm"
          >
            Clear
          </button>
        )}
        <span className="text-xs soft-muted ml-auto shrink-0">{filtered.length} artifact{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="shell-card p-12 text-center">
          <h2 className="text-lg font-semibold text-slate-900">No artifacts match your filters</h2>
          <p className="mt-2 text-sm soft-muted">Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((artifact) => (
            <div key={artifact.id} className="shell-card p-5 flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <span className={`inline-block rounded-lg border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider shrink-0 ${TYPE_COLORS[artifact.type]}`}>
                  {TYPE_LABELS[artifact.type]}
                </span>
                <span className="text-[11px] font-medium text-slate-400 shrink-0">{artifact.domain}</span>
              </div>

              <h2 className="mt-3 text-[15px] font-semibold leading-snug text-slate-900">{artifact.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 line-clamp-3 flex-1">{artifact.description}</p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {artifact.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500 rounded border border-slate-200">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                <div>
                  <div className="text-xs font-medium text-slate-700">{artifact.author}</div>
                  <div className="text-[11px] text-slate-400">{new Date(artifact.publishedAt).toLocaleDateString("en-GB", { year: "numeric", month: "short" })}</div>
                </div>
                <a
                  href={artifact.downloadUrl}
                  className="primary-button px-3 py-2 text-sm"
                >
                  Download / View
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
