-- EnovAIt schema (PostgreSQL / Supabase)
-- Apply with: supabase db push (or psql against your Supabase DB)

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'chat_role') then
    create type public.chat_role as enum ('user', 'assistant', 'system', 'tool');
  end if;
  if not exists (select 1 from pg_type where typname = 'chat_session_status') then
    create type public.chat_session_status as enum ('open', 'closed', 'archived');
  end if;
  if not exists (select 1 from pg_type where typname = 'extraction_status') then
    create type public.extraction_status as enum ('partial', 'completed', 'failed');
  end if;
  if not exists (select 1 from pg_type where typname = 'record_status') then
    create type public.record_status as enum ('draft', 'final', 'superseded');
  end if;
  if not exists (select 1 from pg_type where typname = 'workflow_state') then
    create type public.workflow_state as enum ('pending', 'approved', 'rejected', 'escalated', 'completed');
  end if;
  if not exists (select 1 from pg_type where typname = 'report_type') then
    create type public.report_type as enum ('esg_summary', 'operations_dashboard', 'compliance_checklist', 'custom');
  end if;
  if not exists (select 1 from pg_type where typname = 'integration_type') then
    create type public.integration_type as enum ('excel', 'api', 'webhook', 'iot', 'whatsapp_baileys', 'whatsapp_official', 'email', 'slack', 'msteams', 'web_widget', 'mobile_sdk', 'sms', 'voice_ivr', 'iot_mqtt', 'erp_crm', 'api_partner');
  end if;
  if not exists (select 1 from pg_type where typname = 'notification_channel') then
    create type public.notification_channel as enum ('in_app', 'email', 'webhook');
  end if;
  if not exists (select 1 from pg_type where typname = 'notification_status') then
    create type public.notification_status as enum ('pending', 'sent', 'failed');
  end if;
end $$;

create or replace function public.current_user_id()
returns uuid language sql stable as $$
  select auth.uid();
$$;

create or replace function public.current_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select u.org_id
  from public.users u
  where u.id = auth.uid() and u.is_active = true
  limit 1;
$$;

create or replace function public.is_org_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select u.role in ('owner', 'admin')
      from public.users u
      where u.id = auth.uid() and u.is_active = true
      limit 1
    ),
    false
  );
$$;

create or replace function public.tg_audit_fields()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    new.created_at := coalesce(new.created_at, timezone('utc', now()));
    new.updated_at := coalesce(new.updated_at, timezone('utc', now()));
    new.version := coalesce(new.version, 1);
    new.created_by := coalesce(new.created_by, auth.uid());
    new.updated_by := coalesce(new.updated_by, new.created_by, auth.uid());
  else
    new.updated_at := timezone('utc', now());
    new.version := coalesce(old.version, 1) + 1;
    new.updated_by := coalesce(new.updated_by, auth.uid(), old.updated_by);
  end if;
  return new;
end;
$$;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  settings jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  version integer not null default 1
);

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete restrict,
  email text not null,
  full_name text,
  role text not null default 'member' check (role in ('owner', 'admin', 'manager', 'member', 'viewer')),
  profile jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  version integer not null default 1,
  unique(org_id, email)
);

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  code text not null,
  name text not null,
  description text,
  config jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  version integer not null default 1,
  unique(org_id, code)
);

create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  module_id uuid not null references public.modules(id) on delete cascade,
  name text not null,
  schema jsonb not null default '{}'::jsonb,
  question_flow jsonb not null default '[]'::jsonb,
  is_default boolean not null default false,
  is_active boolean not null default true,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  version integer not null default 1,
  unique(org_id, module_id, name)
);

create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  module_id uuid not null references public.modules(id) on delete restrict,
  user_id uuid not null references public.users(id) on delete restrict,
  thread_id text not null,
  title text,
  status public.chat_session_status not null default 'open',
  context jsonb not null default '{}'::jsonb,
  last_message_at timestamptz,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  version integer not null default 1,
  unique(org_id, thread_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  sender_id uuid references public.users(id) on delete set null,
  role public.chat_role not null,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  token_usage jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  version integer not null default 1
);
create table if not exists public.extracted_data (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  module_id uuid not null references public.modules(id) on delete restrict,
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  message_id uuid not null references public.messages(id) on delete cascade,
  extractor_provider text not null,
  model_name text not null,
  payload jsonb not null default '{}'::jsonb,
  completeness_score numeric(5,2) not null default 0.00,
  missing_fields text[] not null default '{}',
  validation_errors jsonb not null default '[]'::jsonb,
  status public.extraction_status not null default 'partial',
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  version integer not null default 1
);

create table if not exists public.data_records (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  module_id uuid not null references public.modules(id) on delete restrict,
  source_session_id uuid references public.chat_sessions(id) on delete set null,
  source_extraction_id uuid references public.extracted_data(id) on delete set null,
  record_type text not null,
  title text not null,
  normalized_key text,
  source_channel text not null default 'chat',
  status public.record_status not null default 'draft',
  effective_at timestamptz not null default timezone('utc', now()),
  data jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  version integer not null default 1
);

create table if not exists public.workflow_rules (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  module_id uuid not null references public.modules(id) on delete cascade,
  name text not null,
  trigger_event text not null,
  condition jsonb not null default '{}'::jsonb,
  action jsonb not null default '{}'::jsonb,
  priority integer not null default 100,
  is_active boolean not null default true,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  version integer not null default 1
);

create table if not exists public.workflow_instances (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  module_id uuid not null references public.modules(id) on delete cascade,
  data_record_id uuid not null references public.data_records(id) on delete cascade,
  rule_id uuid references public.workflow_rules(id) on delete set null,
  state public.workflow_state not null default 'pending',
  current_step text not null default 'created',
  assigned_to uuid references public.users(id) on delete set null,
  due_at timestamptz,
  payload jsonb not null default '{}'::jsonb,
  history jsonb not null default '[]'::jsonb,
  last_transition_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  version integer not null default 1
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  module_id uuid references public.modules(id) on delete set null,
  report_type public.report_type not null,
  title text not null,
  status text not null default 'generated' check (status in ('generated', 'failed', 'queued')),
  version_label text not null default 'v1',
  filters jsonb not null default '{}'::jsonb,
  data_snapshot jsonb not null default '{}'::jsonb,
  storage_path text,
  generated_at timestamptz not null default timezone('utc', now()),
  generated_by uuid references auth.users(id),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  version integer not null default 1
);

create table if not exists public.integrations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  module_id uuid references public.modules(id) on delete set null,
  name text not null,
  integration_type public.integration_type not null,
  config jsonb not null default '{}'::jsonb,
  secret_ref text,
  is_active boolean not null default true,
  last_synced_at timestamptz,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  version integer not null default 1
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  workflow_instance_id uuid references public.workflow_instances(id) on delete set null,
  channel public.notification_channel not null default 'in_app',
  status public.notification_status not null default 'pending',
  title text not null,
  body text not null,
  metadata jsonb not null default '{}'::jsonb,
  sent_at timestamptz,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  version integer not null default 1
);

create table if not exists public.workflow_events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  module_id uuid not null references public.modules(id) on delete cascade,
  data_record_id uuid references public.data_records(id) on delete cascade,
  extraction_id uuid references public.extracted_data(id) on delete set null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  version integer not null default 1
);
create index if not exists idx_users_org on public.users(org_id);
create index if not exists idx_modules_org on public.modules(org_id);
create index if not exists idx_templates_org_module on public.templates(org_id, module_id);
create index if not exists idx_sessions_org_user on public.chat_sessions(org_id, user_id, created_at desc);
create index if not exists idx_sessions_thread on public.chat_sessions(org_id, thread_id);
create index if not exists idx_messages_session_created on public.messages(session_id, created_at asc);
create index if not exists idx_messages_org_created on public.messages(org_id, created_at desc);
create index if not exists idx_extracted_org_module on public.extracted_data(org_id, module_id, created_at desc);
create index if not exists idx_extracted_payload_gin on public.extracted_data using gin(payload);
create index if not exists idx_records_org_module on public.data_records(org_id, module_id, created_at desc);
create index if not exists idx_records_data_gin on public.data_records using gin(data);
create unique index if not exists idx_records_normalized_key
  on public.data_records(org_id, module_id, normalized_key)
  where normalized_key is not null;
create index if not exists idx_workflow_rules_event on public.workflow_rules(org_id, module_id, trigger_event, is_active);
create index if not exists idx_workflow_instances_record on public.workflow_instances(org_id, data_record_id, state);
create index if not exists idx_reports_org_type on public.reports(org_id, report_type, generated_at desc);
create index if not exists idx_integrations_org on public.integrations(org_id, integration_type, is_active);
create index if not exists idx_notifications_org_user on public.notifications(org_id, user_id, status);
create index if not exists idx_workflow_events_pending on public.workflow_events(org_id, event_type, processed_at);

drop trigger if exists trg_audit_organizations on public.organizations;
create trigger trg_audit_organizations before insert or update on public.organizations
for each row execute function public.tg_audit_fields();

drop trigger if exists trg_audit_users on public.users;
create trigger trg_audit_users before insert or update on public.users
for each row execute function public.tg_audit_fields();

drop trigger if exists trg_audit_modules on public.modules;
create trigger trg_audit_modules before insert or update on public.modules
for each row execute function public.tg_audit_fields();

drop trigger if exists trg_audit_templates on public.templates;
create trigger trg_audit_templates before insert or update on public.templates
for each row execute function public.tg_audit_fields();

drop trigger if exists trg_audit_chat_sessions on public.chat_sessions;
create trigger trg_audit_chat_sessions before insert or update on public.chat_sessions
for each row execute function public.tg_audit_fields();

drop trigger if exists trg_audit_messages on public.messages;
create trigger trg_audit_messages before insert or update on public.messages
for each row execute function public.tg_audit_fields();

drop trigger if exists trg_audit_extracted_data on public.extracted_data;
create trigger trg_audit_extracted_data before insert or update on public.extracted_data
for each row execute function public.tg_audit_fields();

drop trigger if exists trg_audit_data_records on public.data_records;
create trigger trg_audit_data_records before insert or update on public.data_records
for each row execute function public.tg_audit_fields();

drop trigger if exists trg_audit_workflow_rules on public.workflow_rules;
create trigger trg_audit_workflow_rules before insert or update on public.workflow_rules
for each row execute function public.tg_audit_fields();

drop trigger if exists trg_audit_workflow_instances on public.workflow_instances;
create trigger trg_audit_workflow_instances before insert or update on public.workflow_instances
for each row execute function public.tg_audit_fields();

drop trigger if exists trg_audit_reports on public.reports;
create trigger trg_audit_reports before insert or update on public.reports
for each row execute function public.tg_audit_fields();

drop trigger if exists trg_audit_integrations on public.integrations;
create trigger trg_audit_integrations before insert or update on public.integrations
for each row execute function public.tg_audit_fields();

drop trigger if exists trg_audit_notifications on public.notifications;
create trigger trg_audit_notifications before insert or update on public.notifications
for each row execute function public.tg_audit_fields();

drop trigger if exists trg_audit_workflow_events on public.workflow_events;
create trigger trg_audit_workflow_events before insert or update on public.workflow_events
for each row execute function public.tg_audit_fields();

create or replace function public.tg_extracted_data_event()
returns trigger
language plpgsql
as $$
declare
  record_id uuid;
begin
  if new.status = 'completed' then
    select dr.id
      into record_id
    from public.data_records dr
    where dr.source_extraction_id = new.id
    limit 1;

    insert into public.workflow_events (
      org_id,
      module_id,
      data_record_id,
      extraction_id,
      event_type,
      payload
    )
    values (
      new.org_id,
      new.module_id,
      record_id,
      new.id,
      'extraction.completed',
      jsonb_build_object('extracted_data_id', new.id, 'session_id', new.session_id)
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_extracted_data_event on public.extracted_data;
create trigger trg_extracted_data_event
after insert or update of status on public.extracted_data
for each row
when (new.status = 'completed')
execute function public.tg_extracted_data_event();

create or replace function public.tg_touch_chat_session_last_message()
returns trigger
language plpgsql
as $$
begin
  update public.chat_sessions
    set last_message_at = new.created_at
  where id = new.session_id;
  return new;
end;
$$;

drop trigger if exists trg_touch_chat_session_last_message on public.messages;
create trigger trg_touch_chat_session_last_message
after insert on public.messages
for each row
execute function public.tg_touch_chat_session_last_message();
create or replace view public.v_esg_summary as
select
  dr.org_id,
  dr.module_id,
  date_trunc('month', dr.effective_at) as month_bucket,
  count(*) as total_records,
  avg(nullif((dr.data ->> 'energy_kwh'), '')::numeric) as avg_energy_kwh,
  avg(nullif((dr.data ->> 'emissions_co2e'), '')::numeric) as avg_emissions_co2e
from public.data_records dr
join public.modules m on m.id = dr.module_id
where m.code = 'esg'
group by dr.org_id, dr.module_id, date_trunc('month', dr.effective_at);

create or replace view public.v_operations_dashboard as
select
  dr.org_id,
  dr.module_id,
  count(*) filter (where dr.status = 'final') as finalized_records,
  count(*) filter (where dr.status = 'draft') as draft_records,
  count(*) filter (where (dr.data ->> 'severity') = 'high') as high_severity_records,
  max(dr.created_at) as last_record_at
from public.data_records dr
group by dr.org_id, dr.module_id;

create materialized view if not exists public.mv_module_record_counts as
select
  dr.org_id,
  dr.module_id,
  dr.status,
  count(*) as total_records
from public.data_records dr
group by dr.org_id, dr.module_id, dr.status;

create unique index if not exists idx_mv_module_record_counts_unique
  on public.mv_module_record_counts(org_id, module_id, status);

create or replace function public.refresh_module_record_counts()
returns void
language sql
security definer
set search_path = public
as $$
  refresh materialized view concurrently public.mv_module_record_counts;
$$;

alter table public.organizations enable row level security;
alter table public.users enable row level security;
alter table public.modules enable row level security;
alter table public.templates enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.messages enable row level security;
alter table public.extracted_data enable row level security;
alter table public.data_records enable row level security;
alter table public.workflow_rules enable row level security;
alter table public.workflow_instances enable row level security;
alter table public.reports enable row level security;
alter table public.integrations enable row level security;
alter table public.notifications enable row level security;
alter table public.workflow_events enable row level security;

drop policy if exists org_select on public.organizations;
create policy org_select on public.organizations
for select using (id = public.current_org_id());

drop policy if exists org_update_admin on public.organizations;
create policy org_update_admin on public.organizations
for update using (id = public.current_org_id() and public.is_org_admin())
with check (id = public.current_org_id() and public.is_org_admin());

drop policy if exists users_select on public.users;
create policy users_select on public.users
for select using (org_id = public.current_org_id());

drop policy if exists users_insert_admin on public.users;
create policy users_insert_admin on public.users
for insert with check (org_id = public.current_org_id() and public.is_org_admin());

drop policy if exists users_update_self_or_admin on public.users;
create policy users_update_self_or_admin on public.users
for update using (
  org_id = public.current_org_id()
  and (id = auth.uid() or public.is_org_admin())
)
with check (
  org_id = public.current_org_id()
  and (id = auth.uid() or public.is_org_admin())
);

drop policy if exists modules_org_access on public.modules;
create policy modules_org_access on public.modules
for all using (org_id = public.current_org_id())
with check (org_id = public.current_org_id());

drop policy if exists templates_org_access on public.templates;
create policy templates_org_access on public.templates
for all using (org_id = public.current_org_id())
with check (org_id = public.current_org_id());

drop policy if exists sessions_org_access on public.chat_sessions;
create policy sessions_org_access on public.chat_sessions
for all using (org_id = public.current_org_id())
with check (org_id = public.current_org_id());

drop policy if exists messages_org_access on public.messages;
create policy messages_org_access on public.messages
for all using (org_id = public.current_org_id())
with check (org_id = public.current_org_id());

drop policy if exists extracted_org_access on public.extracted_data;
create policy extracted_org_access on public.extracted_data
for all using (org_id = public.current_org_id())
with check (org_id = public.current_org_id());

drop policy if exists records_org_access on public.data_records;
create policy records_org_access on public.data_records
for all using (org_id = public.current_org_id())
with check (org_id = public.current_org_id());

drop policy if exists workflow_rules_org_access on public.workflow_rules;
create policy workflow_rules_org_access on public.workflow_rules
for all using (org_id = public.current_org_id())
with check (org_id = public.current_org_id());

drop policy if exists workflow_instances_org_access on public.workflow_instances;
create policy workflow_instances_org_access on public.workflow_instances
for all using (org_id = public.current_org_id())
with check (org_id = public.current_org_id());

drop policy if exists reports_org_access on public.reports;
create policy reports_org_access on public.reports
for all using (org_id = public.current_org_id())
with check (org_id = public.current_org_id());

drop policy if exists integrations_org_access on public.integrations;
create policy integrations_org_access on public.integrations
for all using (org_id = public.current_org_id())
with check (org_id = public.current_org_id());

drop policy if exists notifications_org_access on public.notifications;
create policy notifications_org_access on public.notifications
for all using (org_id = public.current_org_id())
with check (org_id = public.current_org_id());

drop policy if exists workflow_events_org_access on public.workflow_events;
create policy workflow_events_org_access on public.workflow_events
for all using (org_id = public.current_org_id())
with check (org_id = public.current_org_id());

grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;



create table if not exists public.ai_failures (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  session_id uuid references public.chat_sessions(id) on delete set null,
  module_id uuid references public.modules(id) on delete set null,
  user_id uuid references public.users(id) on delete set null,
  provider text not null,
  model_name text not null,
  error_code text not null,
  error_message text not null,
  attempts integer not null default 1,
  raw_error jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  version integer not null default 1
);

create index if not exists idx_ai_failures_org_created on public.ai_failures(org_id, created_at desc);
create index if not exists idx_ai_failures_code on public.ai_failures(org_id, error_code, created_at desc);

drop trigger if exists trg_audit_ai_failures on public.ai_failures;
create trigger trg_audit_ai_failures before insert or update on public.ai_failures
for each row execute function public.tg_audit_fields();

alter table public.ai_failures enable row level security;

drop policy if exists ai_failures_org_access on public.ai_failures;
create policy ai_failures_org_access on public.ai_failures
for all using (org_id = public.current_org_id())
with check (org_id = public.current_org_id());

grant select, insert, update, delete on public.ai_failures to authenticated;
