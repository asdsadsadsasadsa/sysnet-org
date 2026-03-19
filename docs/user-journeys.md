# Sysnet.org User Journeys

## Purpose
This document defines the concrete user journeys that must work for the site to be genuinely useful.

Status legend:
- [ ] not tested
- [~] tested and broken/flaky
- [x] tested and working

---

## 1. First-time visitor journeys

### 1.1 Land on homepage and understand value
- [x] Visit homepage
- [ ] Understand what the site is for within 10 seconds
- [ ] See compelling reasons to join
- [ ] Click into next action (join / browse / about)

### 1.2 Browse public pages before signing up
- [x] Visit About
- [x] Visit Guidelines
- [x] Visit People
- [x] Visit Feed
- [ ] See enough content to believe the product is alive

---

## 2. New user acquisition journeys

### 2.1 Create account
- [x] Open onboarding page
- [x] Switch to create-account mode
- [x] Submit new account successfully
- [ ] See clear success feedback
- [ ] Understand next step immediately

### 2.2 Log in as existing user
- [x] Submit valid credentials
- [ ] See clear success feedback
- [ ] Remain signed in after navigation/reload

### 2.3 Log out
- [ ] Sign out successfully
- [ ] Confirm session is gone

---

## 3. New member activation journeys

### 3.1 Complete onboarding/profile
- [ ] Reach profile form after signup/login
- [ ] Fill required profile fields
- [ ] Save profile successfully
- [ ] Redirect into useful next page
- [ ] Reload and confirm profile persisted

### 3.2 Edit profile later
- [ ] Return to onboarding/profile editor
- [ ] Update fields
- [ ] Save changes successfully
- [ ] Confirm edits appear elsewhere in product

---

## 4. Discovery journeys

### 4.1 Browse directory
- [ ] See populated member list
- [ ] Inspect member cards/details
- [ ] Understand why each person is relevant

### 4.2 Search directory
- [ ] Search by tag
- [ ] Search by headline
- [ ] Search by domain
- [ ] Get useful filtered results

### 4.3 Filter by availability
- [ ] Filter mentoring
- [ ] Filter consulting
- [ ] Filter hiring
- [ ] Filter combinations / reset cleanly

---

## 5. Social/feed journeys

### 5.1 View feed as visitor
- [ ] See populated feed
- [ ] Understand what good posts look like

### 5.2 Publish a post as signed-in user
- [ ] Write title/body
- [ ] Publish successfully
- [ ] See post appear in feed
- [ ] Reload and confirm persistence

### 5.3 Like a post
- [ ] Like once successfully
- [ ] Handle duplicate-like gracefully

### 5.4 Comment on a post
- [ ] Open post detail
- [ ] Add comment successfully
- [ ] See comment appear

### 5.5 Report a post/comment/profile
- [ ] Open reporting path
- [ ] Submit report successfully
- [ ] Confirm expected feedback

---

## 6. Connection/network journeys

### 6.1 Send connection request
- [ ] Open another profile
- [ ] Send request successfully
- [ ] See pending state

### 6.2 Accept/decline connection request
- [ ] View inbound requests
- [ ] Accept request
- [ ] Decline request
- [ ] Confirm resulting connection state

### 6.3 View existing connections
- [ ] See connected people reflected in UI

---

## 7. Admin/safety journeys

### 7.1 Admin moderation access
- [ ] Admin route loads for admin
- [ ] Non-admin is blocked

### 7.2 Review reports
- [ ] Reports visible to admin path
- [ ] Review flow works

---

## 8. Data realism / usefulness journeys

### 8.1 Site feels alive to a new visitor
- [ ] 20-200 realistic profiles seeded across disciplines
- [ ] Realistic posts seeded
- [ ] Comments/likes/activity seeded
- [ ] Variety across domains, locations, and intent

### 8.2 Site feels useful to a real engineer
- [ ] Can find relevant peers
- [ ] Can find practical discussions
- [ ] Can identify mentors/consultants/hiring leads

---

## 9. Operational journeys

### 9.1 Deploy updated build
- [x] Push deploy to Vercel successfully
- [ ] Verify key flows after deploy

### 9.2 Recover from broken release
- [ ] Detect break quickly
- [ ] Fix and redeploy quickly

---

## Highest-priority journey chain
This is the north-star path to keep green:

1. Visitor lands on homepage
2. Visitor creates account
3. Visitor logs in / remains signed in
4. Visitor completes profile
5. Visitor lands in feed
6. Visitor sees populated content
7. Visitor publishes a post
8. Visitor browses people and finds relevant profiles

If this chain is broken, fix it before doing deeper feature work.
