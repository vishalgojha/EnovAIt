create table if not exists public.whatsapp_sessions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.organizations(id) on delete cascade,
  label text not null,
  owner_name text,
  phone_number text,
  status text not null check (status in ('connecting', 'connected', 'disconnected')),
  last_sync timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  version integer not null default 1,
  unique(tenant_id, label)
);

create table if not exists public.whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.organizations(id) on delete cascade,
  label text not null,
  remote_jid text not null,
  text text not null,
  sender text,
  timestamp timestamptz not null default timezone('utc', now()),
  from_me boolean not null default false,
  raw_message jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  version integer not null default 1
);

create index if not exists idx_whatsapp_sessions_tenant_status
  on public.whatsapp_sessions(tenant_id, status, last_sync desc);

create index if not exists idx_whatsapp_messages_tenant_created
  on public.whatsapp_messages(tenant_id, created_at desc);

create index if not exists idx_whatsapp_messages_raw_gin
  on public.whatsapp_messages using gin(raw_message);

drop trigger if exists trg_audit_whatsapp_sessions on public.whatsapp_sessions;
create trigger trg_audit_whatsapp_sessions before insert or update on public.whatsapp_sessions
for each row execute function public.tg_audit_fields();

drop trigger if exists trg_audit_whatsapp_messages on public.whatsapp_messages;
create trigger trg_audit_whatsapp_messages before insert or update on public.whatsapp_messages
for each row execute function public.tg_audit_fields();

alter table public.whatsapp_sessions enable row level security;
alter table public.whatsapp_messages enable row level security;

drop policy if exists whatsapp_sessions_org_access on public.whatsapp_sessions;
create policy whatsapp_sessions_org_access on public.whatsapp_sessions
for all using (tenant_id = public.current_org_id())
with check (tenant_id = public.current_org_id());

drop policy if exists whatsapp_messages_org_access on public.whatsapp_messages;
create policy whatsapp_messages_org_access on public.whatsapp_messages
for all using (tenant_id = public.current_org_id())
with check (tenant_id = public.current_org_id());

grant select, insert, update, delete on public.whatsapp_sessions to authenticated;
grant select, insert, update, delete on public.whatsapp_messages to authenticated;
