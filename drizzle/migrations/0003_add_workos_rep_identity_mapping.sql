CREATE TABLE public.rep_identities (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 workos_user_id text NOT NULL UNIQUE,
 email text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.rep_identities TO service_role;
REVOKE ALL ON public.rep_identities FROM PUBLIC, anon, authenticated;
ALTER TABLE public.rep_identities ENABLE ROW LEVEL SECURITY;
CREATE POLICY rep_identity_service_access ON public.rep_identities FOR ALL TO service_role USING (true) WITH CHECK (true);
COMMENT ON TABLE public.rep_identities IS 'Server-only mapping from verified authorized WorkOS user IDs to stable UUID order attribution. No browser access.';