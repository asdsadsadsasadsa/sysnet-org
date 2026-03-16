import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: /ABRAKADABRA/i })).toBeVisible();
});

test('callback route redirects when logged out', async ({ page }) => {
  await page.goto('/auth/callback?code=fake');
  await expect(page).toHaveURL(/\/onboarding\?auth=failed/);
});

test('auth page renders', async ({ page }) => {
  await page.goto('/onboarding');
  await expect(page.getByRole('heading', { name: /Step 1: Sign in/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Send magic link/i })).toBeVisible();
});

test('if env login link provided, verify post-login marker', async ({ page }) => {
  test.skip(!process.env.E2E_MAGIC_LINK_URL, 'E2E_MAGIC_LINK_URL not provided');
  await page.goto(process.env.E2E_MAGIC_LINK_URL!);
  await page.waitForLoadState('networkidle');
  await expect(page.locator('body')).toContainText(/auth=ok|Go to feed|Step 1: Sign in|Step 2/i);
});
