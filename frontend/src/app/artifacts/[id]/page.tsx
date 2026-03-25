"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ARTIFACTS, TYPE_LABELS, TYPE_COLORS } from "@/data/artifacts";

export default function ArtifactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const artifact = ARTIFACTS.find((a) => a.id === id);

  if (!artifact) {
    return (
      <div className="p-12 text-center">
        <h1 className="text-2xl font-bold">Artifact not found</h1>
        <Link href="/artifacts" className="text-blue-700 hover:underline mt-4 block">Back to Library</Link>
      </div>
    );
  }

  const related = ARTIFACTS
    .filter((a) => a.domain === artifact.domain && a.id !== artifact.id)
    .slice(0, 3);

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center gap-2">
        <Link href="/artifacts" className="pill hover:bg-slate-200">← Back to Library</Link>
        <span className={`pill border ${TYPE_COLORS[artifact.type]}`}>{TYPE_LABELS[artifact.type]}</span>
      </div>

      <div className="shell-card-strong p-6 md:p-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-medium text-slate-500">{artifact.domain}</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-snug">{artifact.title}</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">{artifact.description}</p>

        <div className="mt-6 flex flex-wrap gap-1.5">
          {artifact.tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500 rounded border border-slate-200">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
          <div>
            <div className="text-sm font-medium text-slate-700">{artifact.author}</div>
            <div className="text-xs text-slate-400">Published {new Date(artifact.publishedAt).toLocaleDateString("en-GB", { year: "numeric", month: "long" })}</div>
          </div>
          <a href={artifact.downloadUrl} className="primary-button px-5 py-2.5">
            Download / View
          </a>
        </div>
      </div>

      {related.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Related — {artifact.domain}</h2>
          {related.map((r) => (
            <Link key={r.id} href={`/artifacts/${r.id}`} className="shell-card p-4 flex items-start gap-3 hover:border-blue-300 transition-colors">
              <span className={`inline-block rounded-lg border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0 mt-0.5 ${TYPE_COLORS[r.type]}`}>
                {TYPE_LABELS[r.type]}
              </span>
              <div>
                <div className="text-sm font-semibold text-slate-900 hover:text-blue-700">{r.title}</div>
                <div className="text-xs text-slate-500 mt-1 line-clamp-1">{r.description}</div>
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
