# Sysnet.org Execution Checklist

## North-Star Outcome
Build a site that feels like **IEEE for systems engineers**: a real person can create a profile, log in, find useful peers/content, and participate in a credible professional ecosystem.

---

## Phase 0 — Stabilize the product that already exists

### 0.1 Auth and session reliability
- [x] Fix production deploy path
- [x] Fix production signup confirmation problem
- [x] Verify production password login works
- [ ] Verify logout works
- [ ] Verify session persists across page navigation
- [ ] Verify session persists across reload
- [ ] Verify auth error states are visible and useful
- [ ] Remove silent failure states from onboarding auth UI
- [ ] Add better loading / success / failure messaging for auth

### 0.2 Onboarding and profile creation
- [ ] Verify new user reaches profile form after signup/login
- [ ] Fix profile save errors
- [ ] Verify saved profile persists after reload
- [ ] Verify existing profile is loaded back into form
- [ ] Allow profile editing after initial save
- [ ] Improve profile fields beyond bare minimum
- [ ] Add bio field to onboarding/editor UI
- [ ] Add timezone / region usefulness where appropriate

### 0.3 Feed and core community activity
- [ ] Verify authenticated post creation works
- [ ] Fix current signed-in feed permission error(s)
- [ ] Verify post appears after publish
- [ ] Verify post persists after reload
- [ ] Verify likes work
- [ ] Verify duplicate-like handling is graceful
- [ ] Verify comments flow exists and works
- [ ] Verify report flow exists and works
- [ ] Improve feed empty state

### 0.4 Directory and discovery
- [ ] Verify people directory renders populated results
- [ ] Verify search works against realistic data
- [ ] Verify availability filters work
- [ ] Improve directory card usefulness
- [ ] Add richer profile previews in listing
- [ ] Add useful empty / no-results states

---

## Phase 1 — Make the site feel alive tomorrow

### 1.1 Seed meaningful sample data
- [ ] Establish robust seed path (script or admin flow)
- [ ] Seed 20-200 realistic user profiles
- [ ] Seed different domains/subfields of systems engineering
- [ ] Seed realistic headlines, bios, tags, and locations
- [ ] Seed different availability states (mentoring / consulting / hiring)
- [ ] Seed posts with practical, credible content
- [ ] Seed comments and lightweight engagement
- [ ] Seed connection requests / network activity where visible
- [ ] Make sure seeded content looks intentional, not random junk

### 1.2 Product polish for reviewability
- [x] Remove temporary deploy-check text from homepage
- [x] Improve homepage credibility / first impression
- [ ] Make public pages feel full rather than skeletal
- [ ] Verify all seeded surfaces are visible in production
- [ ] Re-test the full first-time-user journey after seeding

---

## Phase 2 — Competitor/adjacent-org feature inspiration

### 2.1 Research pass
- [x] Review IEEE.org
- [x] Review British Computer Society (BCS)
- [x] Review INCOSE
- [x] Review ACM
- [x] Review other relevant professional engineering orgs

### 2.2 Capture learnings in repo
- [x] Write feature-scout report
- [x] Identify must-have institutional features
- [x] Identify nice-to-have trust/credibility features
- [x] Identify UX patterns worth copying
- [x] Identify bloated/crusty patterns worth avoiding

### 2.3 Convert research into roadmap
- [ ] Map inspiration into Sysnet feature backlog
- [ ] Prioritize by usefulness and implementation cost
- [ ] Separate immediate wins from long-term institution-building

---

## Phase 3 — Add a real News system

### 3.1 News MVP
- [ ] Add dedicated news page
- [ ] Add navigation entry for news
- [ ] Define news data model
- [ ] Support headline, summary, body, source, topic, publish date
- [ ] Support featured / pinned items
- [ ] Seed meaningful news items

### 3.2 News UX
- [ ] Show recent news on homepage or feed entry points
- [ ] Allow browsing by topic/category
- [ ] Allow filtering/search
- [ ] Make news feel editorial, not like random posts

### 3.3 Editorial/admin basics
- [ ] Add author/editor metadata
- [ ] Add create/edit path for admins
- [ ] Add publish/unpublish status

---

## Phase 4 — Add academic paper submissions

### 4.1 Submission MVP
- [ ] Define submissions data model
- [ ] Add paper submissions page
- [ ] Add submit-paper form
- [ ] Capture title, abstract, authors, affiliation, topics, status
- [ ] Support link/upload placeholder for manuscript
- [ ] Add submission list/detail view
- [ ] Seed sample submissions

### 4.2 Submission workflow
- [ ] Track statuses (draft / submitted / under review / accepted / revise / rejected)
- [ ] Show submitter-facing status page
- [ ] Show paper detail pages
- [ ] Add admin/editor view of submissions

---

## Phase 5 — Add a review system for papers

### 5.1 Review model and workflow
- [ ] Define reviews data model
- [ ] Support reviewer assignment
- [ ] Support review status tracking
- [ ] Support accept / revise / reject decisions
- [ ] Support reviewer comments
- [ ] Support editor summary/decision notes

### 5.2 Review UI
- [ ] Add reviewer dashboard
- [ ] Add submission review detail page
- [ ] Add decision controls for editor/admin
- [ ] Show author-facing review outcome cleanly

### 5.3 Sample data and realism
- [ ] Seed sample papers with mixed statuses
- [ ] Seed sample reviews/comments
- [ ] Make review system feel institutionally credible

---

## Phase 6 — Expand toward “IEEE for systems engineers”

### 6.1 Professional institution features
- [ ] Working groups / special interest groups
- [ ] Events / conferences / calls for papers
- [ ] Standards / templates / knowledge library
- [ ] Job / opportunity surfaces where useful
- [ ] Member credibility signals / expertise indicators

### 6.2 Trust, governance, and moderation
- [ ] Improve admin tooling
- [ ] Improve report/review flow
- [ ] Add governance / editorial workflows
- [ ] Add role distinctions (member / reviewer / editor / admin)

---

## Ongoing Operating Rules
- [ ] Keep shipping in small coherent commits
- [ ] Push whenever a chunk is reviewable
- [ ] Update verification report as journeys are tested/fixed
- [ ] Update user-journey doc as coverage improves
- [ ] Send s meaningful progress updates in chat as milestones land
- [ ] Send status update at least every 8 hours

---

## Immediate Next Actions
1. Fix signed-in feed permission error.
2. Verify onboarding/profile save end-to-end.
3. Verify authenticated publish end-to-end.
4. Create robust seed path.
5. Seed the site heavily for tomorrow’s review.
6. Start news feature immediately after core path is stable.
