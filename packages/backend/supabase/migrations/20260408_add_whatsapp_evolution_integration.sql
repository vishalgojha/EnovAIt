do $$
begin
  if not exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'integration_type'
      and e.enumlabel = 'whatsapp_evolution'
  ) then
    alter type public.integration_type add value 'whatsapp_evolution';
  end if;
end $$;
