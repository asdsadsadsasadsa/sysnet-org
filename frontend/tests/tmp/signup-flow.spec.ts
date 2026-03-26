import { test, expect } from '@playwright/test';

test('fresh signup now reaches signed-in state', async ({ page }) => {
  const email = `e2e_${Date.now()}@sysnet.org`;
  const password = 'TestAuth#12345';
  await page.goto('https://sysnet-org.vercel.app/onboarding');
  await page.getByRole('button', { name: 'Create account' }).first().click();
  await page.getByPlaceholder('you@company.com', { exact: true }).fill(email);
  await page.getByPlaceholder('Password', { exact: true }).fill(password);
  await page.getByPlaceholder('Confirm password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Create account' }).nth(1).click();
  // Match the success toast specifically (not the heading that also contains "Complete your profile")
  await expect(page.getByText(/Account created\. Complete your profile\./i)).toBeVisible({ timeout: 15000 });
  console.log('EMAIL', email);
  console.log('URL', page.url());
});
