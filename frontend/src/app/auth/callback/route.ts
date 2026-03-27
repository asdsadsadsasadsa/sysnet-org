import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const next = searchParams.get("next") ?? "/news";

  if (error || errorDescription) {
    const reason = errorDescription || error || "unknown";
    return NextResponse.redirect(
      `${origin}/onboarding?auth=failed&reason=${encodeURIComponent(reason)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/onboarding?auth=failed`);
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(
      `${origin}/onboarding?auth=failed&reason=${encodeURIComponent(exchangeError.message)}`
    );
  }

  // Check if user has a profile; if not, send them to onboarding to complete it
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/onboarding?auth=failed`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    // Auto-create a minimal profile so they can proceed
    const displayName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "New member";

    const rawHandle =
      user.user_metadata?.preferred_username ||
      user.user_metadata?.user_name ||
      user.email?.split("@")[0] ||
      "member";

    const handle = rawHandle
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 30);

    await supabase.from("profiles").upsert({
      id: user.id,
      handle: `${handle}-${user.id.slice(0, 4)}`,
      display_name: displayName,
      visibility: "public",
      updated_at: new Date().toISOString(),
    });

    return NextResponse.redirect(`${origin}/onboarding?auth=ok`);
  }

  const redirectUrl = next.startsWith("/") ? `${origin}${next}` : next;
  return NextResponse.redirect(redirectUrl);
}
