CREATE OR REPLACE FUNCTION public.limit_public_builder_quote_submissions() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
 IF NEW.source = 'public' THEN
  PERFORM pg_advisory_xact_lock(710284321);
  IF (SELECT count(*) FROM public.builder_orders WHERE source = 'public' AND created_at > now() - interval '1 hour') >= 100
    OR (SELECT count(*) FROM public.builder_orders WHERE source = 'public' AND lower(contact_email) = lower(NEW.contact_email) AND created_at > now() - interval '1 hour') >= 3 THEN
   RAISE EXCEPTION 'Public quote request limit reached' USING ERRCODE = 'P0001';
  END IF;
 END IF;
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.limit_public_builder_quote_submissions() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER limit_public_builder_quote_submissions BEFORE INSERT ON public.builder_orders FOR EACH ROW EXECUTE FUNCTION public.limit_public_builder_quote_submissions();