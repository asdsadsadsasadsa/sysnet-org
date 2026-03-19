# Apply now — feed publish permission fix

## Why this exists
Live publishing is currently blocked by this error:

- `permission denied for table users`

The likely cause is the `public.can_post_now(uuid)` helper reading `auth.users` during an RLS check with the caller's privileges.

## What to run in Supabase SQL Editor
Open the target Supabase project for sysnet-org and run the following SQL:

```sql
create or replace function public.can_post_now(user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select case
    when exists (
      select 1 from auth.users u
      where u.id = user_id and u.created_at > now() - interval '24 hours'
    ) then (
      select count(*) < 3 from public.posts p
      where p.author_id = user_id and p.created_at > now() - interval '24 hours'
    )
    else true
  end;
$$;

revoke all on function public.can_post_now(uuid) from public;
grant execute on function public.can_post_now(uuid) to authenticated;
grant execute on function public.can_post_now(uuid) to anon;
```

## Canonical repo file
This is also stored as:

- `backend/supabase/migrations/2026-03-19-fix-can-post-now.sql`

## Expected result after apply
- authenticated post creation should stop failing with `permission denied for table users`
- next verification step: log in on production and publish a test post through `/feed`

## If it still fails
Check for:
- another function/trigger reading `auth.users`
- a stale policy definition in the actual database
- the production project not matching the schema in this repo
