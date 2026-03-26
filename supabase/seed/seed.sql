-- Demo seed data for EnovAIt
-- Note: create a matching auth user in Supabase Auth first, then update demo_user_id if needed.

begin;

insert into public.organizations (id, name, slug, settings)
values (
  '11111111-1111-1111-1111-111111111111',
  'EnovAIt Demo Org',
  'enovait-demo',
  '{"timezone":"Asia/Kolkata","default_ai_provider":"openai"}'::jsonb
)
on conflict (id) do update
set name = excluded.name,
    slug = excluded.slug,
    settings = excluded.settings;

insert into public.modules (id, org_id, code, name, description, config)
values
(
  '22222222-2222-2222-2222-222222222221',
  '11111111-1111-1111-1111-111111111111',
  'esg',
  'ESG',
  'Environmental, social, and governance data collection',
  '{"required_fields":["facility_name","period_start","period_end","energy_kwh","emissions_co2e"]}'::jsonb
),
(
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'maintenance',
  'Maintenance',
  'Maintenance logs and severity tracking',
  '{"required_fields":["asset_id","issue_type","severity","reported_at"]}'::jsonb
)
on conflict (id) do update
set name = excluded.name,
    description = excluded.description,
    config = excluded.config;

insert into public.templates (id, org_id, module_id, name, schema, question_flow, is_default)
values
(
  '33333333-3333-3333-3333-333333333331',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222221',
  'ESG Monthly Intake',
  '{"type":"object","properties":{"facility_name":{"type":"string"},"period_start":{"type":"string"},"period_end":{"type":"string"},"energy_kwh":{"type":"number"},"emissions_co2e":{"type":"number"},"notes":{"type":"string"}},"required":["facility_name","period_start","period_end","energy_kwh","emissions_co2e"]}'::jsonb,
  '[{"id":"facility_name","question":"Which facility is this for?"},{"id":"period_start","question":"What is the period start date?"},{"id":"period_end","question":"What is the period end date?"},{"id":"energy_kwh","question":"What was total energy usage in kWh?"},{"id":"emissions_co2e","question":"What was total emissions in CO2e?"}]'::jsonb,
  true
)
on conflict (id) do update
set schema = excluded.schema,
    question_flow = excluded.question_flow,
    is_default = excluded.is_default;

insert into public.workflow_rules (id, org_id, module_id, name, trigger_event, condition, action, priority, is_active)
values
(
  '44444444-4444-4444-4444-444444444441',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'High Severity Approval',
  'record.completed',
  '{"path":"severity","operator":"eq","value":"high"}'::jsonb,
  '{"type":"create_workflow_instance","state":"pending","step":"manager_approval","notify":["in_app"]}'::jsonb,
  10,
  true
)
on conflict (id) do update
set condition = excluded.condition,
    action = excluded.action,
    priority = excluded.priority,
    is_active = excluded.is_active;

-- Optional app user row if auth user exists.
do $$
declare
  demo_user_id uuid := '55555555-5555-5555-5555-555555555555';
begin
  if exists (select 1 from auth.users where id = demo_user_id) then
    insert into public.users (id, org_id, email, full_name, role, is_active)
    values (
      demo_user_id,
      '11111111-1111-1111-1111-111111111111',
      'demo@enovait.local',
      'Demo Admin',
      'admin',
      true
    )
    on conflict (id) do update
    set org_id = excluded.org_id,
        email = excluded.email,
        full_name = excluded.full_name,
        role = excluded.role,
        is_active = excluded.is_active;
  end if;
end $$;

commit;
