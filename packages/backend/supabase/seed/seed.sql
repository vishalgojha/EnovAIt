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
  false
),
(
  '33333333-3333-3333-3333-333333333332',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222221',
  'SFIL ESG Annual Report Intake (Food-People-Planet-Governance)',
  $$
  {
    "type": "object",
    "title": "SFIL ESG Annual Report Intake v1",
    "x_report_profile": {
      "id": "sfil_esg_annual_v1",
      "company_reference": "Sapphire Foods India Limited",
      "reporting_frameworks": ["BRSR", "GRI", "SASB", "DJSI"],
      "section_order": ["ceo_message", "about_report", "food", "people", "planet", "governance", "appendix"],
      "extraction_rules": [
        "Capture KPI values exactly with unit context.",
        "Keep unknown values in missing_fields instead of guessing.",
        "Preserve section-wise nesting in extracted_fields."
      ]
    },
    "properties": {
      "report_meta": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "organization_name": { "type": "string" },
          "reporting_period_start": { "type": "string" },
          "reporting_period_end": { "type": "string" },
          "report_edition": { "type": "string" },
          "frameworks": { "type": "array", "items": { "type": "string" } }
        },
        "required": ["organization_name", "reporting_period_start", "reporting_period_end", "frameworks"]
      },
      "esg_highlights": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "scope1_emissions_mtco2e": { "type": "number" },
          "scope2_emissions_mtco2e": { "type": "number" },
          "ghg_intensity_mtco2e_per_restaurant": { "type": "number" },
          "restaurants_total": { "type": "number" },
          "food_safety_training_coverage_percent": { "type": "number" },
          "code_of_conduct_training_coverage_percent": { "type": "number" },
          "used_cooking_oil_recycled_percent": { "type": "number" },
          "eco_friendly_packaging_percent": { "type": "number" },
          "rooftop_solar_restaurants_count": { "type": "number" },
          "renewable_energy_contribution_percent": { "type": "number" },
          "women_directors_count": { "type": "number" },
          "board_directors_total": { "type": "number" },
          "employee_engagement_percentile": { "type": "number" },
          "data_privacy_breach_count": { "type": "number" }
        }
      },
      "food": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "strategy_summary": { "type": "string" },
          "food_safety_audit_coverage_percent": { "type": "number" },
          "traceability_coverage_percent": { "type": "number" },
          "responsible_supply_chain_notes": { "type": "string" }
        },
        "required": ["strategy_summary"]
      },
      "people": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "strategy_summary": { "type": "string" },
          "new_jobs_created": { "type": "number" },
          "female_workforce_percent": { "type": "number" },
          "training_programmes_summary": { "type": "string" },
          "health_safety_summary": { "type": "string" }
        },
        "required": ["strategy_summary"]
      },
      "planet": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "strategy_summary": { "type": "string" },
          "waste_generated_mt": { "type": "number" },
          "waste_intensity_t_per_restaurant": { "type": "number" },
          "plastic_reduction_summary": { "type": "string" },
          "biodiversity_deforestation_summary": { "type": "string" }
        },
        "required": ["strategy_summary"]
      },
      "governance": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "board_oversight_summary": { "type": "string" },
          "esg_committee_summary": { "type": "string" },
          "compliance_management_summary": { "type": "string" },
          "whistleblower_summary": { "type": "string" },
          "ethics_training_coverage_percent": { "type": "number" }
        },
        "required": ["board_oversight_summary", "compliance_management_summary"]
      },
      "framework_alignment": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "brsr_summary": { "type": "string" },
          "gri_summary": { "type": "string" },
          "sasb_summary": { "type": "string" },
          "assurance_statement_summary": { "type": "string" }
        },
        "required": ["brsr_summary", "gri_summary", "sasb_summary"]
      }
    },
    "required": [
      "report_meta",
      "esg_highlights",
      "food",
      "people",
      "planet",
      "governance",
      "framework_alignment"
    ]
  }
  $$::jsonb,
  $$
  [
    { "id": "report_meta.organization_name", "question": "Which organization does this ESG report belong to?" },
    { "id": "report_meta.reporting_period_start", "question": "What is the reporting period start date?" },
    { "id": "report_meta.reporting_period_end", "question": "What is the reporting period end date?" },
    { "id": "report_meta.frameworks", "question": "Which reporting frameworks are used (for example BRSR, GRI, SASB)?" },
    { "id": "esg_highlights.scope1_emissions_mtco2e", "question": "What is Scope 1 emissions in MtCO2e?" },
    { "id": "esg_highlights.scope2_emissions_mtco2e", "question": "What is Scope 2 emissions in MtCO2e?" },
    { "id": "esg_highlights.ghg_intensity_mtco2e_per_restaurant", "question": "What is GHG emission intensity per restaurant?" },
    { "id": "esg_highlights.food_safety_training_coverage_percent", "question": "What percentage of employees were trained on food safety and quality?" },
    { "id": "esg_highlights.code_of_conduct_training_coverage_percent", "question": "What percentage of employees were trained on code of conduct?" },
    { "id": "esg_highlights.used_cooking_oil_recycled_percent", "question": "What percentage of used cooking oil was recycled?" },
    { "id": "food.strategy_summary", "question": "Summarize key Food pillar initiatives and outcomes." },
    { "id": "people.strategy_summary", "question": "Summarize key People pillar initiatives and outcomes." },
    { "id": "planet.strategy_summary", "question": "Summarize key Planet pillar initiatives and outcomes." },
    { "id": "governance.board_oversight_summary", "question": "How is board and committee oversight for ESG structured?" },
    { "id": "governance.compliance_management_summary", "question": "Summarize compliance, ethics, and whistleblower governance practices." },
    { "id": "framework_alignment.brsr_summary", "question": "How does the report align with the BRSR framework?" },
    { "id": "framework_alignment.gri_summary", "question": "How does the report align with GRI disclosures?" },
    { "id": "framework_alignment.sasb_summary", "question": "How does the report align with SASB disclosures?" },
    { "id": "framework_alignment.assurance_statement_summary", "question": "What does the assurance statement cover?" }
  ]
  $$::jsonb,
  true
)
on conflict (id) do update
set name = excluded.name,
    schema = excluded.schema,
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


insert into public.integrations (id, org_id, module_id, name, integration_type, config, is_active)
values
(
  '66666666-6666-6666-6666-666666666661',
  '11111111-1111-1111-1111-111111111111',
  null,
  'WhatsApp Official Demo',
  'whatsapp_official',
  '{"channel":"official","api_version":"v22.0"}'::jsonb,
  true
),
(
  '66666666-6666-6666-6666-666666666662',
  '11111111-1111-1111-1111-111111111111',
  null,
  'WhatsApp Baileys Demo',
  'whatsapp_baileys',
  '{"channel":"baileys","session_path":".baileys_auth"}'::jsonb,
  true
)
on conflict (id) do update
set name = excluded.name,
    integration_type = excluded.integration_type,
    config = excluded.config,
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


