export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  settings: Record<string, any>;
}

export interface User {
  id: string;
  email: string;
  role: 'super_admin' | 'owner' | 'admin' | 'manager' | 'member' | 'viewer';
  name: string;
}

export interface Module {
  id: string;
  code: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  config: Record<string, unknown>;
}

export interface Template {
  id: string;
  module_id: string;
  name: string;
  schema: Record<string, unknown>;
  question_flow: Array<Record<string, unknown>>;
  is_default: boolean;
  is_active: boolean;
}

export interface WorkflowRule {
  id: string;
  module_id: string;
  name: string;
  trigger_event: string;
  condition: Record<string, unknown>;
  action: Record<string, unknown>;
  priority: number;
  is_active: boolean;
}

export type IntegrationType = 
  | 'whatsapp_official' 
  | 'whatsapp_evolution'
  | 'whatsapp_baileys' 
  | 'email' 
  | 'slack' 
  | 'msteams' 
  | 'sms' 
  | 'voice_ivr' 
  | 'iot_mqtt' 
  | 'erp_crm' 
  | 'api_partner' 
  | 'archon'
  | 'web_widget' 
  | 'mobile_sdk';

export interface ArchonStatus {
  configured: boolean;
  reachable: boolean;
  baseUrl?: string;
  version?: string;
  gitSha?: string | null;
  detail: string;
}

export interface ArchonTaskResult {
  task_id: string;
  goal: string;
  mode: 'debate';
  final_answer: string;
  confidence: number;
  budget: Record<string, unknown>;
  debate?: Record<string, unknown> | null;
}

export interface Integration {
  id: string;
  type: IntegrationType;
  name: string;
  status: 'active' | 'inactive' | 'error';
  config: Record<string, any>;
  lastSync?: string;
}

export interface DataRecord {
  id: string;
  module_id: string;
  record_type: string;
  title?: string;
  status: 'draft' | 'final' | 'superseded';
  data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface WorkflowInstance {
  id: string;
  rule_id?: string;
  state: 'pending' | 'approved' | 'rejected' | 'escalated' | 'completed';
  current_step?: string;
  payload: Record<string, unknown>;
  history: Array<{
    at: string;
    by: string;
    transition: string;
    comment?: string;
  }>;
  created_at: string;
  last_transition_at: string;
}

export interface Report {
  id: string;
  report_type: 'esg_summary' | 'brsr_annual_report' | 'operations_dashboard' | 'compliance_checklist' | 'custom';
  title: string;
  status: string;
  generated_at: string;
}
