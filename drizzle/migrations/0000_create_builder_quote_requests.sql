CREATE TABLE public.builder_orders (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 created_at timestamptz NOT NULL DEFAULT now(),
 source text NOT NULL CHECK (source IN ('public', 'rep')),
 rep_user_id uuid,
 rep_email text,
 business_name text NOT NULL CHECK (char_length(business_name) BETWEEN 1 AND 120),
 contact_email text NOT NULL CHECK (char_length(contact_email) BETWEEN 3 AND 254),
 page_count integer NOT NULL CHECK (page_count BETWEEN 1 AND 50),
 payment_preference text NOT NULL CHECK (payment_preference IN ('one-time', 'subscription')),
 configuration jsonb NOT NULL CHECK (jsonb_typeof(configuration) = 'object' AND octet_length(configuration::text) <= 30000),
 status text NOT NULL DEFAULT 'quote_requested' CHECK (status = 'quote_requested'),
 pricing_status text NOT NULL DEFAULT 'pending_confirmation' CHECK (pricing_status = 'pending_confirmation'),
 CONSTRAINT builder_source_scope CHECK ((source = 'public' AND rep_user_id IS NULL AND rep_email IS NULL AND page_count = 1 AND payment_preference = 'one-time') OR (source = 'rep' AND rep_user_id IS NOT NULL AND rep_email IS NOT NULL)),
 CONSTRAINT builder_config_scope CHECK (configuration->>'page_count' = page_count::text AND configuration->>'payment_preference' = payment_preference),
 CONSTRAINT builder_public_options CHECK (source <> 'public' OR (configuration->>'scope' = 'single' AND configuration->'pages' = '["Home"]'::jsonb AND NOT (configuration ?| ARRAY['vapi', 'voice_tier', 'monthly_minutes', 'price_id', 'price', 'rep_user_id', 'rep_email'])))
);
GRANT ALL ON public.builder_orders TO service_role;
REVOKE ALL ON public.builder_orders FROM anon, authenticated;
ALTER TABLE public.builder_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY builder_no_direct_visitor_access ON public.builder_orders FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY builder_service_access ON public.builder_orders FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE INDEX builder_orders_rep_created_idx ON public.builder_orders (rep_user_id, created_at DESC);
CREATE INDEX builder_orders_created_idx ON public.builder_orders (created_at DESC);
COMMENT ON TABLE public.builder_orders IS 'Private quote requests. Public inserts only via strict server validation. Rep access only via verified-email allowlist server functions, reads scoped to caller user ID. No direct browser access.';