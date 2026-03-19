-- Seed scaffold for sysnet-org sample content
--
-- Purpose:
-- - stage the current sample pack in SQL form
-- - make profile/post/comment insertion easier once matching auth.users rows exist
-- - keep the apply process explicit instead of hand-wavy
--
-- Important:
-- profiles.id must match real auth.users.id values.
-- Before running the profile upserts below, replace the placeholder UUIDs in seed_profiles
-- with real auth.users IDs from the target Supabase project.

begin;

create temp table seed_profiles (
  id uuid,
  handle text,
  display_name text,
  headline text,
  bio text,
  location text,
  timezone text,
  domains text[],
  tags text[],
  open_to text[]
) on commit drop;

insert into seed_profiles (id, handle, display_name, headline, bio, location, timezone, domains, tags, open_to)
values
  ('00000000-0000-0000-0000-000000000001', 'maya-mbse', 'Maya Chen', 'Principal MBSE lead for safety-critical aerospace programs', 'Leads model-based systems engineering adoption across flight controls and mission-planning teams. Interested in verification rigor, requirements traceability, and making MBSE useful beyond slideware.', 'Seattle, WA', 'America/Los_Angeles', array[''aerospace'', ''systems engineering'', ''mbse''], array[''sysml'', ''cameo'', ''requirements'', ''verification''], array[''mentoring'', ''consulting'']),
  ('00000000-0000-0000-0000-000000000002', 'omar-embedded-systems', 'Omar Rahman', 'Embedded systems architect bridging hardware, firmware, and test', 'Works on cross-functional architecture for industrial robotics platforms. Cares about interface clarity, failure analysis, and disciplined system decomposition.', 'Austin, TX', 'America/Chicago', array[''robotics'', ''embedded systems'', ''industrial automation''], array[''embedded'', ''integration'', ''interfaces'', ''test''], array[''hiring'']),
  ('00000000-0000-0000-0000-000000000003', 'lina-medtech', 'Lina Park', 'Systems engineer for regulated medical device platforms', 'Focuses on requirements, risk controls, and design history discipline for connected medtech products. Likes translating compliance pressure into cleaner engineering systems.', 'San Diego, CA', 'America/Los_Angeles', array[''medical devices'', ''quality systems'', ''regulated products''], array[''risk management'', ''traceability'', ''verification'', ''validation''], array[''mentoring'']),
  ('00000000-0000-0000-0000-000000000004', 'diego-autonomy', 'Diego Alvarez', 'Autonomy systems engineer working across perception, planning, and ops', 'Helps autonomy teams reason about system boundaries, operational envelopes, and failure containment. Interested in reviewable architecture artifacts and simulation-informed decisions.', 'Mountain View, CA', 'America/Los_Angeles', array[''autonomy'', ''robotics'', ''simulation''], array[''planning'', ''safety'', ''simulation'', ''architecture''], array[''consulting'', ''hiring'']),
  ('00000000-0000-0000-0000-000000000005', 'rhea-defense-systems', 'Rhea Banerjee', 'Systems integration manager for large defense programs', 'Coordinates subsystem integration across contractors, test teams, and program management. Particularly interested in configuration drift, interface governance, and review discipline.', 'Arlington, VA', 'America/New_York', array[''defense'', ''integration'', ''program execution''], array[''interfaces'', ''icd'', ''configuration'', ''integration''], array[''mentoring'']),
  ('00000000-0000-0000-0000-000000000006', 'noah-systems-safety', 'Noah Kim', 'Systems safety engineer focused on hazard analysis and operational resilience', 'Works with platform teams to turn safety cases into design decisions instead of compliance theater. Deeply interested in STPA, fault containment, and testable mitigations.', 'Denver, CO', 'America/Denver', array[''systems safety'', ''hazard analysis'', ''resilience''], array[''stpa'', ''fault analysis'', ''safety case'', ''verification''], array[''consulting'']),
  ('00000000-0000-0000-0000-000000000007', 'irene-rail-systems', 'Irene Volkov', 'Rail systems engineer coordinating infrastructure and rolling stock interfaces', 'Works on large rail modernization efforts with a focus on interfaces, operational readiness, and test planning across vendors and public stakeholders.', 'London, UK', 'Europe/London', array[''rail'', ''infrastructure'', ''transportation''], array[''integration'', ''operational readiness'', ''test planning'', ''interfaces''], array[''mentoring'', ''hiring'']),
  ('00000000-0000-0000-0000-000000000008', 'ethan-digital-thread', 'Ethan Brooks', 'Digital thread strategist for complex product development organizations', 'Helps teams connect requirements, models, verification evidence, and change control into a usable engineering thread. Suspicious of dashboards that do not improve decisions.', 'Boston, MA', 'America/New_York', array[''digital thread'', ''plm'', ''systems transformation''], array[''traceability'', ''plm'', ''requirements'', ''governance''], array[''consulting'', ''mentoring'']);

-- Safety check: all IDs must exist in auth.users before profile upsert.
-- Uncomment to validate once placeholder UUIDs are replaced.
-- select sp.handle, sp.id from seed_profiles sp
-- left join auth.users u on u.id = sp.id
-- where u.id is null;

insert into public.profiles (id, handle, display_name, headline, bio, location, timezone, domains, tags, open_to, updated_at)
select id, handle, display_name, headline, bio, location, timezone, domains, tags, open_to, now()
from seed_profiles
on conflict (id) do update set
  handle = excluded.handle,
  display_name = excluded.display_name,
  headline = excluded.headline,
  bio = excluded.bio,
  location = excluded.location,
  timezone = excluded.timezone,
  domains = excluded.domains,
  tags = excluded.tags,
  open_to = excluded.open_to,
  updated_at = now();

create temp table seed_posts (
  author_handle text,
  title text,
  body text,
  group_slug text
) on commit drop;

insert into seed_posts (author_handle, title, body, group_slug)
values
  ('maya-mbse', 'What finally made MBSE reviews useful for our flight-controls team', 'The biggest improvement was banning model tours. Reviews got better when every session had one operational question, one boundary condition, and one explicit decision to make. We also forced every diagram to point back to a requirement or verification artifact. The model became less decorative and more argumentative.', null),
  ('omar-embedded-systems', 'A simple interface contract template cut our integration churn hard', 'We kept rediscovering the same cross-team failures: assumed timings, undocumented reset behavior, and unclear ownership for degraded modes. A lightweight contract template fixed more than another architecture review ever did. We now require nominal flow, failure behavior, timing assumptions, and test ownership on every subsystem interface.', null),
  ('lina-medtech', 'Traceability gets easier once you stop pretending every requirement is equally important', 'We had a messy requirement tree until we started separating safety-critical, regulatory, and convenience requirements much more explicitly. That made reviews sharper and verification planning less chaotic. The lesson: traceability quality comes from better requirement structure, not just more tooling.', null),
  ('noah-systems-safety', 'STPA was most useful for us when we paired it with interface ownership', 'Hazard analysis alone did not change much. The big shift happened when every unsafe control action also had a named interface owner, mitigation owner, and test owner. That created accountability and turned safety analysis into engineering work instead of a PDF graveyard.', null);

insert into public.posts (author_id, group_slug, title, body)
select p.id, sp.group_slug, sp.title, sp.body
from seed_posts sp
join public.profiles p on p.handle = sp.author_handle
where not exists (
  select 1 from public.posts existing
  where existing.author_id = p.id and existing.title = sp.title
);

create temp table seed_comments (
  post_author_handle text,
  post_title text,
  author_handle text,
  body text
) on commit drop;

insert into seed_comments (post_author_handle, post_title, author_handle, body)
values
  ('maya-mbse', 'What finally made MBSE reviews useful for our flight-controls team', 'ethan-digital-thread', 'The requirement/verif link is the key. The moment the model has to support a decision, people stop stuffing it with ornamental detail.'),
  ('omar-embedded-systems', 'A simple interface contract template cut our integration churn hard', 'rhea-defense-systems', 'We ended up doing something similar on a defense integration effort. The trick was forcing timing and degraded-mode assumptions into the same artifact instead of separate documents.');

insert into public.comments (post_id, author_id, body)
select post_target.id, author_profile.id, sc.body
from seed_comments sc
join public.profiles post_author on post_author.handle = sc.post_author_handle
join public.posts post_target on post_target.author_id = post_author.id and post_target.title = sc.post_title
join public.profiles author_profile on author_profile.handle = sc.author_handle
where not exists (
  select 1 from public.comments existing
  where existing.post_id = post_target.id
    and existing.author_id = author_profile.id
    and existing.body = sc.body
);

commit;
