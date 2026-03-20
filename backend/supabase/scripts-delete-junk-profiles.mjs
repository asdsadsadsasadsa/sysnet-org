const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TARGET_HANDLES = (process.env.JUNK_HANDLES || 'gfggggg,asdasdsadwd')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

if (!SUPABASE_URL || !SERVICE) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

if (TARGET_HANDLES.length === 0) {
  console.error('No target handles provided');
  process.exit(1);
}

async function rest(path, init = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SERVICE,
      Authorization: `Bearer ${SERVICE}`,
      ...(init.headers || {}),
    },
  });

  if (!res.ok) {
    throw new Error(`${path} failed: ${res.status} ${await res.text()}`);
  }

  return res.status === 204 ? null : res.json();
}

const profiles = await rest(
  `profiles?select=id,handle&handle=in.(${TARGET_HANDLES.map((h) => `"${h}"`).join(',')})`
);

const profileIds = profiles.map((p) => p.id);

if (profileIds.length === 0) {
  console.log(JSON.stringify({ ok: true, deletedProfiles: [], note: 'No matching profiles found' }, null, 2));
  process.exit(0);
}

await rest(`comments?author_id=in.(${profileIds.join(',')})`, { method: 'DELETE' });
await rest(`likes?user_id=in.(${profileIds.join(',')})`, { method: 'DELETE' });
await rest(`connection_requests?from_user=in.(${profileIds.join(',')})`, { method: 'DELETE' });
await rest(`connection_requests?to_user=in.(${profileIds.join(',')})`, { method: 'DELETE' });
await rest(`connections?user_a=in.(${profileIds.join(',')})`, { method: 'DELETE' });
await rest(`connections?user_b=in.(${profileIds.join(',')})`, { method: 'DELETE' });
await rest(`reports?reporter_id=in.(${profileIds.join(',')})`, { method: 'DELETE' });
await rest(`comments?post_id=in.(select id from posts where author_id in (${profileIds.join(',')}))`, { method: 'DELETE' }).catch(() => {});
await rest(`likes?post_id=in.(select id from posts where author_id in (${profileIds.join(',')}))`, { method: 'DELETE' }).catch(() => {});
await rest(`posts?author_id=in.(${profileIds.join(',')})`, { method: 'DELETE' });
await rest(`profiles?id=in.(${profileIds.join(',')})`, { method: 'DELETE' });

console.log(JSON.stringify({
  ok: true,
  deletedProfiles: profiles,
}, null, 2));
