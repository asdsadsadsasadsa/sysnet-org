export default async function GroupFeedPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <div className="rounded-xl border bg-white p-6">
      <h1 className="text-2xl font-semibold">Group: {slug}</h1>
      <p className="mt-2 text-slate-600">Tag-scoped feed for {slug}.</p>
    </div>
  );
}
