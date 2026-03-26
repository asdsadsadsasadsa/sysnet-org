#!/usr/bin/env node
/**
 * Apply the news_articles table migration via Supabase.
 * Run once: node apply-news-migration.mjs
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fxtzbsgyallzcwznxztv.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4dHpic2d5YWxsemN3em54enR2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjUwODQwMywiZXhwIjoyMDg4MDg0NDAzfQ.9CHufTKTq4Y4PDfkz5niSxMgwBKFNqAcRoDK1ZSukMc';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// Test insert to force table creation check
const { error } = await supabase.rpc('exec_sql', {
  query: `
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
    do $$ begin
      if not exists (select from pg_policies where tablename = 'news_articles' and policyname = 'News articles are publicly readable') then
        create policy "News articles are publicly readable" on public.news_articles for select using (true);
      end if;
    end $$;
    create index if not exists news_articles_published_at_idx on public.news_articles (published_at desc);
    create index if not exists news_articles_topic_idx on public.news_articles (topic);
  `
});

if (error) {
  console.error('Migration failed:', error.message);
  console.log('You may need to run the SQL manually in Supabase dashboard SQL editor.');
  console.log('SQL file: backend/supabase/migrations/2026-03-25-add-news-articles.sql');
} else {
  console.log('Migration applied successfully.');
}
