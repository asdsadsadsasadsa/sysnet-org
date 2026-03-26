create table if not exists public.news_articles (
  id uuid primary key default gen_random_uuid(),
  hn_story_id text unique not null,
  hn_url text not null,
  original_url text,
  headline text not null,
  summary text not null,
  body text not null,
  image_url text,
  topic text not null default 'Systems Engineering',
  source_title text,
  source_domain text,
  hn_points integer default 0,
  hn_comments integer default 0,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.news_articles enable row level security;

create policy "News articles are publicly readable" on public.news_articles
  for select using (true);

create policy "Service role can insert/update news articles" on public.news_articles
  for all using (auth.role() = 'service_role');

create index if not exists news_articles_published_at_idx on public.news_articles (published_at desc);
create index if not exists news_articles_topic_idx on public.news_articles (topic);
create index if not exists news_articles_hn_story_id_idx on public.news_articles (hn_story_id);
