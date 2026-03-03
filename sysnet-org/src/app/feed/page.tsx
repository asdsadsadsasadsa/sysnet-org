const posts = [
  { id: '1', title: 'How are you structuring STPA evidence for auditability?', body: 'Looking for practical templates...' },
  { id: '2', title: 'MBSE handoff from concept to verification', body: 'What artifacts reduce friction?' },
];

export default function FeedPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Global Feed</h1>
      {posts.map((p) => (
        <article key={p.id} className="rounded-xl border bg-white p-4">
          <h2 className="font-semibold">{p.title}</h2>
          <p className="mt-2 text-slate-600">{p.body}</p>
          <div className="mt-3 text-sm text-slate-500">Like · Comment · Report</div>
        </article>
      ))}
    </div>
  );
}
