const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const EMAIL = process.env.DEBUG_EMAIL || 'maya-mbse@seed.sysnet.org';
const PASSWORD = process.env.DEBUG_PASSWORD || 'SeedUser#2026!';

if (!SUPABASE_URL || !ANON) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

async function jsonOrText(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

const login = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
  method: 'POST',
  headers: {
    apikey: ANON,
    Authorization: `Bearer ${ANON}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
});
const auth = await jsonOrText(login);

if (!login.ok) {
  console.log(JSON.stringify({ ok: false, stage: 'login', status: login.status, auth }, null, 2));
  process.exit(2);
}

const accessToken = auth.access_token;
const userId = auth.user?.id;

const rpc = await fetch(`${SUPABASE_URL}/rest/v1/rpc/can_post_now`, {
  method: 'POST',
  headers: {
    apikey: ANON,
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ user_id: userId }),
});
const rpcBody = await jsonOrText(rpc);

const post = await fetch(`${SUPABASE_URL}/rest/v1/posts`, {
  method: 'POST',
  headers: {
    apikey: ANON,
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  },
  body: JSON.stringify([
    {
      author_id: userId,
      title: 'Publish debug probe',
      body: 'Deterministic REST insert probe for the live publish path.',
    },
  ]),
});
const postBody = await jsonOrText(post);

console.log(
  JSON.stringify(
    {
      ok: login.ok,
      email: EMAIL,
      userId,
      loginStatus: login.status,
      rpcStatus: rpc.status,
      rpcBody,
      postStatus: post.status,
      postBody,
    },
    null,
    2
  )
);
