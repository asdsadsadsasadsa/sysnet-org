"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ARTIFACTS } from "@/data/artifacts";
import { GROUPS } from "@/data/groups";

export default function ArtifactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const artifact = ARTIFACTS.find(a => a.id === id);

  if (!artifact) {
    return (
      <div className="p-12 text-center">
        <h1 className="text-2xl font-bold">Artifact not found</h1>
        <Link href="/artifacts" className="text-blue-700 hover:underline mt-4 block">Back to repository</Link>
      </div>
    );
  }

  const group = GROUPS.find(g => g.slug === artifact.group_slug);
  const related = ARTIFACTS
    .filter(a => a.group_slug === artifact.group_slug && a.id !== artifact.id)
    .slice(0, 3);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <Link href="/artifacts" className="pill hover:bg-slate-200">← Back to Repository</Link>
        <span className="text-slate-300">/</span>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{artifact.id}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <main className="lg:col-span-8 space-y-8">
          <div className="shell-card-strong p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-2 py-0.5 bg-blue-50 text-[10px] font-bold uppercase tracking-wider text-blue-700 rounded border border-blue-100">
                {artifact.artifact_type.replace('-', ' ')}
              </span>
              <span className="text-xs font-bold text-slate-400">{artifact.published_year}</span>
            </div>
            
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-tight">
              {artifact.title}
            </h1>
            
            <div className="mt-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold">
                {artifact.author_handle[0].toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Submitted by @{artifact.author_handle}</div>
                <div className="text-xs text-slate-500">Peer-vetted contributor</div>
              </div>
            </div>
          </div>

          <div className="shell-card p-6 md:p-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Abstract</h2>
            <p className="text-lg leading-relaxed text-slate-700 font-serif italic">
              "{artifact.abstract}"
            </p>
            
            <div className="mt-10 pt-8 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Tags & Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {artifact.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-slate-100 text-xs font-bold text-slate-600 rounded-full border border-slate-200">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-10 flex gap-4">
              <button className="pill bg-slate-900 text-white hover:bg-slate-800 px-6 py-2.5">
                Download PDF
              </button>
              {artifact.external_url && (
                <a 
                  href={artifact.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pill border-slate-200 text-slate-700 hover:bg-slate-50 px-6 py-2.5 flex items-center gap-2"
                >
                  External Link
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </main>

        <aside className="lg:col-span-4 space-y-6">
          <div className="shell-card p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Context</h3>
            <div className="space-y-4">
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-500">Working Group</div>
                <Link href={`/g/${artifact.group_slug}`} className="text-sm font-bold text-blue-700 hover:underline block mt-1">
                  {group?.name || artifact.group_slug}
                </Link>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-500">Citation</div>
                <div className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {artifact.author_handle}, "{artifact.title}", SysNet Artifacts Repository, {artifact.published_year}.
                </div>
              </div>
            </div>
          </div>

          <div className="shell-card p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Related Artifacts</h3>
            <div className="space-y-4">
              {related.map(r => (
                <Link key={r.id} href={`/artifacts/${r.id}`} className="block group">
                  <div className="text-[10px] font-bold uppercase text-blue-600">{r.artifact_type}</div>
                  <div className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors mt-0.5 leading-snug">
                    {r.title}
                  </div>
                </Link>
              ))}
              {related.length === 0 && (
                <div className="text-sm text-slate-500 italic">No other artifacts in this group yet.</div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
