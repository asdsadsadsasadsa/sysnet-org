"use client";
export const dynamic = 'force-dynamic';

 

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Req = { id: string; from_user: string; to_user: string; status: string };

export default function ConnectionRequestsPage() {
  const supabase = createClient();
  const [incoming, setIncoming] = useState<Req[]>([]);
  const [msg, setMsg] = useState("");

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("connection_requests")
      .select("id,from_user,to_user,status")
      .eq("to_user", user.id)
      .eq("status", "pending");
    setIncoming((data || []) as Req[]);
  }

  useEffect(() => { load(); }, []);

  async function act(id: string, status: "accepted" | "declined") {
    const { error } = await supabase.from("connection_requests").update({ status }).eq("id", id);
    if (error) setMsg(error.message);
    else setMsg(`Request ${status}`);
    await load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Connection Requests</h1>
      {incoming.map((r) => (
        <div key={r.id} className="rounded border bg-white p-3 flex items-center justify-between">
          <span className="text-sm">From: {r.from_user}</span>
          <div className="flex gap-2">
            <button onClick={() => act(r.id, "accepted")} className="rounded bg-slate-900 px-3 py-1.5 text-white">Accept</button>
            <button onClick={() => act(r.id, "declined")} className="rounded border px-3 py-1.5">Decline</button>
          </div>
        </div>
      ))}
      {msg && <p className="text-sm text-slate-600">{msg}</p>}
    </div>
  );
}