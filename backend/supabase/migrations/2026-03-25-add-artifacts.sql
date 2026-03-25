create table if not exists artifacts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users(id) on delete cascade,
  title text not null,
  abstract text,
  artifact_type text not null check (artifact_type in ('paper', 'spec', 'standards-summary', 'reference-design', 'case-study')),
  group_slug text,
  tags text[] default '{}',
  external_url text,
  file_url text,
  citation text,
  published_year int,
  status text not null default 'published' check (status in ('draft', 'published')),
  view_count int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table artifacts enable row level security;
create policy "Published artifacts are public" on artifacts for select using (status = 'published');
create policy "Authors can manage own artifacts" on artifacts for all using (auth.uid() = author_id);
