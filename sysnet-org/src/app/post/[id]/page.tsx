export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="rounded-xl border bg-white p-6">
      <h1 className="text-2xl font-semibold">Post {id}</h1>
      <p className="mt-2 text-slate-600">Full thread view with comments and likes.</p>
    </div>
  );
}
