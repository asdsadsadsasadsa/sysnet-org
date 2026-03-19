import { test, expect } from '@playwright/test';

const TEST_EMAIL = process.env.E2E_TEST_EMAIL || 'e2e.auth.user@nmbli.com';
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD || 'TestAuth#12345';
const HANDLE = `e2eauthuser${Date.now().toString().slice(-6)}`;

test('signed-in user can complete profile and reach feed', async ({ page, baseURL }) => {
  test.skip(!baseURL, 'Missing baseURL');

  await page.goto('/onboarding');
  await page.getByPlaceholder('you@company.com').fill(TEST_EMAIL);
  await page.getByPlaceholder('Password').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page.getByRole('heading', { name: /Complete your profile|You’re signed in/i })).toBeVisible();

  const alreadySignedIn = await page.getByRole('heading', { name: /You’re signed in/i }).isVisible().catch(() => false);
  if (alreadySignedIn) {
    await page.getByRole('link', { name: /Go to feed/i }).click();
    await expect(page).toHaveURL(/\/feed/);
    return;
  }

  await page.getByPlaceholder('handle').fill(HANDLE);
  await page.getByPlaceholder('display name').fill('E2E Auth User');
  await page.getByPlaceholder('headline').fill('Systems engineer validating onboarding flow');
  await page.getByPlaceholder('location').fill('San Francisco CA');
  await page.getByPlaceholder('domains csv').fill('Systems engineering, MBSE, verification');
  await page.getByPlaceholder('tags csv').fill('SysML, Cameo, requirements');
  await page.getByPlaceholder('open_to csv').fill('mentoring, consulting');
  await page.getByRole('button', { name: 'Save profile' }).click();

  await expect(page.getByText(/Profile saved\./i)).toBeVisible();
  await expect(page).toHaveURL(/\/feed/);
});
