import { z } from "zod";

const IntegrationTypeSchema = z.enum([
  "excel",
  "api",
  "webhook",
  "iot",
  "whatsapp_baileys",
  "whatsapp_official",
  "email",
  "slack",
  "msteams",
  "web_widget",
  "mobile_sdk",
  "sms",
  "voice_ivr",
  "iot_mqtt",
  "erp_crm",
  "api_partner",
]);

export const UpsertModuleSchema = z.object({
  code: z.string().min(2).max(50),
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  config: z.record(z.string(), z.unknown()).default({}),
  is_active: z.boolean().default(true)
});

export const UpsertTemplateSchema = z.object({
  module_id: z.string().uuid(),
  name: z.string().min(2).max(120),
  schema: z.record(z.string(), z.unknown()).default({}),
  question_flow: z.array(z.record(z.string(), z.unknown())).default([]),
  is_default: z.boolean().default(false),
  is_active: z.boolean().default(true)
});

export const UpsertWorkflowRuleSchema = z.object({
  module_id: z.string().uuid(),
  name: z.string().min(2).max(120),
  trigger_event: z.string().min(2).max(80),
  condition: z.record(z.string(), z.unknown()).default({}),
  action: z.record(z.string(), z.unknown()).default({}),
  priority: z.number().int().min(1).max(1000).default(100),
  is_active: z.boolean().default(true)
});

export const UpsertIntegrationSchema = z.object({
  module_id: z.string().uuid().optional().nullable(),
  name: z.string().min(2).max(120),
  integration_type: IntegrationTypeSchema,
  config: z.record(z.string(), z.unknown()).default({}),
  secret_ref: z.string().max(255).optional().nullable(),
  is_active: z.boolean().default(true)
});

export const ResourceIdParamSchema = z.object({
  id: z.string().uuid()
});
