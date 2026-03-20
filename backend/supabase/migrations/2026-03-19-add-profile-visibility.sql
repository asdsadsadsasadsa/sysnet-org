alter table public.profiles
add column if not exists visibility text;

update public.profiles
set visibility = 'public'
where visibility is null;

alter table public.profiles
alter column visibility set default 'public';

alter table public.profiles
alter column visibility set not null;

alter table public.profiles
drop constraint if exists profiles_visibility_check;

alter table public.profiles
add constraint profiles_visibility_check
check (visibility in ('public', 'private'));

drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles
for select using (visibility = 'public' or auth.uid() = id);
