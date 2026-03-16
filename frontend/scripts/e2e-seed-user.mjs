const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TEST_EMAIL = process.env.E2E_TEST_EMAIL || 'e2e.auth.user@nmbli.com';
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD || 'TestAuth#12345';

if (!SUPABASE_URL || !SERVICE) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const r = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
  method: 'POST',
  headers: {
    apikey: SERVICE,
    Authorization: `Bearer ${SERVICE}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
  }),
});

const text = await r.text();
console.log('status', r.status);
console.log(text.slice(0, 300));
if (![200, 201, 422].includes(r.status)) process.exit(2);
