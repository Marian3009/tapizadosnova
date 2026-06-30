-- Enable pg_cron (scheduled jobs) and pg_net (outbound HTTP from DB)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
