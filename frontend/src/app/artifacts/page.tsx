"use client";

import { useState } from "react";
import Link from "next/link";
import { ARTIFACTS } from "@/data/artifacts";
import { GROUPS } from "@/data/groups";

const ARTIFACT_TYPES = [
  { value: "all", label: "All Types" },
  { value: "paper", label: "Papers" },
  { value: "spec", label: "Specifications" },
  { value: "standards-summary", label: "Standards Summaries" },
  { value: "reference-design", label: "Reference Designs" },
  { value: "case-study", label: "Case Studies" },
];

export default function ArtifactsIndexPage() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");

  const filteredArtifacts = ARTIFACTS.filter((a) => {
    const matchesType = typeFilter === "all" || a.artifact_type === typeFilter;
    const matchesGroup = groupFilter === "all" || a.group_slug === groupFilter;
    return matchesType && matchesGroup;
  }).sort((a, b) => b.published_year - a.published_year);

  return (
    <div className="space-y-8">
      <section className="page-grid">
        <div className="shell-card-strong p-6 md:p-8">
          <p className="eyebrow text-blue-600">Technical Repository</p>
          <h1 className="section-title mt-3">Artifacts & Paper Submissions</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 soft-muted">
            A curated collection of technical papers, specifications, reference designs, and standards summaries 
            vetted by the SysNet community. These artifacts represent the collective knowledge base of 
            modern systems engineering practice.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="flex flex-wrap gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Type</label>
          <select 
            className="pill bg-white border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            {ARTIFACT_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Working Group</label>
          <select 
            className="pill bg-white border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
          >
            <option value="all">All Groups</option>
            {GROUPS.map(g => (
              <option key={g.slug} value={g.slug}>{g.name}</option>
            ))}
          </select>
        </div>

        <div className="ml-auto text-sm font-medium text-slate-500">
          Showing {filteredArtifacts.length} artifacts
        </div>
      </section>

      {/* Results */}
      <div className="grid gap-6">
        {filteredArtifacts.length > 0 ? (
          filteredArtifacts.map((art) => (
            <Link 
              key={art.id} 
              href={`/artifacts/${art.id}`}
              className="shell-card p-6 flex flex-col md:flex-row gap-6 hover:border-blue-300 transition-colors group"
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 bg-blue-50 text-[10px] font-bold uppercase tracking-wider text-blue-700 rounded border border-blue-100">
                    {art.artifact_type.replace('-', ' ')}
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    {art.published_year}
                  </span>
                  <span className="text-xs font-medium text-slate-400">·</span>
                  <span className="text-xs font-bold text-slate-600">
                    @{art.author_handle}
                  </span>
                </div>
                
                <h2 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-tight">
                  {art.title}
                </h2>
                
                <p className="mt-3 text-sm text-slate-600 leading-relaxed line-clamp-2">
                  {art.abstract}
                </p>
                
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {art.tags.map(tag => (
                    <span key={tag} className="px-1.5 py-0.5 bg-slate-100 text-[10px] font-medium text-slate-500 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="md:w-48 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Group</div>
                  <div className="text-xs font-bold text-slate-900 mt-1">
                    {GROUPS.find(g => g.slug === art.group_slug)?.name || art.group_slug}
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0 text-sm font-bold text-blue-700 flex items-center gap-1">
                  View full artifact
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="shell-card p-12 text-center">
            <h2 className="text-lg font-semibold text-slate-900">No artifacts match your filters</h2>
            <p className="mt-2 text-sm soft-muted">Try adjusting your type or group selection.</p>
            <button 
              onClick={() => { setTypeFilter("all"); setGroupFilter("all"); }}
              className="mt-4 pill border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
