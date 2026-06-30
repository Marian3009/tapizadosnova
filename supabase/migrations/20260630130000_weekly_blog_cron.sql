-- Weekly blog automation: every Monday at 09:00 Spain time (07:00 UTC summer / 08:00 UTC winter).
-- Uses pg_cron + pg_net to call the weekly-blog-publish edge function.
--
-- REQUIRED before applying:
--   1. Enable pg_cron in Supabase Dashboard → Database → Extensions → pg_cron
--   2. Enable pg_net in Supabase Dashboard → Database → Extensions → pg_net
--   3. Add the secret in Supabase Dashboard → Edge Functions → Secrets:
--        BLOG_AUTOMATION_SECRET = TN_BLOG_2026_AUTO
--      (or replace 'TN_BLOG_2026_AUTO' below with your existing BLOG_AUTOMATION_SECRET value)

SELECT cron.schedule(
  'tapizados-nova-weekly-blog',   -- job name (unique)
  '0 7 * * 1',                    -- every Monday at 07:00 UTC (09:00 Spain summer time)
  $$
  SELECT net.http_post(
    url     := 'https://rxemgohptrzicnfnjamr.supabase.co/functions/v1/weekly-blog-publish',
    headers := '{"Content-Type": "application/json", "x-automation-secret": "TN_BLOG_2026_AUTO"}'::jsonb,
    body    := '{"publish": true}'::jsonb
  ) AS request_id;
  $$
);
