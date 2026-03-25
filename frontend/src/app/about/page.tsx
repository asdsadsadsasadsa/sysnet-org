export default function AboutPage() {
  return (
    <div className="shell-card-strong space-y-5 p-6 md:p-8">
      <p className="eyebrow">About the network</p>
      <h1 className="section-title">A professional home for systems engineers.</h1>
      <p className="max-w-3xl text-base leading-7 soft-muted">
        Sysnet is a professional community for systems engineers. The goal is practical knowledge sharing,
        standards-aware discussion, and trusted peer discovery — not another noisy social feed.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Practical", "Prioritize implementation lessons, not generic thought leadership."],
          ["Credible", "Let expertise, domain focus, and helpfulness do the talking."],
          ["Useful", "Make it easier to find peers, collaborators, mentors, and working groups."],
        ].map(([title, body]) => (
          <div key={title} className="rounded-[24px] border border-slate-200/70 bg-white/80 p-5">
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            <p className="mt-2 text-sm leading-6 soft-muted">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
