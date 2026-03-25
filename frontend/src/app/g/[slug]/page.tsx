"use client";
export const dynamic = 'force-dynamic';

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Post, PublicProfileSummary } from "@/lib/types";
import { GROUP_META } from "@/data/groups";
import { ARTIFACTS, TYPE_LABELS, TYPE_COLORS } from "@/data/artifacts";

type GroupPost = Post & {
  author?: PublicProfileSummary | null;
  commentCount: number;
  likeCount: number;
};

type SidebarMember = {
  id: string;
  handle: string;
  display_name: string;
  headline: string | null;
  open_to: string[];
};

type SidebarSubmission = {
  id: string;
  title: string;
  status: string;
  authors: string;
};

const SUBMISSION_STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600 border-slate-200",
  submitted: "bg-blue-50 text-blue-700 border-blue-200",
  under_review: "bg-yellow-50 text-yellow-700 border-yellow-200",
  accepted: "bg-green-50 text-green-700 border-green-200",
  revise: "bg-orange-50 text-orange-700 border-orange-200",
  rejected: "bg-red-50 text-red-600 border-red-200",
};

const SUBMISSION_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under Review",
  accepted: "Accepted",
  revise: "Revisions",
  rejected: "Rejected",
};

function memberMatchesGroup(slug: string, domains: string[], tags: string[]): boolean {
  const norm = slug.toLowerCase().replace(/-/g, " ");
  return [...(domains || []), ...(tags || [])]
    .map(s => s.toLowerCase().replace(/-/g, " ").trim())
    .some(v => v === norm || v.includes(norm));
}

function artifactMatchesGroup(slug: string, domain: string, tags: string[]): boolean {
  const norm = slug.toLowerCase().replace(/-/g, " ");
  const d = domain.toLowerCase().replace(/-/g, " ");
  return d === norm || d.includes(norm) || tags.some(t => {
    const tv = t.toLowerCase().replace(/-/g, " ");
    return tv === norm || tv.includes(norm);
  });
}

export default function GroupFeedPage() {
  const { slug } = useParams<{ slug: string }>();
  const supabase = createClient();
  const [posts, setPosts] = useState<GroupPost[]>([]);
  const [postCount, setPostCount] = useState(0);
  const [viewerId, setViewerId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgTone, setMsgTone] = useState<"info" | "success" | "error">("info");
  const [members, setMembers] = useState<SidebarMember[]>([]);
  const [relatedSubmissions, setRelatedSubmissions] = useState<SidebarSubmission[]>([]);
  const meta = GROUP_META[slug];

  const relatedArtifacts = ARTIFACTS.filter(a =>
    artifactMatchesGroup(slug, a.domain, a.tags)
  ).slice(0, 4);

  useEffect(() => {
    async function loadPosts() {
      const { data: { user } } = await supabase.auth.getUser();
      setViewerId(user?.id || "");

      const { data, count } = await supabase
        .from("posts")
        .select("id,author_id,group_slug,title,body,created_at", { count: "exact" })
        .eq("group_slug", slug)
        .order("created_at", { ascending: false })
        .limit(50);

      setPostCount(count || 0);
      const postRows = (data || []) as Post[];

      if (postRows.length === 0) {
        setPosts([]);
        return;
      }

      const authorIds = [...new Set(postRows.map(p => p.author_id))];
      const postIds = postRows.map(p => p.id);

      const [{ data: authors }, { data: comments }, { data: likes }] = await Promise.all([
        supabase.from("profile_identities").select("id,handle,display_name").in("id", authorIds),
        supabase.from("comments").select("post_id").in("post_id", postIds),
        supabase.from("likes").select("post_id").in("post_id", postIds)
      ]);

      const authorMap = new Map((authors as PublicProfileSummary[] || []).map(a => [a.id, a]));
      const commentCounts = new Map<string, number>();
      (comments || []).forEach(c => commentCounts.set(c.post_id, (commentCounts.get(c.post_id) || 0) + 1));
      const likeCounts = new Map<string, number>();
      (likes || []).forEach(l => likeCounts.set(l.post_id, (likeCounts.get(l.post_id) || 0) + 1));

      setPosts(postRows.map(p => ({
        ...p,
        author: authorMap.get(p.author_id) || null,
        commentCount: commentCounts.get(p.id) || 0,
        likeCount: likeCounts.get(p.id) || 0
      })));
    }

    async function loadSidebar() {
      // Members: fetch public profiles, filter client-side by domains/tags
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id,handle,display_name,headline,open_to,domains,tags")
        .eq("visibility", "public")
        .limit(100);

      const matchingMembers = ((profileData || []) as Array<SidebarMember & { domains: string[]; tags: string[] }>)
        .filter(p => memberMatchesGroup(slug, p.domains, p.tags))
        .slice(0, 8);

      setMembers(matchingMembers);

      // Related submissions: fuzzy domain match
      const slugNorm = slug.replace(/-/g, " ");
      const orFilter = slug === slugNorm
        ? `domain.ilike.%${slug}%`
        : `domain.ilike.%${slug}%,domain.ilike.%${slugNorm}%`;

      const { data: subData } = await supabase
        .from("submissions")
        .select("id,title,status,authors")
        .or(orFilter)
        .limit(3);

      setRelatedSubmissions((subData || []) as SidebarSubmission[]);
    }

    void loadPosts();
    void loadSidebar();
  }, [slug]);

  async function reloadPosts() {
    const { data } = await supabase
      .from("posts")
      .select("id,author_id,group_slug,title,body,created_at,updated_at")
      .eq("group_slug", slug)
      .order("created_at", { ascending: false })
      .limit(50);
    const postRows = (data || []) as Post[];
    if (postRows.length === 0) { setPosts([]); return; }
    const authorIds = [...new Set(postRows.map(p => p.author_id))];
    const postIds = postRows.map(p => p.id);
    const [{ data: authors }, { data: comments }, { data: likes }] = await Promise.all([
      supabase.from("profile_identities").select("id,handle,display_name").in("id", authorIds),
      supabase.from("comments").select("post_id").in("post_id", postIds),
      supabase.from("likes").select("post_id").in("post_id", postIds)
    ]);
    const authorMap = new Map(((authors as PublicProfileSummary[]) || []).map(a => [a.id, a]));
    const commentCounts = new Map<string, number>();
    (comments || []).forEach((c: { post_id: string }) => commentCounts.set(c.post_id, (commentCounts.get(c.post_id) || 0) + 1));
    const likeCounts = new Map<string, number>();
    (likes || []).forEach((l: { post_id: string }) => likeCounts.set(l.post_id, (likeCounts.get(l.post_id) || 0) + 1));
    setPosts(postRows.map(p => ({
      ...p,
      author: authorMap.get(p.author_id) || null,
      commentCount: commentCounts.get(p.id) || 0,
      likeCount: likeCounts.get(p.id) || 0
    })));
  }

  async function createPost(e: FormEvent) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMsgTone("error");
      return setMsg("Sign in first on /onboarding to start a discussion.");
    }
    if (!title.trim() || !body.trim()) {
      setMsgTone("error");
      return setMsg("Title and body are required.");
    }
    setBusy(true);
    const { error } = await supabase.from("posts").insert({ author_id: user.id, title, body, group_slug: slug });
    setBusy(false);
    if (error) {
      setMsgTone("error");
      return setMsg(error.message);
    }
    setTitle("");
    setBody("");
    setMsgTone("success");
    setMsg("Discussion posted.");
    setPostCount(c => c + 1);
    await reloadPosts();
  }

  if (!meta) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">Group not found</h1>
        <Link href="/g" className="text-blue-700 hover:underline mt-4 block">Back to all groups</Link>
      </div>
    );
  }

  return (
    <div className="page-grid">
      {/* Main: feed + compose */}
      <section className="space-y-4">
        {/* Group header */}
        <div className="shell-card-strong p-6">
          <div className="flex gap-2 mb-4">
            <Link href="/g" className="pill hover:bg-slate-200">← All Groups</Link>
            <span className="pill bg-blue-50 text-blue-700">{meta.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{meta.name}</h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600">{meta.description}</p>
          <p className="mt-2 text-xs soft-muted">
            {postCount} discussion{postCount !== 1 ? "s" : ""}
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {meta.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500 rounded border border-slate-200">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {viewerId && (
          <form onSubmit={createPost} className="shell-card space-y-4 p-5 md:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Start a discussion</h3>
                <p className="mt-1 text-sm soft-muted">Post a question, insight, or challenge for this group.</p>
              </div>
              <button disabled={busy} className="primary-button px-4 py-2.5 disabled:opacity-60">
                {busy ? "Publishing..." : "Publish"}
              </button>
            </div>
            <input placeholder="Discussion title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <textarea placeholder="Share a systems engineering insight relevant to this group..." value={body} onChange={(e) => setBody(e.target.value)} />
          </form>
        )}

        {!viewerId && (
          <div className="shell-card p-4 text-sm text-slate-600 flex items-center justify-between gap-4">
            <span>Sign in to start a discussion in this working group.</span>
            <Link href="/onboarding" className="primary-button px-4 py-2 text-sm shrink-0">Sign in</Link>
          </div>
        )}

        {msg && (
          <div className={`rounded-2xl border px-4 py-3 text-sm ${msgTone === "error" ? "border-rose-200 bg-rose-50 text-rose-700" : msgTone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-blue-200 bg-blue-50 text-blue-700"}`}>
            {msg}
          </div>
        )}

        {posts.length === 0 ? (
          <div className="shell-card p-12 text-center">
            <div className="mx-auto w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 border border-slate-100 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A.5.5 0 0 0 12.5 21c1.27-.013 2.488-.417 3.553-1.154a.707.707 0 0 1 .752-.086c.633.33 1.343.522 2.098.522Z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-900">The {meta.name} feed is quiet</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 soft-muted">
              Connect with fellow {meta.slug} specialists. Share a challenge, a recent breakthrough, or ask for peer review on an architecture decision.
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <article key={post.id} className="shell-card p-5 md:p-6 hover:border-slate-300 transition-colors">
              <div className="flex flex-wrap items-center gap-2">
                {post.author && (
                  <Link href={`/u/${post.author.handle}`} className="text-xs font-bold text-slate-800 hover:text-blue-700">
                    {post.author.display_name}
                  </Link>
                )}
                <span className="text-xs soft-muted">· {new Date(post.created_at).toLocaleDateString()}</span>
              </div>
              <Link
                href={`/post/${post.id}`}
                className="mt-3 block text-xl font-bold tracking-tight text-slate-900 hover:text-blue-700 transition-colors"
              >
                {post.title}
              </Link>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-600 line-clamp-3">{post.body}</p>
              <div className="mt-6 flex gap-4 text-xs font-bold text-slate-400">
                <span className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V3a.75.75 0 0 1 .75-.75A2.25 2.25 0 0 1 16.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
                  </svg>
                  {post.likeCount}
                </span>
                <span className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A.5.5 0 0 0 12.5 21c1.27-.013 2.488-.417 3.553-1.154a.707.707 0 0 1 .752-.086c.633.33 1.343.522 2.098.522Z" />
                  </svg>
                  {post.commentCount}
                </span>
              </div>
            </article>
          ))
        )}
      </section>

      {/* Sidebar */}
      <aside className="space-y-5">
        {/* Members in this space */}
        <div className="shell-card p-5">
          <h3 className="eyebrow mb-4">Members in this space</h3>
          {members.length === 0 ? (
            <p className="text-sm soft-muted">No members found for this domain yet.</p>
          ) : (
            <ul className="space-y-3">
              {members.map(m => (
                <li key={m.id} className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <Link href={`/u/${m.handle}`} className="text-sm font-semibold text-slate-800 hover:text-blue-700 block truncate">
                      {m.display_name}
                    </Link>
                    {m.headline && (
                      <p className="text-xs text-slate-500 truncate mt-0.5">{m.headline}</p>
                    )}
                  </div>
                  {m.open_to && m.open_to.length > 0 && (
                    <span className="pill bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 text-[10px] py-0.5">Open</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Related artifacts */}
        {relatedArtifacts.length > 0 && (
          <div className="shell-card p-5">
            <h3 className="eyebrow mb-4">Resources</h3>
            <ul className="space-y-4">
              {relatedArtifacts.map(a => (
                <li key={a.id}>
                  <p className="text-sm font-medium text-slate-800 leading-snug">{a.title}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className={`pill border text-[10px] py-0.5 ${TYPE_COLORS[a.type]}`}>{TYPE_LABELS[a.type]}</span>
                    <a href={a.downloadUrl} className="text-xs text-blue-600 hover:underline font-medium">View →</a>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Related submissions */}
        {relatedSubmissions.length > 0 && (
          <div className="shell-card p-5">
            <h3 className="eyebrow mb-4">Papers</h3>
            <ul className="space-y-3">
              {relatedSubmissions.map(s => (
                <li key={s.id}>
                  <Link href="/submissions" className="text-sm font-medium text-slate-800 hover:text-blue-700 leading-snug block">
                    {s.title}
                  </Link>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className={`pill border text-[10px] py-0.5 ${SUBMISSION_STATUS_COLORS[s.status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
                      {SUBMISSION_STATUS_LABELS[s.status] ?? s.status}
                    </span>
                    <span className="text-xs text-slate-500 truncate">{s.authors}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* External links from group meta */}
        <div className="shell-card p-5">
          <h3 className="eyebrow mb-4">External Links</h3>
          <ul className="space-y-2.5">
            {meta.resources.map((res, i) => (
              <li key={i}>
                <a
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-slate-700 hover:text-blue-700 flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 group-hover:bg-blue-600 transition-colors flex-shrink-0" />
                  {res.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
