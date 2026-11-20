CREATE TABLE public.contact_inquiries (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 created_at timestamptz NOT NULL DEFAULT now(),
 name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
 business text NOT NULL CHECK (char_length(business) BETWEEN 1 AND 120),
 email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 254),
 phone text CHECK (phone IS NULL OR char_length(phone) <= 60),
 topic text NOT NULL CHECK (char_length(topic) BETWEEN 1 AND 160),
 message text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 4000)
);
GRANT ALL ON public.contact_inquiries TO service_role;
REVOKE ALL ON public.contact_inquiries FROM PUBLIC, anon, authenticated;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY contact_inquiries_service_access ON public.contact_inquiries FOR ALL TO service_role USING (true) WITH CHECK (true);
COMMENT ON TABLE public.contact_inquiries IS 'Private public contact inquiries. Server inserts only; public visitors cannot read, update, or delete submissions.';
CREATE TABLE public.booking_requests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 created_at timestamptz NOT NULL DEFAULT now(),
 name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
 business text NOT NULL CHECK (char_length(business) BETWEEN 1 AND 120),
 email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 254),
 phone text CHECK (phone IS NULL OR char_length(phone) <= 60),
 requested_window text NOT NULL CHECK (char_length(requested_window) BETWEEN 1 AND 500),
 timezone text NOT NULL CHECK (char_length(timezone) BETWEEN 1 AND 120),
 reason text NOT NULL CHECK (char_length(reason) BETWEEN 1 AND 4000),
 status text NOT NULL DEFAULT 'awaiting_confirmation' CHECK (status IN ('awaiting_confirmation', 'reviewed', 'assigned', 'confirmed'))
);
GRANT ALL ON public.booking_requests TO service_role;
REVOKE ALL ON public.booking_requests FROM PUBLIC, anon, authenticated;
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY booking_requests_service_access ON public.booking_requests FOR ALL TO service_role USING (true) WITH CHECK (true);
COMMENT ON TABLE public.booking_requests IS 'Private visitor meeting requests awaiting asousa@hyrlink.app review and rep assignment. No calendar event is created by this intake.';