alter table if exists public.notifications
  add column if not exists scheduled_at timestamptz;

alter table if exists public.notifications
  alter column scheduled_at set default timezone('utc', now());

update public.notifications
set scheduled_at = timezone('utc', now())
where scheduled_at is null;

alter table if exists public.notifications
  alter column scheduled_at set not null;

alter table if exists public.notifications
  add column if not exists retry_count integer not null default 0;

alter table if exists public.notifications
  add column if not exists last_error text;

create index if not exists idx_notifications_pending_schedule
  on public.notifications(status, scheduled_at, created_at);

