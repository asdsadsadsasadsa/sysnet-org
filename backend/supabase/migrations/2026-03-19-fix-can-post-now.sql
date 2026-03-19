-- Fix post insert permission issue caused by can_post_now() reading auth.users
-- during an RLS check with the caller's privileges.

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
