# Seeding plan

This plan turns the current sample-content pack into actual rows for the existing schema.

## Source content
Use:

- `backend/supabase/seed-content-pack-2026-03-19.json`

## Current schema constraints

### Profiles
Table: `public.profiles`

Required/expected fields:
- `id` (uuid, must match a real `auth.users.id`)
- `handle`
- `display_name`
- `headline`
- `bio`
- `location`
- `timezone`
- `domains` (text[])
- `tags` (text[])
- `open_to` (text[])

### Posts
Table: `public.posts`

Required/expected fields:
- `author_id` (must reference an existing `public.profiles.id`)
- `group_slug`
- `title`
- `body`

### Comments
Table: `public.comments`

Required/expected fields:
- `post_id`
- `author_id`
- `body`

## Recommended apply order

1. Create/confirm matching auth users for each sample profile.
2. Insert/update `public.profiles` rows using the JSON pack.
3. Resolve `author_handle -> profile.id` and insert `public.posts`.
4. Resolve `(post_author_handle, post_title) -> post.id` and insert `public.comments`.
5. Re-open `/people` and `/feed` in production and confirm the site now feels inhabited.

## Practical mapping notes

### Profile identity
Because `profiles.id` must match `auth.users.id`, the seed process needs one of these:
- admin-created auth users for each sample persona, or
- an alternate seed path that temporarily uses existing real test users

If speed matters more than perfect realism, start by:
- creating a smaller number of seed auth users
- loading the best 8-12 profiles first
- then expanding once the path works cleanly

### Post mapping
The JSON pack uses `author_handle` instead of UUIDs. During seeding:
- look up `profiles.id` by `handle`
- insert post rows with that `id` as `author_id`

### Comment mapping
The JSON pack uses:
- `post_author_handle`
- `post_title`
- `author_handle`

During seeding:
1. find the target post by `title` + author handle
2. find the commenter profile by handle
3. insert the comment row with resolved IDs

## Suggested first apply slice
If we want visible progress fast, seed this minimal set first:

- 8 profiles from the pack
- 4 posts from the pack
- 2 comments from the pack

That is enough to make:
- `/people` look populated
- `/feed` show credible content
- the homepage claims feel less fake

## What still needs a script
A robust seed script/admin flow should eventually:
- load the JSON pack
- create or map auth users
- upsert profiles
- insert posts
- insert comments
- print a summary of inserted rows and any conflicts

## Next best implementation target
Build a seed script that accepts:
- path to JSON pack
- Supabase URL
- service-role key

And performs the mapping above in one repeatable run.

## SQL scaffold now available
For a SQL-editor-first apply path, use:

- `backend/supabase/seed-scaffold.sql`

Notes:
- it stages the current sample pack into temp tables
- it upserts profiles, then inserts posts/comments by handle/title mapping
- profile UUID placeholders must be replaced with real `auth.users.id` values before the profile upsert step is safe to run
