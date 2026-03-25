"use client";
export const dynamic = "force-dynamic";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type SubmissionStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "accepted"
  | "revise"
  | "rejected";

type Submission = {
  id: string;
  author_id: string;
  title: string;
  abstract: string;
  authors: string;
  domain: string;
  tags: string[];
  status: SubmissionStatus;
  source_url: string | null;
  created_at: string;
  author_display_name: string | null;
  author_handle: string | null;
};

const STATUS_LABELS: Record<SubmissionStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under Review",
  accepted: "Accepted",
  revise: "Revisions Requested",
  rejected: "Rejected",
};

const STATUS_COLORS: Record<SubmissionStatus, string> = {
  draft: "bg-slate-100 text-slate-600 border-slate-200",
  submitted: "bg-blue-50 text-blue-700 border-blue-200",
  under_review: "bg-yellow-50 text-yellow-700 border-yellow-200",
  accepted: "bg-green-50 text-green-700 border-green-200",
  revise: "bg-orange-50 text-orange-700 border-orange-200",
  rejected: "bg-red-50 text-red-600 border-red-200",
};

const DOMAINS = [
  "Systems Engineering",
  "MBSE",
  "Safety",
  "Verification",
  "Aerospace",
  "Automotive",
  "Embedded",
  "Medical",
  "Robotics",
  "Digital Twin",
  "Architecture",
  "Space Systems",
];

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under Review" },
  { value: "accepted", label: "Accepted" },
  { value: "revise", label: "Revisions Requested" },
  { value: "rejected", label: "Rejected" },
  { value: "draft", label: "Draft" },
];

export default function SubmissionsPage() {
  const supabase = createClient();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerId, setViewerId] = useState("");
  const [domainFilter, setDomainFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formAuthors, setFormAuthors] = useState("");
  const [formAbstract, setFormAbstract] = useState("");
  const [formDomain, setFormDomain] = useState(DOMAINS[0]);
  const [formTags, setFormTags] = useState("");
  const [formSourceUrl, setFormSourceUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgTone, setMsgTone] = useState<"info" | "success" | "error">("info");

  async function load() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    setViewerId(user?.id ?? "");

    const { data, error } = await supabase
      .from("submissions")
      .select("id,author_id,title,abstract,authors,domain,tags,status,source_url,created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      setMsg(error.message);
      setMsgTone("error");
      setLoading(false);
      return;
    }

    const rows = (data || []) as Omit<Submission, "author_display_name" | "author_handle">[];
    const authorIds = [...new Set(rows.map((r) => r.author_id))];

    const { data: profileRows } = authorIds.length
      ? await supabase
          .from("profiles")
          .select("id,display_name,handle")
          .in("id", authorIds)
      : { data: [] as { id: string; display_name: string; handle: string }[] };

    const profileById = new Map(
      (profileRows || []).map((p: { id: string; display_name: string; handle: string }) => [p.id, p])
    );

    setSubmissions(
      rows.map((r) => {
        const profile = profileById.get(r.author_id);
        return {
          ...r,
          author_display_name: profile?.display_name ?? null,
          author_handle: profile?.handle ?? null,
        };
      })
    );

    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!formTitle.trim() || !formAuthors.trim() || !formAbstract.trim()) {
      setMsg("Title, authors, and abstract are required.");
      setMsgTone("error");
      return;
    }

    setSaving(true);
    setMsg("");

    const tags = formTags
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const { error } = await supabase.from("submissions").insert({
      author_id: viewerId,
      title: formTitle.trim(),
      authors: formAuthors.trim(),
      abstract: formAbstract.trim(),
      domain: formDomain,
      tags,
      source_url: formSourceUrl.trim() || null,
      status: "submitted",
    });

    setSaving(false);

    if (error) {
      setMsg(error.message);
      setMsgTone("error");
      return;
    }

    setMsg("Submission received. Thank you!");
    setMsgTone("success");
    setFormTitle("");
    setFormAuthors("");
    setFormAbstract("");
    setFormDomain(DOMAINS[0]);
    setFormTags("");
    setFormSourceUrl("");
    await load();
  }

  const filtered = submissions.filter((s) => {
    if (domainFilter && s.domain !== domainFilter) return false;
    if (statusFilter && s.status !== statusFilter) return false;
    return true;
  });

  const allDomains = [...new Set(submissions.map((s) => s.domain))].sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="page-grid">
        <div className="shell-card-strong p-6 md:p-8">
          <p className="eyebrow">Papers</p>
          <h1 className="section-title mt-3">Paper submissions</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 soft-muted">
            Preprints, conference papers, and journal articles from the Sysnet community. Submit your own work for peer visibility.
          </p>
        </div>
        <aside className="shell-card p-6">
          <p className="eyebrow">Status guide</p>
          <div className="mt-4 space-y-2">
            {(Object.keys(STATUS_LABELS) as SubmissionStatus[]).map((s) => (
              <div key={s} className="flex items-center gap-2">
                <span className={`inline-block rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[s]}`}>
                  {STATUS_LABELS[s]}
                </span>
              </div>
            ))}
          </div>
        </aside>
      </section>

      {/* Filter bar */}
      <div className="shell-card p-4 flex flex-wrap gap-3 items-center">
        <select
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All domains</option>
          {allDomains.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {STATUS_FILTER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {(domainFilter || statusFilter) && (
          <button
            onClick={() => { setDomainFilter(""); setStatusFilter(""); }}
            className="secondary-button px-3 py-2 text-sm"
          >
            Clear
          </button>
        )}
        <span className="text-xs soft-muted ml-auto shrink-0">
          {loading ? "Loading…" : `${filtered.length} paper${filtered.length !== 1 ? "s" : ""}`}
        </span>
      </div>

      {/* Error message */}
      {msg && msgTone === "error" && !saving && (
        <div className="shell-card p-4 text-sm font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
          {msg}
        </div>
      )}

      {/* Submissions list */}
      {loading ? (
        <div className="shell-card p-12 text-center">
          <p className="text-sm soft-muted">Loading submissions…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="shell-card p-12 text-center">
          <h2 className="text-lg font-semibold text-slate-900">No papers match your filters</h2>
          <p className="mt-2 text-sm soft-muted">Try adjusting the domain or status filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((sub) => (
            <div key={sub.id} className="shell-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-block rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[sub.status]}`}>
                    {STATUS_LABELS[sub.status]}
                  </span>
                  <span className="text-xs font-medium text-slate-500">{sub.domain}</span>
                </div>
                <span className="text-xs soft-muted shrink-0">
                  {new Date(sub.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>

              <h2 className="mt-3 text-[15px] font-semibold leading-snug text-slate-900">
                {sub.source_url ? (
                  <a
                    href={sub.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-700 hover:underline"
                  >
                    {sub.title}
                  </a>
                ) : (
                  sub.title
                )}
              </h2>

              <p className="mt-1 text-xs font-medium text-slate-500">
                {sub.authors}
                {sub.author_display_name && (
                  <> &middot; submitted by{" "}
                    <Link
                      href={`/people/${sub.author_handle}`}
                      className="text-blue-600 hover:underline"
                    >
                      {sub.author_display_name}
                    </Link>
                  </>
                )}
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600 line-clamp-3">
                {sub.abstract}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {sub.tags.slice(0, 5).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500 rounded border border-slate-200"
                  >
                    {tag}
                  </span>
                ))}
                {sub.source_url && (
                  <a
                    href={sub.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-xs font-medium text-blue-600 hover:underline shrink-0"
                  >
                    View paper →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit form */}
      <section className="shell-card p-6 md:p-8">
        {viewerId ? (
          <>
            <p className="eyebrow">Submit your work</p>
            <h2 className="section-title mt-2 text-2xl">Add a paper</h2>
            <p className="mt-2 text-sm soft-muted">
              Share a preprint, conference paper, or journal article with the community.
            </p>

            {msg && msgTone === "success" && (
              <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-700">
                {msg}
              </div>
            )}
            {msg && msgTone === "error" && saving && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700">
                {msg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Full paper title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Authors <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formAuthors}
                  onChange={(e) => setFormAuthors(e.target.value)}
                  placeholder="Comma-separated names, e.g. Alice Smith, Bob Jones"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Abstract <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={formAbstract}
                  onChange={(e) => setFormAbstract(e.target.value)}
                  placeholder="2–4 sentence summary of the paper"
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Domain <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formDomain}
                    onChange={(e) => setFormDomain(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {DOMAINS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="mbse, sysml, verification (comma-separated)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Source URL <span className="text-xs font-normal soft-muted">(optional — arXiv, DOI, publisher link)</span>
                </label>
                <input
                  type="url"
                  value={formSourceUrl}
                  onChange={(e) => setFormSourceUrl(e.target.value)}
                  placeholder="https://arxiv.org/abs/…"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="primary-button px-5 py-2.5 disabled:opacity-60"
                >
                  {saving ? "Submitting…" : "Submit paper"}
                </button>
                <span className="text-xs soft-muted">
                  Status will be set to <strong>Submitted</strong>
                </span>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center py-6">
            <p className="eyebrow">Submit your work</p>
            <h2 className="section-title mt-2 text-2xl">Share your research</h2>
            <p className="mt-3 text-sm soft-muted max-w-md mx-auto">
              Sign in to submit papers, preprints, and conference articles to the Sysnet community library.
            </p>
            <Link href="/onboarding" className="primary-button inline-flex mt-5 px-5 py-2.5">
              Sign in to submit your work
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
