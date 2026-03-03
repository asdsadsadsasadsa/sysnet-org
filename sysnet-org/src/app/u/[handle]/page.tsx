export default async function ProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  return (
    <div className="rounded-xl border bg-white p-6">
      <h1 className="text-2xl font-semibold">@{handle}</h1>
      <p className="mt-2 text-slate-600">Profile details, expertise, and connection actions.</p>
    </div>
  );
}
