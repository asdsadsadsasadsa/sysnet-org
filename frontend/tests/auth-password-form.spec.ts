import { test, expect } from '@playwright/test';

const TEST_EMAIL = process.env.E2E_TEST_EMAIL || 'alice.test@sysnet.org';
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD || 'TestAuth#12345';

test('email + password login works in the onboarding UI', async ({ page, baseURL }) => {
  test.skip(!baseURL, 'Missing baseURL');

  await page.goto('/onboarding');
  await page.getByPlaceholder('you@company.com').fill(TEST_EMAIL);
  await page.getByPlaceholder('Password').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page.getByText(/Signed in\.|Complete your profile|You’re signed in/i)).toBeVisible();
  await expect(page).not.toHaveURL(/auth=failed/);
});
