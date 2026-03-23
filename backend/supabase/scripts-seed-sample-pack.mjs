import fs from 'node:fs/promises';
import path from 'node:path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PACK_PATH = process.env.SEED_PACK_PATH || path.resolve('backend/supabase/seed-content-pack-2026-03-19.json');
const EMAIL_DOMAIN = process.env.SEED_EMAIL_DOMAIN || 'seed.sysnet.org';
const DEFAULT_PASSWORD = process.env.SEED_DEFAULT_PASSWORD || 'SeedUser#2026!';

if (!SUPABASE_URL || !SERVICE) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

async function readPack() {
  return JSON.parse(await fs.readFile(PACK_PATH, 'utf8'));
}

async function adminCreateOrFetchUser(profile) {
  const email = `${profile.handle}@${EMAIL_DOMAIN}`;

  // First, check if profile exists to get the ID without fetching all auth users
  const existingProfile = await fetch(`${SUPABASE_URL}/rest/v1/profiles?handle=eq.${profile.handle}`, {
    headers: {
      apikey: SERVICE,
      Authorization: `Bearer ${SERVICE}`,
    },
  }).then(res => res.json());

  if (existingProfile && existingProfile.length > 0) {
    return { id: existingProfile[0].id, email, created: false };
  }

  const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      apikey: SERVICE,
      Authorization: `Bearer ${SERVICE}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password: DEFAULT_PASSWORD,
      email_confirm: true,
      user_metadata: {
        seeded: true,
        handle: profile.handle,
        display_name: profile.display_name,
      },
    }),
  });

  if (createRes.ok) {
    const body = await createRes.json();
    return { id: body.id, email, created: true };
  }

  const conflictText = await createRes.text();
  if (![400, 409, 422].includes(createRes.status)) {
    throw new Error(`admin create failed for ${email}: ${createRes.status} ${conflictText}`);
  }

  const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    headers: {
      apikey: SERVICE,
      Authorization: `Bearer ${SERVICE}`,
    },
  });
  if (!listRes.ok) {
    throw new Error(`admin list failed while resolving ${email}: ${listRes.status} ${await listRes.text()}`);
  }

  const listBody = await listRes.json();
  const user = (listBody.users || []).find((u) => (u.email || '').toLowerCase() === email.toLowerCase());
  if (!user) {
    throw new Error(`could not resolve existing auth user for ${email}; create response was: ${conflictText}`);
  }

  return { id: user.id, email, created: false };
}

async function restUpsert(table, rows, onConflict) {
  const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
  if (onConflict) url.searchParams.set('on_conflict', onConflict);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: SERVICE,
      Authorization: `Bearer ${SERVICE}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(rows),
  });

  if (!res.ok) {
    throw new Error(`${table} upsert failed: ${res.status} ${await res.text()}`);
  }

  return res.json();
}

async function restInsert(table, rows) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: SERVICE,
      Authorization: `Bearer ${SERVICE}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(rows),
  });

  if (!res.ok) {
    throw new Error(`${table} insert failed: ${res.status} ${await res.text()}`);
  }

  return res.json();
}

async function restSelect(table, query = '') {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, {
    headers: {
      apikey: SERVICE,
      Authorization: `Bearer ${SERVICE}`,
    },
  });

  if (!res.ok) {
    throw new Error(`${table} select failed: ${res.status} ${await res.text()}`);
  }

  return res.json();
}

const pack = await readPack();
const handleToUser = new Map();

for (const profile of pack.profiles) {
  const authUser = await adminCreateOrFetchUser(profile);
  handleToUser.set(profile.handle, authUser);
}

const profileRows = pack.profiles.map((profile) => ({
  id: handleToUser.get(profile.handle).id,
  handle: profile.handle,
  display_name: profile.display_name,
  visibility: profile.visibility || 'public',
  headline: profile.headline,
  bio: profile.bio,
  location: profile.location,
  timezone: profile.timezone,
  domains: profile.domains,
  tags: profile.tags,
  open_to: profile.open_to,
  updated_at: new Date().toISOString(),
}));

await restUpsert('profiles', profileRows, 'id');

const existingProfiles = await restSelect('profiles', '?select=id,handle');
const handleToProfileId = new Map(existingProfiles.map((row) => [row.handle, row.id]));

const postRows = pack.posts.map((post) => ({
  author_id: handleToProfileId.get(post.author_handle),
  group_slug: post.group_slug,
  title: post.title,
  body: post.body,
}));

for (const row of postRows) {
  const existing = await restSelect(
    'posts',
    `?select=id&author_id=eq.${row.author_id}&title=eq.${encodeURIComponent(row.title)}&limit=1`
  );
  if (existing.length === 0) {
    await restInsert('posts', [row]);
  }
}

const currentPosts = await restSelect('posts', '?select=id,title,author_id');
const postKeyToId = new Map();
for (const post of pack.posts) {
  const authorId = handleToProfileId.get(post.author_handle);
  const match = currentPosts.find((row) => row.author_id === authorId && row.title === post.title);
  if (match) postKeyToId.set(`${post.author_handle}::${post.title}`, match.id);
}

for (const comment of pack.comments) {
  const postId = postKeyToId.get(`${comment.post_author_handle}::${comment.post_title}`);
  const authorId = handleToProfileId.get(comment.author_handle);
  const existing = await restSelect(
    'comments',
    `?select=id&post_id=eq.${postId}&author_id=eq.${authorId}&body=eq.${encodeURIComponent(comment.body)}&limit=1`
  );
  if (existing.length === 0) {
    await restInsert('comments', [{ post_id: postId, author_id: authorId, body: comment.body }]);
  }
}

console.log(JSON.stringify({
  ok: true,
  profiles: pack.profiles.length,
  posts: pack.posts.length,
  comments: pack.comments.length,
  emailDomain: EMAIL_DOMAIN,
  defaultPassword: DEFAULT_PASSWORD,
}, null, 2));
