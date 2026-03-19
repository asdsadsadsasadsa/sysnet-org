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
- [x] Frontend runtime pinned for Vercel builds (`node 22.x`)

### Auth
- [x] Password login works in production via Playwright
- [x] Create-account flow works in production after server-side confirmed-account signup fix
- [ ] Logout flow verified
- [ ] Session persistence verified across navigation/reload
- [ ] Auth redirect behavior verified end-to-end

### Onboarding / Profile
- [ ] New signed-in user can save a profile
- [ ] Existing user can edit a profile
- [ ] Saved profile persists and is visible in product surfaces

### Feed
- [x] Feed page loads
- [x] Unauthenticated publish is blocked with visible message
- [ ] Authenticated publish works end-to-end
- [ ] Feed displays seeded / real posts

### Directory
- [x] People page loads
- [x] Search/filter controls render
- [~] Directory currently feels empty / thin
- [ ] Search/filter behavior verified against populated data

### Sample Data / Product Usefulness
- [ ] Meaningful sample profiles seeded
- [ ] Meaningful sample posts/comments/activity seeded
- [ ] Site feels populated enough for review tomorrow

### Test Harness
- [x] Playwright production login test passes
- [~] Vitest currently failing with `ERR_REQUIRE_ESM`

## Concrete Findings So Far
1. Deploy path is now real and working.
2. Earlier Vercel failures were due to missing env vars and Node runtime mismatch.
3. Live prod password login works in automated Playwright testing.
4. Manual browser testing suggests some auth/profile UX is too silent or inconsistent.
5. Product currently feels sparse because the core data surfaces are under-seeded.

## Fix Order
1. Verify and fix profile save / onboarding completion.
2. Verify and fix authenticated feed publish.
3. Establish robust seed path.
4. Seed directory + feed + activity with realistic sample data.
5. Polish UX/error states and remove temporary deploy-check copy.

## Working Notes
- Keep commits small and push coherent milestones.
- Prefer fixing observable user-facing breakage before internal cleanup.
- Update this file as verification advances.
