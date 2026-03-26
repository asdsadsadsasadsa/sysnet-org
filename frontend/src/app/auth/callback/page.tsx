import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { normalizeHandle } from '@/lib/profile-utils';

export const dynamic = 'force-dynamic';

function deriveDisplayName(user: {
  email?: string;
  user_metadata?: Record<string, unknown>;
}) {
  const meta = user.user_metadata || {};
  const fromMeta =
    (typeof meta.full_name === 'string' && meta.full_name.trim()) ||
    (typeof meta.name === 'string' && meta.name.trim()) ||
    (typeof meta.user_name === 'string' && meta.user_name.trim()) ||
    (typeof meta.preferred_username === 'string' && meta.preferred_username.trim());

  if (fromMeta) return fromMeta;

  const emailPrefix = user.email?.split('@')[0]?.trim();
  if (emailPrefix) return emailPrefix;

  return 'New member';
}

function deriveHandleSeed(user: {
  email?: string;
  user_metadata?: Record<string, unknown>;
}) {
  const meta = user.user_metadata || {};
  const raw =
    (typeof meta.preferred_username === 'string' && meta.preferred_username) ||
    (typeof meta.user_name === 'string' && meta.user_name) ||
    (typeof meta.full_name === 'string' && meta.full_name) ||
    (typeof meta.name === 'string' && meta.name) ||
    user.email?.split('@')[0] ||
    'member';

  const normalized = normalizeHandle(raw);
  return normalized || 'member';
}

async function pickUniqueHandle(
  supabase: Awaited<ReturnType<typeof createClient>>,
  seed: string,
  userId: string,
) {
  const base = seed.slice(0, 24) || 'member';

  const candidates = [
    base,
    `${base}-${userId.slice(0, 4)}`,
    `${base}-${userId.slice(0, 6)}`,
    `${base}-${Date.now().toString().slice(-4)}`,
  ];

  for (const candidate of candidates) {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('handle', candidate)
      .maybeSingle();

    if (!data) return candidate;
  }

  return `${base}-${userId.slice(0, 8)}`;
}

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; next?: string }>;
}) {
  const { code, next } = await searchParams;
  const supabase = await createClient();

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/onboarding?auth=failed');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile) {
    const displayName = deriveDisplayName(user);
    const handle = await pickUniqueHandle(supabase, deriveHandleSeed(user), user.id);

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      handle,
      display_name: displayName,
      visibility: 'public',
      updated_at: new Date().toISOString(),
    });

    if (error) {
      redirect('/onboarding?auth=failed');
    }
  }

  redirect(next || '/feed');
}
