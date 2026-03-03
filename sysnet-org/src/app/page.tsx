import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="rounded-2xl border bg-white p-10">
        <p className="text-sm font-medium text-slate-500">Professional networking for systems engineers</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">Find peers. Share patterns. Build trusted networks.</h1>
        <p className="mt-4 max-w-2xl text-slate-600">
          ABRAKADABRA helps systems engineers connect by domain and tooling, discuss real implementation problems,
          and find mentorship, consulting, and hiring opportunities.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/onboarding" className="rounded-md bg-slate-900 px-4 py-2 text-white">
            Create profile
          </Link>
          <Link href="/people" className="rounded-md border px-4 py-2">
            Browse directory
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["Directory by expertise", "Filter by aerospace, automotive, medical, defense, MBSE, SysML, DOORS, Cameo and more."],
          ["Signal over noise", "Built for professional collaboration, not resume spam or vendor ad blasts."],
          ["Community-first", "Ask implementation questions, share templates, and build long-term trust."],
        ].map(([title, body]) => (
          <article key={title} className="rounded-xl border bg-white p-5">
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-slate-600">{body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
