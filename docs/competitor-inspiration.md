# Competitor & Adjacent Org Inspiration

We reviewed the member portals and feature sets of traditional engineering organizations (IEEE, INCOSE, ACM, BCS) to capture inspiration for `sysnet-org` and understand what we should do differently.

## IEEE (Institute of Electrical and Electronics Engineers)
**What they do well:**
- **Societies:** Hyper-specific sub-groups (e.g., IEEE Computer Society, IEEE Aerospace). 
- **Standards Development:** Formal spaces for drafting and debating standards.
- **Xplore Digital Library:** The gold standard for academic paper archiving.

**Inspiration for sysnet-org:**
- Instead of "Societies", we can lean into our `domains` and `tags` (e.g., `#systems-engineering`, `#aerospace`) to auto-curate feeds.
- Instead of a paywalled digital library, our `/feed` and `/post/[id]` pages should act as a living, open-access pattern library of practical case studies, completely avoiding the academic paywall model.

## INCOSE (International Council on Systems Engineering)
**What they do well:**
- **Working Groups (WGs):** Focused on specific problems (e.g., MBSE, Agile Systems Engineering).
- **Certification:** SEP (Systems Engineering Professional) hierarchy (ASEP, CSEP, ESEP).
- **Chapter Events:** Localized networking.

**Inspiration for sysnet-org:**
- Modernize the "Working Group" concept into async, ongoing discussion spaces (like our `group_slug` on posts, which we can expand into a full `/g/[slug]` community feature).
- Instead of exam-based certifications, we could build a "Portfolio" or "Verified Case Studies" section on user profiles where engineers prove competence through actual write-ups rather than multiple-choice tests.

## ACM (Association for Computing Machinery)
**What they do well:**
- **SIGs (Special Interest Groups):** Very active and highly specialized.
- **Conferences:** Massive global events.

**Inspiration for sysnet-org:**
- We could add a "Conferences/Events" board where users can tag which events they are attending, making real-world networking easier. 

## BCS (British Computer Society)
**What they do well:**
- **Chartered Status (CITP):** Formal recognition of professional standing.
- **CPD (Continuous Professional Development):** Tools for tracking ongoing learning.
- **Mentorship Network:** Connecting junior and senior practitioners.

**Inspiration for sysnet-org:**
- **Mentorship:** We already have `open_to: ['mentoring']` in the database! We should build a dedicated `/mentors` UI that filters the people directory for senior engineers willing to mentor, making the match-making process seamless.
- **CPD Tracking:** A lightweight version could be allowing users to "bookmark" or "save" posts/patterns they've learned from.

## Summary of Actionable Features for sysnet-org:
1. **Mentorship Matcher:** A dedicated view in the Directory filtering for `open_to: mentoring`.
2. **Event Roll-call:** Let users flag which industry events they are attending.
3. **Working Groups (Spaces):** Build out the `/g/[slug]` routes into proper sub-communities.
4. **Portfolio/Case Studies Tab:** On the profile page, highlight long-form practical write-ups as a modern alternative to traditional certs.
