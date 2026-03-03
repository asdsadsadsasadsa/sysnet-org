export const dynamic = 'force-dynamic';
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const admins = (process.env.ADMIN_EMAILS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  const email = user?.email?.toLowerCase() || "";
  const isAdmin = admins.includes(email);

  if (!isAdmin) {
    return <p className="text-sm text-slate-600">Admin access required.</p>;
  }

  const { data: reports } = await supabase.from("reports").select("id,entity_type,entity_id,reason,created_at").order("created_at", { ascending: false }).limit(100);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Admin moderation</h1>
      <div className="space-y-2">
        {(reports || []).map((r) => (
          <div key={r.id} className="rounded border bg-white p-3 text-sm">
            [{r.entity_type}] {r.reason} · {r.entity_id}
          </div>
        ))}
      </div>
    </div>
  );
}
