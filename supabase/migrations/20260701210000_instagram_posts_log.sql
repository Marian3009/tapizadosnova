-- Instagram automation: log table + cron jobs (Mon/Wed/Fri)
--
-- REQUIRED before applying:
--   1. Add secrets in Lovable / Supabase Dashboard → Edge Functions → Secrets:
--        INSTAGRAM_ACCESS_TOKEN  = <long-lived token from Meta Developer App>
--        INSTAGRAM_ACCOUNT_ID    = <numeric Instagram Business Account ID>
--   2. The BLOG_AUTOMATION_SECRET must already be set (used to auth this function too)

create table if not exists public.instagram_posts_log (
  id            uuid primary key default gen_random_uuid(),
  post_type     text not null,          -- 'blog' | 'tips' | 'inspiration'
  ig_media_id   text,                   -- Instagram media ID from Graph API
  blog_post_id  uuid references public.blog_posts(id) on delete set null,
  caption       text,
  slide_urls    text[],
  hashtags      text[],
  status        text not null default 'pending',  -- 'pending'|'published'|'error'|'dry_run'
  error_msg     text,
  published_at  timestamptz,
  created_at    timestamptz not null default now()
);

alter table public.instagram_posts_log enable row level security;

create policy "service_role_all" on public.instagram_posts_log
  for all to service_role using (true) with check (true);

-- Monday 09:00 UTC (11:00 Spain summer) — blog article carousel
select cron.schedule(
  'instagram-blog-monday',
  '0 9 * * 1',
  $$
  select net.http_post(
    url     := 'https://kmiaethuwbmivsoeqxpo.supabase.co/functions/v1/instagram-auto-post',
    headers := '{"Content-Type":"application/json","x-automation-secret":"TN_BLOG_2026_AUTO"}'::jsonb,
    body    := '{"type":"blog"}'::jsonb
  );
  $$
);

-- Wednesday 09:00 UTC — tapicería tips
select cron.schedule(
  'instagram-tips-wednesday',
  '0 9 * * 3',
  $$
  select net.http_post(
    url     := 'https://kmiaethuwbmivsoeqxpo.supabase.co/functions/v1/instagram-auto-post',
    headers := '{"Content-Type":"application/json","x-automation-secret":"TN_BLOG_2026_AUTO"}'::jsonb,
    body    := '{"type":"tips"}'::jsonb
  );
  $$
);

-- Friday 09:00 UTC — decoration / interiorismo inspiration
select cron.schedule(
  'instagram-inspiration-friday',
  '0 9 * * 5',
  $$
  select net.http_post(
    url     := 'https://kmiaethuwbmivsoeqxpo.supabase.co/functions/v1/instagram-auto-post',
    headers := '{"Content-Type":"application/json","x-automation-secret":"TN_BLOG_2026_AUTO"}'::jsonb,
    body    := '{"type":"inspiration"}'::jsonb
  );
  $$
);
