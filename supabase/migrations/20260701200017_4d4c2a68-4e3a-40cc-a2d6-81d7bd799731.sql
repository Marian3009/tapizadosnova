-- Revoke EXECUTE from anon/authenticated on internal SECURITY DEFINER
-- functions that are only meant to be called by the service role from
-- within edge functions or cron jobs.
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.email_queue_dispatch() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.email_queue_wake() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- has_role must remain executable by authenticated users because it is used
-- inside RLS policies (evaluated as the querying role).
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;