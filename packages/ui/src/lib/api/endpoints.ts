import { api, apiClient } from './client';
import { 
  Module, 
  Template, 
  WorkflowRule, 
  Integration, 
  DataRecord, 
  WorkflowInstance, 
  Report,
  ArchonStatus,
  ArchonTaskResult,
  User,
  Tenant
} from '../../types';

interface ApiEnvelope<T> {
  data: T;
}

interface PlatformSummary {
  activeIntegrations: number;
  pendingApprovals: number;
  failedNotifications: number;
}

interface PlatformLogItem {
  id: string;
  source: string;
  kind: 'workflow_event' | 'notification';
  title: string;
  detail: string;
  status: string;
  at: string;
}

interface PlatformApprovalItem {
  id: string;
  state: 'pending' | 'approved' | 'rejected' | 'escalated' | 'completed';
  title: string;
  summary: string;
  assignedTo: string | null;
  dataRecordId: string | null;
  updatedAt: string;
}

interface SecretsEnvironmentStatus {
  path: string;
  required: Record<'SUPABASE_URL' | 'SUPABASE_ANON_KEY' | 'SUPABASE_SERVICE_ROLE_KEY' | 'SUPABASE_JWT_SECRET', boolean>;
  aiProvider: string | null;
  aiKeys: {
    anthropic: boolean;
    openrouter: boolean;
    openaiCompatible: boolean;
  };
}

interface SecretsEnvironmentUpdate {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  SUPABASE_JWT_SECRET: string;
  AI_PROVIDER?: 'anthropic' | 'openrouter' | 'openai_compatible';
  ANTHROPIC_API_KEY?: string;
  OPENROUTER_API_KEY?: string;
  OPENAI_BASE_URL?: string;
  OPENAI_API_KEY?: string;
}

interface RawModule {
  id: string;
  code: string;
  name: string;
  description?: string;
  config: Record<string, unknown>;
  is_active: boolean;
}

interface AuthResult {
  token: string;
  user: User;
  tenant: Tenant;
}

interface DataRecordListEnvelope {
  data: DataRecord[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

interface WorkflowListEnvelope {
  data: WorkflowInstance[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

interface ReportListEnvelope {
  data: Report[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

interface RawIntegration {
  id: string;
  integration_type: Integration["type"];
  name: string;
  config: Record<string, unknown>;
  is_active: boolean;
  updated_at?: string;
}

interface ChannelStatusResponse {
  channel: string;
  configured: boolean;
  healthy: boolean;
  detail: string;
}

interface ChannelSendResponse {
  channel: string;
  accepted: boolean;
  external_id: string | null;
  detail: string;
  sent_by: string;
  sent_at: string;
}

interface ArchonTaskRequest {
  goal: string;
  language?: string;
  context?: Record<string, unknown>;
}

interface IngestionResult {
  file_name: string;
  mime_type: string;
  kind: 'pdf' | 'spreadsheet' | 'text' | 'unknown';
  page_count?: number;
  row_count?: number;
  text_preview: string;
  record_id: string;
  ingestion_event_id: string;
}

export interface DashboardOverview {
  backendHealthy: boolean;
  modulesCount: number;
  templatesCount: number;
  workflowRulesCount: number;
  recordsCount: number;
  chartData: Array<{
    name: string;
    records: number;
  }>;
  recentRecords: Array<{
    id: string;
    name: string;
    status: DataRecord["status"];
    time: string;
  }>;
}

const mapRawModuleToUiModule = (module: RawModule): Module => ({
  id: module.id,
  code: module.code,
  name: module.name,
  description: module.description,
  config: module.config ?? {},
  status: module.is_active ? 'active' : 'inactive',
});

const mapUiModuleToRawPayload = (
  data: Partial<Module> & { is_active?: boolean }
): Partial<RawModule> => {
  const payload: Partial<RawModule> = {};

  if (data.code !== undefined) {
    payload.code = data.code;
  }
  if (data.name !== undefined) {
    payload.name = data.name;
  }
  if (data.description !== undefined) {
    payload.description = data.description;
  }
  if (data.config !== undefined) {
    payload.config = data.config;
  }

  if (data.status !== undefined) {
    payload.is_active = data.status === 'active';
  } else if (data.is_active !== undefined) {
    payload.is_active = data.is_active;
  }

  return payload;
};

const mapRawIntegrationToUiIntegration = (integration: RawIntegration): Integration => ({
  id: integration.id,
  type: integration.integration_type,
  name: integration.name,
  status: integration.is_active ? "active" : "inactive",
  config: integration.config ?? {},
  lastSync: integration.updated_at
});

const mapUiIntegrationToRawPayload = (
  integration: Partial<Integration>
): Partial<RawIntegration> => {
  const payload: Partial<RawIntegration> = {};

  if (integration.type !== undefined) {
    payload.integration_type = integration.type;
  }
  if (integration.name !== undefined) {
    payload.name = integration.name;
  }
  if (integration.config !== undefined) {
    payload.config = integration.config;
  }
  if (integration.status !== undefined) {
    payload.is_active = integration.status === "active";
  }

  return payload;
};

const formatRelativeTime = (iso: string): string => {
  const ts = new Date(iso).getTime();
  if (!Number.isFinite(ts)) {
    return "unknown";
  }

  const diffMs = Date.now() - ts;
  const diffMins = Math.max(1, Math.floor(diffMs / 60000));

  if (diffMins < 60) {
    return `${diffMins} min ago`;
  }

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) {
    return `${diffHours} hr ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
};

const buildRecordsChart = (records: DataRecord[]): Array<{ name: string; records: number }> => {
  const buckets = new Map<string, number>();

  for (const record of records) {
    const date = new Date(record.created_at);
    if (!Number.isFinite(date.getTime())) {
      continue;
    }

    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  const sorted = [...buckets.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-6);

  return sorted.map(([key, count]) => {
    const [year, month] = key.split("-");
    const labelDate = new Date(Date.UTC(Number(year), Number(month) - 1, 1));
    const label = labelDate.toLocaleString("en-US", { month: "short" });
    return { name: label, records: count };
  });
};

export const adminApi = {
  getPlatformSummary: async (): Promise<PlatformSummary> =>
    (await api.get<ApiEnvelope<PlatformSummary>>('/admin/platform/summary')).data,
  getPlatformLogs: async (params?: { limit?: number }): Promise<PlatformLogItem[]> =>
    (await api.get<ApiEnvelope<PlatformLogItem[]>>('/admin/platform/logs', params)).data,
  getPlatformApprovals: async (params?: { limit?: number }): Promise<PlatformApprovalItem[]> =>
    (await api.get<ApiEnvelope<PlatformApprovalItem[]>>('/admin/platform/approvals', params)).data,
  getPlatformSecrets: async (): Promise<SecretsEnvironmentStatus> =>
    (await api.get<ApiEnvelope<SecretsEnvironmentStatus>>('/admin/platform/secrets')).data,
  savePlatformSecrets: async (data: SecretsEnvironmentUpdate): Promise<SecretsEnvironmentStatus & { restartRequired: boolean; message: string }> =>
    (await api.put<ApiEnvelope<SecretsEnvironmentStatus & { restartRequired: boolean; message: string }>>('/admin/platform/secrets', data)).data,

  // Modules
  getModules: async (): Promise<Module[]> => {
    const modules = await api.get<ApiEnvelope<RawModule[]>>('/admin/modules');
    return modules.data.map(mapRawModuleToUiModule);
  },
  createModule: async (data: Partial<Module>): Promise<Module> => {
    const created = await api.post<ApiEnvelope<RawModule>>('/admin/modules', mapUiModuleToRawPayload(data));
    return mapRawModuleToUiModule(created.data);
  },
  updateModule: async (id: string, data: Partial<Module>): Promise<Module> => {
    const updated = await api.put<ApiEnvelope<RawModule>>(`/admin/modules/${id}`, mapUiModuleToRawPayload(data));
    return mapRawModuleToUiModule(updated.data);
  },
  deleteModule: async (id: string) =>
    (await api.put<ApiEnvelope<RawModule>>(`/admin/modules/${id}`, { is_active: false })).data,

  // Templates
  getTemplates: async () => (await api.get<ApiEnvelope<Template[]>>('/admin/templates')).data,
  createTemplate: (data: Partial<Template>) => api.post<Template>('/admin/templates', data),
  updateTemplate: async (id: string, data: Partial<Template>) =>
    (await api.put<ApiEnvelope<Template>>(`/admin/templates/${id}`, data)).data,
  deleteTemplate: async (id: string) =>
    (await api.put<ApiEnvelope<Template>>(`/admin/templates/${id}`, { is_active: false })).data,

  // Workflow Rules
  getWorkflowRules: async () => (await api.get<ApiEnvelope<WorkflowRule[]>>('/admin/workflow-rules')).data,
  createWorkflowRule: (data: Partial<WorkflowRule>) => api.post<WorkflowRule>('/admin/workflow-rules', data),
  updateWorkflowRule: async (id: string, data: Partial<WorkflowRule>) =>
    (await api.put<ApiEnvelope<WorkflowRule>>(`/admin/workflow-rules/${id}`, data)).data,
  deleteWorkflowRule: async (id: string) =>
    (await api.put<ApiEnvelope<WorkflowRule>>(`/admin/workflow-rules/${id}`, { is_active: false })).data,

  // Integrations
  getIntegrations: async (): Promise<Integration[]> => {
    const integrations = await api.get<ApiEnvelope<RawIntegration[]>>('/admin/integrations');
    return integrations.data.map(mapRawIntegrationToUiIntegration);
  },
  createIntegration: async (data: Partial<Integration>): Promise<Integration> => {
    const created = await api.post<ApiEnvelope<RawIntegration>>('/admin/integrations', mapUiIntegrationToRawPayload(data));
    return mapRawIntegrationToUiIntegration(created.data);
  },
  updateIntegration: async (id: string, data: Partial<Integration>): Promise<Integration> => {
    const updated = await api.put<ApiEnvelope<RawIntegration>>(`/admin/integrations/${id}`, mapUiIntegrationToRawPayload(data));
    return mapRawIntegrationToUiIntegration(updated.data);
  },
  deleteIntegration: async (id: string): Promise<Integration> => {
    const updated = await api.put<ApiEnvelope<RawIntegration>>(`/admin/integrations/${id}`, { is_active: false });
    return mapRawIntegrationToUiIntegration(updated.data);
  },

  // Organization Settings
  getSettings: async () =>
    (await api.get<ApiEnvelope<{ id: string; name: string; slug: string; settings: Record<string, unknown> }>>('/admin/settings')).data,
  updateSettings: async (settings: Record<string, unknown>) =>
    (await api.put<ApiEnvelope<{ id: string; name: string; slug: string; settings: Record<string, unknown> }>>('/admin/settings', { settings })).data,
};

export const authApi = {
  signIn: async (payload: { email: string; password: string }): Promise<AuthResult> =>
    (await api.post<ApiEnvelope<AuthResult>>('/public/auth/signin', payload)).data,
  signUp: async (payload: {
    full_name: string;
    company_name: string;
    email: string;
    password: string;
  }): Promise<AuthResult> => (await api.post<ApiEnvelope<AuthResult>>('/public/auth/signup', payload)).data,
};

export const dataApi = {
  getRecords: async (params?: any) => (await api.get<DataRecordListEnvelope>('/data/records', params)).data,
  getRecord: async (id: string) => (await api.get<ApiEnvelope<DataRecord>>(`/data/records/${id}`)).data,
  ingestDocument: async (moduleId: string, file: File): Promise<IngestionResult> => {
    const formData = new FormData();
    formData.append('module_id', moduleId);
    formData.append('file', file);

    return (await apiClient.post<ApiEnvelope<IngestionResult>>('/data/ingest/document', formData)).data;
  },
  ingestExcel: async (moduleId: string, file: File): Promise<IngestionResult> => {
    const formData = new FormData();
    formData.append('module_id', moduleId);
    formData.append('file', file);

    return (await apiClient.post<ApiEnvelope<IngestionResult>>('/data/ingest/excel', formData)).data;
  },
};

export const workflowApi = {
  getInstances: async (params?: { limit?: number; offset?: number; state?: WorkflowInstance["state"] }) =>
    (await api.get<WorkflowListEnvelope>('/workflows/instances', params)).data,
  getInstance: async (id: string) => (await api.get<ApiEnvelope<WorkflowInstance>>(`/workflows/instances/${id}`)).data,
  transition: (id: string, action: string, context?: any) => 
    api.post(`/workflows/instances/${id}/transition`, { state: action, comment: context?.comment }),
};

export const reportApi = {
  getReports: async (params?: { limit?: number; offset?: number; report_type?: Report["report_type"] }) =>
    (await api.get<ReportListEnvelope>('/reports', params)).data,
  generateReport: async (data: any) => (await api.post<ApiEnvelope<Report>>('/reports/generate', data)).data,
  getReport: async (id: string) => (await api.get<ApiEnvelope<Report>>(`/reports/${id}`)).data,
};

export const channelApi = {
  sendMessage: async (data: {
    channel: string;
    to?: string;
    subject?: string;
    message: string;
    metadata?: Record<string, unknown>;
  }): Promise<ChannelSendResponse> =>
    (await api.post<ApiEnvelope<ChannelSendResponse>>('/channels/send', {
      channel: data.channel,
      to: data.to,
      subject: data.subject,
      message: data.message,
      metadata: data.metadata ?? {}
    })).data,
  getStatus: async (channel: string): Promise<ChannelStatusResponse> =>
    (await api.get<ApiEnvelope<ChannelStatusResponse>>(`/channels/status/${channel}`)).data,
};

export const archonApi = {
  getStatus: async (): Promise<ArchonStatus> =>
    (await api.get<ApiEnvelope<ArchonStatus>>('/archon/health')).data,
  runTask: async (payload: ArchonTaskRequest): Promise<ArchonTaskResult> =>
    (await api.post<ApiEnvelope<ArchonTaskResult>>('/archon/tasks', payload)).data,
};

export const brsrReadinessApi = {
  getReadiness: async () =>
    (await api.get<ApiEnvelope<{
      overallScore: number;
      sectionCoverage: Array<{ section: string; label: string; description: string; covered: boolean; evidenceCount: number; latestEvidenceAt: string | null; evidenceKinds: string[] }>;
      totalEvidence: number;
      totalRecords: number;
      sourceChannels: string[];
      lastIngestedAt: string | null;
      readinessLevel: string;
    }>>('/brsr-readiness')).data,
  getSectionDetail: async () =>
    (await api.get<ApiEnvelope<Array<{ section: string; label: string; description: string; coveragePercent: number; evidenceCount: number; evidenceKinds: string[]; records: Array<{ id: string; title: string; recordType: string; sourceChannel: string; createdAt: string; status: string }> }>>>('/brsr-readiness/sections')).data,
  getPrincipleDetail: async () =>
    (await api.get<ApiEnvelope<Array<{ principle: number; title: string; description: string; coveragePercent: number; evidenceCount: number; essentialIndicators: number; leadershipIndicators: number; totalEssentialIndicators: number; totalLeadershipIndicators: number; indicatorsExtracted: string[]; latestEvidenceAt: string | null; records: Array<{ id: string; title: string; recordType: string; sourceChannel: string; createdAt: string; status: string }> }>>>('/brsr-readiness/principles')).data,
  getGaps: async () =>
    (await api.get<ApiEnvelope<{ gaps: Array<{ section: string; label: string; type: string; severity: string; description: string; recommendedAction: string }>; totalGaps: number; criticalGaps: number; recommendedActions: string[] }>>('/brsr-readiness/gaps')).data,
};

export const reviewApi = {
  getReviewQueue: async () =>
    (await api.get<ApiEnvelope<Array<{ id: string; title: string; recordType: string; status: string; sourceChannel: string; createdAt: string; brsrSection: string | null; brsrPrinciples: number[]; confidence: number; needsReview: boolean }>>>('/review/queue')).data,
  getReviewDetail: async (id: string) =>
    (await api.get<ApiEnvelope<{ id: string; title: string; recordType: string; status: string; sourceChannel: string; createdAt: string; updatedAt: string; data: Record<string, unknown>; brsrSection: string | null; brsrPrinciples: number[]; confidence: number; missingFields: string[]; evidenceKinds: string[]; recommendedActions: string[]; workflowHistory: Array<{ at: string; by: string | null; transition: string; comment: string | null }> }>>(`/review/${id}`)).data,
  approve: async (id: string, comment?: string) =>
    (await api.post<ApiEnvelope<{ id: string; status: string; reviewedBy: string; reviewedAt: string; comment: string | null }>>(`/review/${id}/approve`, { comment })).data,
  reject: async (id: string, comment?: string) =>
    (await api.post<ApiEnvelope<{ id: string; status: string; reviewedBy: string; reviewedAt: string; comment: string | null }>>(`/review/${id}/reject`, { comment })).data,
  escalate: async (id: string, comment?: string) =>
    (await api.post<ApiEnvelope<{ id: string; status: string; reviewedBy: string; reviewedAt: string; comment: string | null }>>(`/review/${id}/escalate`, { comment })).data,
};

export const whatsappIntakeApi = {
  sendMessage: async (data: { from: string; message: string }) =>
    (await api.post<ApiEnvelope<{ accepted: boolean; recordId: string; classification: { section: string; principles: number[]; confidence: number; evidenceKinds: string[] } }>>('/whatsapp-intake/message', data)).data,
  sendEvidence: async (data: { from: string; message: string; module_id?: string }) =>
    (await api.post<ApiEnvelope<{ accepted: boolean; recordId: string; title: string; classification: { section: string; principles: number[]; confidence: number; evidenceKinds: string[] } }>>('/whatsapp-intake/evidence', data)).data,
};

export const dashboardApi = {
  getOverview: async (): Promise<DashboardOverview> => {
    const [healthResult, modulesResult, templatesResult, workflowRulesResult, recordsResult] = await Promise.allSettled([
      api.get<{ status: string }>('/health'),
      adminApi.getModules(),
      adminApi.getTemplates(),
      adminApi.getWorkflowRules(),
      dataApi.getRecords({ limit: 200, offset: 0 }),
    ]);

    const backendHealthy = healthResult.status === "fulfilled" && healthResult.value.status === "ok";
    const modules = modulesResult.status === "fulfilled" ? modulesResult.value : [];
    const templates = templatesResult.status === "fulfilled" ? templatesResult.value : [];
    const workflowRules = workflowRulesResult.status === "fulfilled" ? workflowRulesResult.value : [];
    const records = recordsResult.status === "fulfilled" ? recordsResult.value : [];

    const recentRecords = [...records]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map((record) => ({
        id: record.id,
        name: record.title || record.record_type,
        status: record.status,
        time: formatRelativeTime(record.created_at),
      }));

    const chartData = buildRecordsChart(records);

    return {
      backendHealthy,
      modulesCount: modules.length,
      templatesCount: templates.length,
      workflowRulesCount: workflowRules.length,
      recordsCount: records.length,
      chartData,
      recentRecords,
    };
  },
};
