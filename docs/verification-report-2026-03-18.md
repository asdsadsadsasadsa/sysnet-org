# Sysnet.org Verification & Fix Report — 2026-03-18

## Goal
Make the site actually useful for a real new user:
- create account
- log in
- complete profile
- browse people
- post to feed

## Status Legend
- [ ] Not verified yet
- [~] Verified broken / flaky
- [x] Verified working
- [>] In progress

## Current Verification Matrix

### Deployment / Infra
- [x] Vercel production deploy works
- [x] Live site loads at `https://sysnet-org.vercel.app`
- [x] Required Vercel env vars set
- [x] Frontend runtime pinned for Vercel builds (latest Node major, now `24.x`)

### Auth
- [x] Password login works in production via Playwright
- [x] Create-account flow works in production after server-side confirmed-account signup fix
- [x] Logout flow verified
- [ ] Session persistence verified across navigation/reload
- [x] Auth redirect behavior verified into onboarding profile form

### Onboarding / Profile
- [~] New signed-in user reaches profile form in production, but profile save is still not verified cleanly
- [ ] Existing user can edit a profile
- [ ] Saved profile persists and is visible in product surfaces

### Feed
- [x] Feed page loads
- [x] Unauthenticated publish is blocked with visible message
- [~] Authenticated publish still directly fails in production with `permission denied for table users`; deterministic REST probes to both `rpc/can_post_now` and `posts` reproduce it
- [x] Feed displays seeded / real posts

### Directory
- [x] People page loads
- [x] Search/filter controls render
- [~] Directory is now populated with seeded profiles, but still includes a couple junk legacy profiles that should be cleaned up
- [ ] Search/filter behavior verified against populated data

### Sample Data / Product Usefulness
- [x] Meaningful sample profiles seeded
- [x] Meaningful sample posts/comments/activity seeded
- [~] Site feels more populated, but still needs a larger volume pass for tomorrow's review

### Test Harness
- [x] Playwright production login test passes
- [x] Added Playwright coverage for signed-in onboarding/profile save path
- [~] Vitest currently failing with `ERR_REQUIRE_ESM`

## Concrete Findings So Far
1. Deploy path is now real and working.
2. Earlier Vercel failures were due to missing env vars and Node runtime mismatch.
3. Live prod password login works in automated Playwright testing.
3a. A deterministic Playwright run against production with a seeded user also passed, which suggests the recent browser-tool login failures were misleading/flaky rather than a clean credentials failure.
4. Live browser verification now confirms the login flow reaches the onboarding profile form with visible signed-in feedback.
5. Logout works and returns the user to the onboarding login form with a visible `Signed out.` message.
6. The feed remains directly viewable after logout, but unauthenticated publish is still blocked with a visible `Sign in first on /onboarding` message.
7. Profile save is still suspect: a live save attempt produced the message `Handle is invalid. Use letters, numbers, underscore, and dashes.` and needs tighter verification/debugging.
8. A concrete DB migration for the publish fix now exists at `backend/supabase/migrations/2026-03-19-fix-can-post-now.sql`.
9. Seeded profiles now render in the live public directory, so the site no longer feels empty by default.
10. The directory still contains a couple junk legacy profiles (`/u/gfggggg`, `/u/asdasdsadwd`) that should be cleaned up for credibility.
11. A deterministic direct REST probe with a real seeded user token shows that both `rpc/can_post_now` and `POST /rest/v1/posts` still fail in production with `permission denied for table users`, so the remaining blocker is definitely DB-side and not just a flaky UI symptom.

## Fix Order
1. Apply and verify the DB-side authenticated feed publish fix.
2. Verify session persistence across navigation/reload.
3. Verify and fix profile save / onboarding completion.
4. Clean up stray junk profiles in the public directory.
5. Expand seeded directory + feed + activity with more realistic sample data.

## Working Notes
- Keep commits small and push coherent milestones.
- Prefer fixing observable user-facing breakage before internal cleanup.
- Update this file as verification advances.
