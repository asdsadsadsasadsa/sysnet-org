-- Enable extensions
create extension if not exists pgcrypto;

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text unique not null,
  display_name text not null,
  visibility text not null default 'public' check (visibility in ('public', 'private')),
  headline text,
  bio text,
  location text,
  timezone text,
  domains text[] default '{}',
  tags text[] default '{}',
  open_to text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Minimal public identity surface for posts/comments.
create or replace view public.profile_identities as
select id, handle, display_name
from public.profiles;

grant select on public.profile_identities to anon;
grant select on public.profile_identities to authenticated;

-- Connection requests
create table if not exists public.connection_requests (
  id uuid primary key default gen_random_uuid(),
  from_user uuid not null references public.profiles(id) on delete cascade,
  to_user uuid not null references public.profiles(id) on delete cascade,
  status text not null check (status in ('pending','accepted','declined')) default 'pending',
  created_at timestamptz not null default now(),
  unique(from_user, to_user),
  check (from_user <> to_user)
);

-- Accepted connections
create table if not exists public.connections (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (user_a <> user_b)
);

create unique index if not exists connections_pair_uq
  on public.connections (least(user_a, user_b), greatest(user_a, user_b));

-- Posts
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  group_slug text,
  title text not null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Comments
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Likes
create table if not exists public.likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

-- Reports
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  entity_type text not null check (entity_type in ('post','comment','profile')),
  entity_id uuid not null,
  reason text not null,
  created_at timestamptz not null default now()
);

-- Optional anti-spam helper
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

-- RLS
alter table public.profiles enable row level security;
alter table public.connection_requests enable row level security;
alter table public.connections enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.reports enable row level security;

-- profiles
DROP POLICY IF EXISTS profiles_read ON public.profiles;
create policy profiles_read on public.profiles
for select using (visibility = 'public' or auth.uid() = id);
DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
create policy profiles_insert_own on public.profiles for insert with check (auth.uid() = id);
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
create policy profiles_update_own on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- connection requests
DROP POLICY IF EXISTS cr_select_parties ON public.connection_requests;
create policy cr_select_parties on public.connection_requests
for select using (auth.uid() = from_user or auth.uid() = to_user);
DROP POLICY IF EXISTS cr_insert_sender ON public.connection_requests;
create policy cr_insert_sender on public.connection_requests
for insert with check (auth.uid() = from_user and from_user <> to_user);
DROP POLICY IF EXISTS cr_update_receiver ON public.connection_requests;
create policy cr_update_receiver on public.connection_requests
for update using (auth.uid() = to_user) with check (to_user = auth.uid());

-- connections
DROP POLICY IF EXISTS connections_select_parties ON public.connections;
create policy connections_select_parties on public.connections
for select using (auth.uid() = user_a or auth.uid() = user_b);

-- posts with first-day anti-spam
DROP POLICY IF EXISTS posts_read ON public.posts;
create policy posts_read on public.posts for select using (true);
DROP POLICY IF EXISTS posts_insert_owner ON public.posts;
create policy posts_insert_owner on public.posts
for insert with check (auth.uid() = author_id and public.can_post_now(auth.uid()));
DROP POLICY IF EXISTS posts_update_owner ON public.posts;
create policy posts_update_owner on public.posts
for update using (auth.uid() = author_id) with check (auth.uid() = author_id);
DROP POLICY IF EXISTS posts_delete_owner ON public.posts;
create policy posts_delete_owner on public.posts
for delete using (auth.uid() = author_id);

-- comments
DROP POLICY IF EXISTS comments_read ON public.comments;
create policy comments_read on public.comments for select using (true);
DROP POLICY IF EXISTS comments_insert_owner ON public.comments;
create policy comments_insert_owner on public.comments
for insert with check (auth.uid() = author_id);
DROP POLICY IF EXISTS comments_update_owner ON public.comments;
create policy comments_update_owner on public.comments
for update using (auth.uid() = author_id) with check (auth.uid() = author_id);
DROP POLICY IF EXISTS comments_delete_owner ON public.comments;
create policy comments_delete_owner on public.comments
for delete using (auth.uid() = author_id);

-- likes
DROP POLICY IF EXISTS likes_read ON public.likes;
create policy likes_read on public.likes for select using (true);
DROP POLICY IF EXISTS likes_insert_owner ON public.likes;
create policy likes_insert_owner on public.likes
for insert with check (auth.uid() = user_id);
DROP POLICY IF EXISTS likes_delete_owner ON public.likes;
create policy likes_delete_owner on public.likes
for delete using (auth.uid() = user_id);

-- reports
DROP POLICY IF EXISTS reports_insert_auth ON public.reports;
create policy reports_insert_auth on public.reports
for insert with check (auth.uid() = reporter_id);

-- Trigger: when request accepted, add connection row
create or replace function public.create_connection_from_request()
returns trigger language plpgsql security definer as $$
begin
  if new.status = 'accepted' and old.status is distinct from 'accepted' then
    insert into public.connections(user_a, user_b)
    values (least(new.from_user, new.to_user), greatest(new.from_user, new.to_user))
    on conflict do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_create_connection_from_request on public.connection_requests;
create trigger trg_create_connection_from_request
after update on public.connection_requests
for each row execute function public.create_connection_from_request();
