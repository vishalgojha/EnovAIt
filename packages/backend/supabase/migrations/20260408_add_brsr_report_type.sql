do $$
begin
  if exists (select 1 from pg_type where typname = 'report_type') then
    begin
      alter type public.report_type add value if not exists 'brsr_annual_report';
    exception
      when duplicate_object then null;
    end;
  end if;
end $$;

create or replace view public.v_brsr_readiness as
select
  dr.org_id,
  dr.module_id,
  count(*) as total_records,
  count(*) filter (where dr.record_type = 'brsr_section_a_general_disclosure') as section_a_records,
  count(*) filter (where dr.record_type = 'brsr_section_b_management_disclosure') as section_b_records,
  count(*) filter (where dr.record_type like 'brsr_principle_%') as principle_records,
  count(*) filter (where dr.record_type = 'brsr_material_issue') as material_issue_records,
  array_agg(distinct dr.source_channel) as source_channels,
  max(dr.effective_at) as latest_effective_at
from public.data_records dr
join public.modules m on m.id = dr.module_id
where m.code in ('brsr', 'esg')
group by dr.org_id, dr.module_id;
