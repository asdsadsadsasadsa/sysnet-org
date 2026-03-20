create or replace view public.profile_identities as
select id, handle, display_name
from public.profiles;

grant select on public.profile_identities to anon;
grant select on public.profile_identities to authenticated;
