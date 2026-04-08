do $$
declare
  users_role_constraint text;
begin
  select c.conname
    into users_role_constraint
  from pg_constraint c
  join pg_class t on t.oid = c.conrelid
  join pg_namespace n on n.oid = t.relnamespace
  where n.nspname = 'public'
    and t.relname = 'users'
    and c.contype = 'c'
    and pg_get_constraintdef(c.oid) like '%owner%'
    and pg_get_constraintdef(c.oid) like '%viewer%';

  if users_role_constraint is not null then
    execute format('alter table public.users drop constraint %I', users_role_constraint);
  end if;
end $$;

alter table public.users
  add constraint users_role_check
  check (role in ('super_admin', 'owner', 'admin', 'manager', 'member', 'viewer'));

create or replace function public.is_org_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select u.role in ('super_admin', 'owner', 'admin')
      from public.users u
      where u.id = auth.uid() and u.is_active = true
      limit 1
    ),
    false
  );
$$;
