const sample = [
  { name: 'Alex R.', headline: 'Lead Systems Engineer', tags: ['MBSE', 'SysML', 'Aerospace'] },
  { name: 'Priya M.', headline: 'Safety & Reliability Engineer', tags: ['STPA', 'FMEA', 'Medical'] },
];

export default function PeoplePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Member Directory</h1>
      <p className="text-slate-600">Filter by domain, skills, location, and availability.</p>
      <div className="grid gap-3 md:grid-cols-2">
        {sample.map((p) => (
          <article key={p.name} className="rounded-xl border bg-white p-4">
            <h2 className="font-semibold">{p.name}</h2>
            <p className="text-sm text-slate-600">{p.headline}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {p.tags.map((t) => <span key={t} className="rounded bg-slate-100 px-2 py-1 text-xs">{t}</span>)}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
