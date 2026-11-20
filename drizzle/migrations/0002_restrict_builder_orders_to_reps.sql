CREATE OR REPLACE FUNCTION public.limit_public_builder_quote_submissions() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
 IF NEW.source IS DISTINCT FROM 'rep' OR NEW.rep_user_id IS NULL OR NEW.rep_email IS NULL OR btrim(NEW.rep_email) = '' THEN
  RAISE EXCEPTION 'Site orders require an authorized representative' USING ERRCODE = '42501';
 END IF;
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.limit_public_builder_quote_submissions() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER require_rep_builder_order_update BEFORE UPDATE ON public.builder_orders FOR EACH ROW EXECUTE FUNCTION public.limit_public_builder_quote_submissions();
ALTER TABLE public.builder_orders ADD CONSTRAINT builder_rep_only CHECK (source = 'rep' AND rep_user_id IS NOT NULL AND rep_email IS NOT NULL AND btrim(rep_email) <> '') NOT VALID;
REVOKE ALL ON public.builder_orders FROM PUBLIC, anon, authenticated;
COMMENT ON FUNCTION public.limit_public_builder_quote_submissions() IS 'Rep-only insert/update guard; replaces deprecated public rate limiter. Current verified rep allowlist is enforced by every application server handler.';
COMMENT ON TABLE public.builder_orders IS 'Rep-only quote requests; historical public rows retained, but no new public inserts or updates permitted. No browser grants. Server handlers verify current Auth email and allowlist, with reads scoped to rep ID.';