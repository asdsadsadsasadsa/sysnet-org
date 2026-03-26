/**
 * Full end-to-end flow test against production (or BASE_URL).
 * Single test with 5 steps so the browser session persists across all steps:
 *   signup → profile fill → feed post → working group post → paper submission
 *
 * Run with:
 *   BASE_URL=https://sysnet-org.vercel.app npx playwright test tests/e2e-full-flow.spec.ts --reporter=list
 */
import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const TS = Date.now();
const EMAIL = `e2e-test-${TS}@example.com`;
const PASSWORD = 'E2eTest#9876';
const HANDLE = `e2etest${TS.toString().slice(-8)}`;

test('full E2E flow: signup → profile → feed → group → paper', async ({ page }) => {

  // ── Step 1: Sign up ──────────────────────────────────────────────────────
  await test.step('step 1 – sign up with a new account', async () => {
    await page.goto(`${BASE}/onboarding`);

    // Switch to create-account mode (toggle button, type="button")
    await page.locator('button[type="button"]', { hasText: 'Create account' }).click();

    await page.getByPlaceholder('you@company.com').fill(EMAIL);
    // Use first() because in signup mode both password fields match 'Password'
    await page.getByPlaceholder('Password').first().fill(PASSWORD);
    await page.getByPlaceholder('Confirm password').fill(PASSWORD);

    // Submit the form (type="submit" button)
    await page.locator('button[type="submit"]', { hasText: 'Create account' }).click();

    // Should show account created message
    await expect(page.getByText(/Account created\. Complete your profile\./i)).toBeVisible({ timeout: 20_000 });

    // Profile form should now be visible
    await expect(page.getByPlaceholder('Handle (e.g. jsmith)')).toBeVisible({ timeout: 15_000 });
  });

  // ── Step 2: Fill profile ─────────────────────────────────────────────────
  await test.step('step 2 – fill profile on /onboarding', async () => {
    // Still on /onboarding with profile form visible after signup
    await expect(page.getByPlaceholder('Handle (e.g. jsmith)')).toBeVisible({ timeout: 10_000 });

    await page.getByPlaceholder('Handle (e.g. jsmith)').fill(HANDLE);
    await page.getByPlaceholder('Full name').fill('E2E Test User');
    await page.getByPlaceholder(/Headline \(e\.g\./i).fill('Automated E2E tester for sysnet-org');
    await page.getByPlaceholder(/Location \(e\.g\./i).fill('Test City, TC');
    await page.getByPlaceholder(/Domains, comma-separated/i).fill('Systems Engineering, MBSE');
    await page.getByPlaceholder(/Tags, comma-separated/i).fill('SysML, verification');
    await page.getByPlaceholder(/Open to/i).fill('mentoring');

    await page.getByRole('button', { name: 'Save profile' }).click();

    // New user: should show "Profile saved. Redirecting to feed..." and then navigate to /feed
    await expect(page.getByText(/Profile saved\./i)).toBeVisible({ timeout: 20_000 });
    await page.waitForURL((url) => url.pathname === '/feed', { timeout: 20_000 });
  });

  // ── Step 3: Post to feed ─────────────────────────────────────────────────
  await test.step('step 3 – create a post on the global feed', async () => {
    // Already on /feed from previous step redirect
    await expect(page).toHaveURL(/\/feed/);

    const postTitle = `E2E test insight ${TS}`;
    const postBody = 'Automated end-to-end test post. Verifying feed post creation works correctly for the sysnet-org E2E suite.';

    await page.getByPlaceholder('Post title').fill(postTitle);
    await page.getByPlaceholder(/Share a practical systems engineering insight/i).fill(postBody);
    await page.getByRole('button', { name: 'Publish' }).click();

    await expect(page.getByText(/Insight published to the global feed/i)).toBeVisible({ timeout: 20_000 });

    // Post should appear in the feed list
    await expect(page.getByText(postTitle)).toBeVisible({ timeout: 10_000 });
  });

  // ── Step 4: Post to working group ───────────────────────────────────────
  await test.step('step 4 – post a discussion to the mbse working group', async () => {
    await page.goto(`${BASE}/g/mbse`);
    await expect(page.getByRole('heading', { name: 'Model-Based Systems Engineering', exact: true })).toBeVisible({ timeout: 10_000 });

    // Compose form should be visible for authenticated user
    await expect(page.getByPlaceholder('Discussion title')).toBeVisible({ timeout: 10_000 });

    const discussionTitle = `E2E group discussion ${TS}`;
    const discussionBody = 'Automated test: discussing model-based systems engineering practices and tooling for verification workflows.';

    await page.getByPlaceholder('Discussion title').fill(discussionTitle);
    await page.getByPlaceholder(/Share a systems engineering insight relevant to this group/i).fill(discussionBody);
    await page.getByRole('button', { name: 'Publish' }).click();

    await expect(page.getByText(/Discussion posted\./i)).toBeVisible({ timeout: 20_000 });

    // Discussion should appear in the group feed
    await expect(page.getByText(discussionTitle)).toBeVisible({ timeout: 10_000 });
  });

  // ── Step 5: Submit a paper ───────────────────────────────────────────────
  await test.step('step 5 – submit a paper on /submissions', async () => {
    await page.goto(`${BASE}/submissions`);
    await expect(page.getByText('Paper submissions')).toBeVisible({ timeout: 10_000 });

    // Submission form should be visible for authenticated user
    await expect(page.getByPlaceholder('Full paper title')).toBeVisible({ timeout: 10_000 });

    const paperTitle = `E2E Test Paper on MBSE Verification ${TS}`;

    await page.getByPlaceholder('Full paper title').fill(paperTitle);
    await page.getByPlaceholder(/Comma-separated names.*Alice Smith/i).fill('E2E Test User, A. N. Other');
    await page.getByPlaceholder(/2.4 sentence summary/i).fill(
      'This paper presents an automated end-to-end test of the paper submission workflow. It validates that authenticated users can submit papers and that submissions are persisted correctly.'
    );
    // Domain defaults to "Systems Engineering" which is fine
    await page.getByPlaceholder(/mbse, sysml, verification/i).fill('mbse, verification, testing');

    await page.getByRole('button', { name: 'Submit paper' }).click();

    await expect(page.getByText(/Submission received\. Thank you!/i)).toBeVisible({ timeout: 20_000 });

    // Submitted paper should appear in the list
    await expect(page.getByText(paperTitle)).toBeVisible({ timeout: 10_000 });
  });
});
