import { test, expect } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const TEST_EMAIL = process.env.E2E_TEST_EMAIL || 'e2e.auth.user@nmbli.com';
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD || 'TestAuth#12345';

async function passwordLogin(request: APIRequestContext) {
  const res = await request.post(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    headers: {
      apikey: ANON,
      Authorization: `Bearer ${ANON}`,
      'Content-Type': 'application/json',
    },
    data: { email: TEST_EMAIL, password: TEST_PASSWORD },
  });
  if (res.status() !== 200) throw new Error(`password login failed: ${res.status()} ${await res.text()}`);
  return res.json();
}

test('UI session from password token reaches app (no auth bounce)', async ({ page, request, baseURL }) => {
  test.skip(!SUPABASE_URL || !ANON, 'Missing Supabase env vars');
  const data = await passwordLogin(request);
  const origin = new URL(baseURL!).origin;

  // Set Supabase session cookies directly for project ref.
  const ref = new URL(SUPABASE_URL).hostname.split('.')[0];
  await page.context().addCookies([
    {
      name: `sb-${ref}-auth-token`,
      value: JSON.stringify({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: data.expires_at,
        expires_in: data.expires_in,
        token_type: data.token_type,
        user: data.user,
      }),
      url: origin,
      httpOnly: false,
      secure: true,
      sameSite: 'Lax',
    },
  ]);

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // App should route authenticated user away from the marketing homepage.
  await expect(page).not.toHaveURL(/\/\?code=/);
  await expect(page).not.toHaveURL(/auth=failed/);
  await expect(page).toHaveURL(/\/feed|\/news|\/onboarding/);
  await expect(page.locator('body')).toContainText(/Go to feed|Complete your profile|Join the network\.|feed|news/i);
});
