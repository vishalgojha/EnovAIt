-- Add AI failure tracking table for reliability monitoring

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
