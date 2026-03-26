import { test, expect } from '@playwright/test';

const TS = Date.now();
const EMAIL = `onboarding-profile-${TS}@example.com`;
const PASSWORD = 'TestAuth#12345';
const HANDLE = `e2eauthuser${TS.toString().slice(-6)}`;

test('new user can complete profile and reach feed', async ({ page, baseURL }) => {
  test.skip(!baseURL, 'Missing baseURL');

  await page.goto('/onboarding');
  await page.getByRole('button', { name: 'Create account' }).click();
  await page.getByPlaceholder('you@company.com').fill(EMAIL);
  await page.getByPlaceholder('Password').first().fill(PASSWORD);
  await page.getByPlaceholder('Confirm password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Create account' }).last().click();

  await expect(page.getByRole('heading', { name: /Complete your profile/i })).toBeVisible({ timeout: 20_000 });

  await page.getByPlaceholder('Handle (e.g. jsmith)').fill(HANDLE);
  await page.getByPlaceholder('Full name').fill('E2E Auth User');
  await page.getByPlaceholder(/Headline \(e\.g\./i).fill('Systems engineer validating onboarding flow');
  await page.getByPlaceholder(/Location \(e\.g\./i).fill('San Francisco CA');
  await page.getByPlaceholder(/Domains, comma-separated/i).fill('Systems engineering, MBSE, verification');
  await page.getByPlaceholder(/Tags, comma-separated/i).fill('SysML, Cameo, requirements');
  await page.getByPlaceholder(/Open to \(e\.g\./i).fill('mentoring, consulting');
  await page.getByRole('button', { name: 'Save profile' }).click();

  await Promise.race([
    page.waitForURL(/\/feed/, { timeout: 20_000 }),
    expect(page.getByText(/Profile saved\./i)).toBeVisible({ timeout: 20_000 }).then(() =>
      page.waitForURL(/\/feed/, { timeout: 20_000 })
    ),
  ]);
  await expect(page).toHaveURL(/\/feed/);
});
