import { test, expect } from '@playwright/test';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const TEST_EMAIL = process.env.E2E_TEST_EMAIL || 'e2e.auth.user@nmbli.com';
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD || 'TestAuth#12345';

test('password auth API flow works (seed user + token)', async ({ request }) => {
  test.skip(!SUPABASE_URL || !ANON || !SERVICE, 'Missing Supabase env vars');

  const createRes = await request.post(`${SUPABASE_URL}/auth/v1/admin/users`, {
    headers: {
      apikey: SERVICE,
      Authorization: `Bearer ${SERVICE}`,
      'Content-Type': 'application/json',
    },
    data: {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
    },
  });

  // 200/201 for created, 422 if already exists; all acceptable for seed step
  expect([200, 201, 422]).toContain(createRes.status());

  const tokenRes = await request.post(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    headers: {
      apikey: ANON,
      Authorization: `Bearer ${ANON}`,
      'Content-Type': 'application/json',
    },
    data: {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    },
  });

  expect(tokenRes.status()).toBe(200);
  const body = await tokenRes.json();
  expect(body.access_token).toBeTruthy();
  expect(body.refresh_token).toBeTruthy();
  expect(body.user?.email).toBe(TEST_EMAIL);
});
