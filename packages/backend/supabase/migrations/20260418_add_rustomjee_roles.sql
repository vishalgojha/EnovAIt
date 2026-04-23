do $$
declare
  users_role_constraint text;
begin
  select conname
    into users_role_constraint
  from pg_constraint
  where conrelid = 'public.users'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) like '%role%';

  if users_role_constraint is not null then
    execute format('alter table public.users drop constraint %I', users_role_constraint);
  end if;

  alter table public.users
    add constraint users_role_check
    check (
      role in (
        'super_admin',
        'owner',
        'admin',
        'manager',
        'member',
        'viewer',
        'ceo',
        'c_env_officer',
        'project_ops',
        'hr',
        'finance',
        'accounts_exec'
      )
    );
end $$;
