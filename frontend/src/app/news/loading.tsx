export default function NewsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:px-10 animate-pulse">
      {/* Topic filters skeleton */}
      <div className="mt-8 flex flex-wrap gap-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-9 w-20 rounded bg-slate-200" />
        ))}
      </div>

      {/* Articles grid skeleton */}
      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.9fr)]">
        {/* Featured article */}
        <div className="bg-white p-8 md:p-10 space-y-4">
          <div className="h-4 w-20 rounded bg-slate-200" />
          <div className="h-8 w-full rounded bg-slate-200" />
          <div className="h-8 w-4/5 rounded bg-slate-200" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-slate-200" />
            <div className="h-4 w-5/6 rounded bg-slate-200" />
            <div className="h-4 w-3/4 rounded bg-slate-200" />
          </div>
        </div>
        {/* Sidebar articles */}
        <div className="space-y-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 space-y-3">
              <div className="h-3 w-16 rounded bg-slate-200" />
              <div className="h-6 w-full rounded bg-slate-200" />
              <div className="h-4 w-5/6 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
