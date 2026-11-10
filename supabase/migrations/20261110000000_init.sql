-- VeloLink AI initial schema.
-- Every business row belongs to an organization; RLS limits access to its members.

create type public.package as enum ('single_page', 'five_page', 'seven_plus_page');
create type public.order_status as enum (
  'received', 'generating', 'ready_for_review', 'customer_review', 'changes_requested',
  'qa', 'approved', 'published', 'failed'
);
-- Reps submit client deals; admins and owners manage everything.
create type public.payment_status as enum ('unpaid', 'paid', 'refunded');
-- 'existing': customer already owns a domain; 'purchase': we buy and provision one for a fee.
create type public.domain_option as enum ('existing', 'purchase');
create type public.member_role as enum ('owner', 'admin', 'rep');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.memberships (
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.member_role not null default 'rep',
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

-- Helper used by every policy. Security definer so it can read memberships under RLS.
create function public.is_member(org uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.memberships m
    where m.organization_id = org and m.user_id = (select auth.uid())
  );
$$;

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  business_name text not null,
  phone text,
  email text,
  zendesk_user_id bigint unique,
  created_at timestamptz not null default now()
);

-- A template is a visual style; it works with any package.
create table public.templates (
  id text not null,
  version int not null check (version > 0),
  name text not null,
  definition jsonb not null,
  created_at timestamptz not null default now(),
  primary key (id, version)
);

create table public.sites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  template_id text not null,
  template_version int not null,
  package public.package not null,
  status public.order_status not null default 'received',
  zendesk_ticket_id bigint unique,
  payment_status public.payment_status not null default 'unpaid', -- set by the Stripe webhook later
  stripe_checkout_session_id text unique,
  stripe_invoice_id text unique,          -- attached to the Zendesk build ticket
  maintenance_plan boolean not null default false,
  maintenance_edits_per_month smallint not null default 0 check (maintenance_edits_per_month between 0 and 3),
  submitted_by uuid not null references auth.users (id), -- the rep who submitted the deal
  receptionist_voice text,
  custom_domain text unique,
  domain_option public.domain_option not null default 'existing',
  domain_fee_cents int check (domain_fee_cents >= 0),
  purchased_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  foreign key (template_id, template_version) references public.templates (id, version)
);

create table public.site_versions (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites (id) on delete cascade,
  version int not null check (version > 0),
  content jsonb not null,           -- validated Site JSON (page tree)
  created_by uuid references auth.users (id),
  note text,
  created_at timestamptz not null default now(),
  unique (site_id, version)
);

create table public.assets (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites (id) on delete cascade,
  storage_path text not null,
  alt text,
  created_at timestamptz not null default now()
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites (id) on delete cascade,
  step text not null,
  status text not null check (status in ('queued', 'running', 'succeeded', 'failed')),
  error text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

-- Post-launch edit requests. Maintenance plan: 1-3 included edits a month
-- (major changes billed). No plan: every edit is billed, from $50.
create type public.edit_status as enum ('requested', 'quoted', 'in_progress', 'done', 'declined');
create table public.edit_requests (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites (id) on delete cascade,
  description text not null,
  is_major boolean not null default false,
  included_in_plan boolean not null default false,
  fee_cents int not null default 0 check (fee_cents >= 0),
  status public.edit_status not null default 'requested',
  zendesk_ticket_id bigint unique,
  requested_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.qa_results (
  id uuid primary key default gen_random_uuid(),
  site_version_id uuid not null references public.site_versions (id) on delete cascade,
  check_name text not null,
  passed boolean not null,
  details jsonb,
  created_at timestamptz not null default now()
);

create index on public.clients (organization_id);
create index on public.sites (organization_id);
create index on public.sites (client_id);
create index on public.sites (submitted_by);
create index on public.site_versions (site_id);
create index on public.assets (site_id);
create index on public.jobs (site_id);
create index on public.qa_results (site_version_id);
create index on public.edit_requests (site_id, requested_at);

-- Row level security
alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.clients enable row level security;
alter table public.templates enable row level security;
alter table public.sites enable row level security;
alter table public.site_versions enable row level security;
alter table public.assets enable row level security;
alter table public.jobs enable row level security;
alter table public.qa_results enable row level security;
alter table public.edit_requests enable row level security;

create policy "members read their org" on public.organizations
  for select to authenticated using (public.is_member(id));
create policy "members read their memberships" on public.memberships
  for select to authenticated using (user_id = (select auth.uid()));

create policy "templates readable by staff" on public.templates
  for select to authenticated using (true);

create policy "org members manage clients" on public.clients
  for all to authenticated using (public.is_member(organization_id)) with check (public.is_member(organization_id));
create policy "org members manage sites" on public.sites
  for all to authenticated using (public.is_member(organization_id)) with check (public.is_member(organization_id));

create policy "org members manage site versions" on public.site_versions
  for all to authenticated
  using (exists (select 1 from public.sites s where s.id = site_id and public.is_member(s.organization_id)))
  with check (exists (select 1 from public.sites s where s.id = site_id and public.is_member(s.organization_id)));
create policy "org members manage assets" on public.assets
  for all to authenticated
  using (exists (select 1 from public.sites s where s.id = site_id and public.is_member(s.organization_id)))
  with check (exists (select 1 from public.sites s where s.id = site_id and public.is_member(s.organization_id)));
create policy "org members read jobs" on public.jobs
  for select to authenticated
  using (exists (select 1 from public.sites s where s.id = site_id and public.is_member(s.organization_id)));
create policy "org members read qa results" on public.qa_results
  for select to authenticated
  using (exists (
    select 1 from public.site_versions v join public.sites s on s.id = v.site_id
    where v.id = site_version_id and public.is_member(s.organization_id)
  ));
create policy "org members manage edit requests" on public.edit_requests
  for all to authenticated
  using (exists (select 1 from public.sites s where s.id = site_id and public.is_member(s.organization_id)))
  with check (exists (select 1 from public.sites s where s.id = site_id and public.is_member(s.organization_id)));
-- Jobs and QA results are written by the server with the secret key, which bypasses RLS.
