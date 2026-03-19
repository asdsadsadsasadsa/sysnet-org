import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

function json(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, { status });
}

export async function POST(req: Request) {
  if (!serviceRoleKey || !supabaseUrl) {
    return json(500, { error: "Server auth configuration is incomplete." });
  }

  let payload: { email?: string; password?: string };
  try {
    payload = await req.json();
  } catch {
    return json(400, { error: "Invalid JSON payload." });
  }

  const email = payload.email?.trim().toLowerCase();
  const password = payload.password ?? "";

  if (!email) return json(400, { error: "Email is required." });
  if (password.length < 8) return json(400, { error: "Use a password with at least 8 characters." });

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    const msg = error.message || "Unable to create account.";
    const duplicate = /already been registered|already registered|already exists/i.test(msg);
    return json(duplicate ? 409 : 400, { error: msg });
  }

  return json(200, {
    ok: true,
    userId: data.user?.id ?? null,
    email: data.user?.email ?? email,
  });
}
