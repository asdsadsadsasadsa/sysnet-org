"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { normalizeHandle } from "@/lib/profile-utils";

function deriveDisplayName(user: {
  email?: string;
  user_metadata?: Record<string, unknown>;
}) {
  const meta = user.user_metadata || {};
  const fromMeta =
    (typeof meta.full_name === "string" && meta.full_name.trim()) ||
    (typeof meta.name === "string" && meta.name.trim()) ||
    (typeof meta.user_name === "string" && meta.user_name.trim()) ||
    (typeof meta.preferred_username === "string" && meta.preferred_username.trim());

  if (fromMeta) return fromMeta;
  const emailPrefix = user.email?.split("@")[0]?.trim();
  if (emailPrefix) return emailPrefix;
  return "New member";
}

function deriveHandleSeed(user: {
  email?: string;
  user_metadata?: Record<string, unknown>;
}) {
  const meta = user.user_metadata || {};
  const raw =
    (typeof meta.preferred_username === "string" && meta.preferred_username) ||
    (typeof meta.user_name === "string" && meta.user_name) ||
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    user.email?.split("@")[0] ||
    "member";

  const normalized = normalizeHandle(raw);
  return normalized || "member";
}

async function pickUniqueHandle(
  supabase: ReturnType<typeof createClient>,
  seed: string,
  userId: string,
) {
  const base = seed.slice(0, 24) || "member";
  const candidates = [
    base,
    `${base}-${userId.slice(0, 4)}`,
    `${base}-${userId.slice(0, 6)}`,
    `${base}-${Date.now().toString().slice(-4)}`,
  ];

  for (const candidate of candidates) {
    const { data } = await supabase.from("profiles").select("id").eq("handle", candidate).maybeSingle();
    if (!data) return candidate;
  }

  return `${base}-${userId.slice(0, 8)}`;
}

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const [message, setMessage] = useState("Completing sign-in...");

  useEffect(() => {
    let active = true;

    async function complete() {
      const code = searchParams.get("code");
      const next = searchParams.get("next") || "/feed";
      const explicitError = searchParams.get("error_description") || searchParams.get("error");

      if (explicitError) {
        router.replace(`/onboarding?auth=failed&reason=${encodeURIComponent(explicitError)}`);
        return;
      }
      if (!code) {
        router.replace("/onboarding?auth=failed");
        return;
      }

      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) {
        router.replace(`/onboarding?auth=failed&reason=${encodeURIComponent(exchangeError.message)}`);
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/onboarding?auth=failed");
        return;
      }

      const { data: profile, error: profileLookupError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (profileLookupError) {
        router.replace(`/onboarding?auth=failed&reason=${encodeURIComponent(profileLookupError.message)}`);
        return;
      }

      if (!profile) {
        const displayName = deriveDisplayName(user);
        const handle = await pickUniqueHandle(supabase, deriveHandleSeed(user), user.id);
        const { error: upsertError } = await supabase.from("profiles").upsert({
          id: user.id,
          handle,
          display_name: displayName,
          visibility: "public",
          updated_at: new Date().toISOString(),
        });

        if (upsertError) {
          router.replace(`/onboarding?auth=failed&reason=${encodeURIComponent(upsertError.message)}`);
          return;
        }
      }

      if (active) setMessage("Signed in. Redirecting...");
      router.replace(next);
      router.refresh();
    }

    void complete();
    return () => {
      active = false;
    };
  }, [router, searchParams, supabase]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-xl items-center justify-center px-6 py-20 text-center">
      <div className="shell-card-strong w-full p-8">
        <p className="eyebrow">Authentication</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">Finishing Google sign-in</h1>
        <p className="mt-3 text-sm leading-6 soft-muted">{message}</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-[50vh] max-w-xl items-center justify-center px-6 py-20 text-center">
          <div className="shell-card-strong w-full p-8">
            <p className="eyebrow">Authentication</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">Finishing Google sign-in</h1>
            <p className="mt-3 text-sm leading-6 soft-muted">Completing sign-in...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}
