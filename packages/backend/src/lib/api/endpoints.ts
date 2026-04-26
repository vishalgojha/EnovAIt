import { api } from "./client";
import {
  DataRecord,
  Integration,
  Module,
  Report,
  Template,
  WorkflowInstance,
  WorkflowRule,
} from "../../types";

interface ApiEnvelope<T> {
  data: T;
}

interface ListEnvelope<T> {
  data: T;
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

interface ModuleRecord {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  config?: Record<string, unknown> | null;
  is_active: boolean;
}

interface IntegrationRecord {
  id: string;
  integration_type: Integration["type"];
  name: string;
  config?: Record<string, unknown> | null;
  is_active: boolean;
  updated_at?: string | null;
}

interface DataRecordListEnvelope {
  data: DataRecord[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

function normalizeModule(record: ModuleRecord): Module {
  return {
    id: record.id,
    code: record.code,
    name: record.name,
    description: record.description ?? undefined,
    status: record.is_active ? "active" : "inactive",
    config: record.config ?? {},
  };
}

function serializeModule(data: Partial<Module> & { is_active?: boolean }) {
  const payload: Record<string, unknown> = {};

  if (data.code !== undefined) payload.code = data.code;
  if (data.name !== undefined) payload.name = data.name;
  if (data.description !== undefined) payload.description = data.description;
  if (data.config !== undefined) payload.config = data.config;

  if (data.status !== undefined) {
    payload.is_active = data.status === "active";
  } else if (data.is_active !== undefined) {
    payload.is_active = data.is_active;
  }

  return payload;
}

function normalizeIntegration(record: IntegrationRecord): Integration {
  return {
    id: record.id,
    type: record.integration_type,
    name: record.name,
    status: record.is_active ? "active" : "inactive",
    config: record.config ?? {},
    lastSync: record.updated_at ?? undefined,
  };
}

function serializeIntegration(data: Partial<Integration> & { is_active?: boolean }) {
  const payload: Record<string, unknown> = {};

  if (data.type !== undefined) payload.integration_type = data.type;
  if (data.name !== undefined) payload.name = data.name;
  if (data.config !== undefined) payload.config = data.config;

  if (data.status !== undefined) {
    payload.is_active = data.status === "active";
  } else if (data.is_active !== undefined) {
    payload.is_active = data.is_active;
  }

  return payload;
}

export const adminApi = {
  getModules: async () =>
    (await api.get<ApiEnvelope<ModuleRecord[]>>("/admin/modules")).data.map(normalizeModule),
  createModule: async (data: Partial<Module>) =>
    normalizeModule((await api.post<ApiEnvelope<ModuleRecord>>("/admin/modules", serializeModule(data))).data),
  updateModule: async (id: string, data: Partial<Module>) =>
    normalizeModule((await api.put<ApiEnvelope<ModuleRecord>>(`/admin/modules/${id}`, serializeModule(data))).data),
  deleteModule: async (id: string) =>
    normalizeModule((await api.put<ApiEnvelope<ModuleRecord>>(`/admin/modules/${id}`, { is_active: false })).data),

  getTemplates: async () => (await api.get<ApiEnvelope<Template[]>>("/admin/templates")).data,
  createTemplate: async (data: Partial<Template>) =>
    (await api.post<ApiEnvelope<Template>>("/admin/templates", data)).data,
  updateTemplate: async (id: string, data: Partial<Template>) =>
    (await api.put<ApiEnvelope<Template>>(`/admin/templates/${id}`, data)).data,
  deleteTemplate: async (id: string) =>
    (await api.put<ApiEnvelope<Template>>(`/admin/templates/${id}`, { is_active: false })).data,

  getWorkflowRules: async () =>
    (await api.get<ApiEnvelope<WorkflowRule[]>>("/admin/workflow-rules")).data,
  createWorkflowRule: async (data: Partial<WorkflowRule>) =>
    (await api.post<ApiEnvelope<WorkflowRule>>("/admin/workflow-rules", data)).data,
  updateWorkflowRule: async (id: string, data: Partial<WorkflowRule>) =>
    (await api.put<ApiEnvelope<WorkflowRule>>(`/admin/workflow-rules/${id}`, data)).data,
  deleteWorkflowRule: async (id: string) =>
    (await api.put<ApiEnvelope<WorkflowRule>>(`/admin/workflow-rules/${id}`, { is_active: false })).data,

  getIntegrations: async () =>
    (await api.get<ApiEnvelope<IntegrationRecord[]>>("/admin/integrations")).data.map(normalizeIntegration),
  createIntegration: async (data: Partial<Integration>) =>
    normalizeIntegration(
      (await api.post<ApiEnvelope<IntegrationRecord>>("/admin/integrations", serializeIntegration(data))).data
    ),
  updateIntegration: async (id: string, data: Partial<Integration>) =>
    normalizeIntegration(
      (await api.put<ApiEnvelope<IntegrationRecord>>(`/admin/integrations/${id}`, serializeIntegration(data))).data
    ),
  deleteIntegration: async (id: string) =>
    normalizeIntegration(
      (await api.put<ApiEnvelope<IntegrationRecord>>(`/admin/integrations/${id}`, { is_active: false })).data
    ),
};

export const dataApi = {
  getRecords: async (params?: Record<string, unknown>) =>
    (await api.get<DataRecordListEnvelope>("/data/records", params)).data,
  getRecord: async (id: string) =>
    (await api.get<ApiEnvelope<DataRecord>>(`/data/records/${id}`)).data,
};

export const workflowApi = {
  getInstances: async (params?: Record<string, unknown>) =>
    (await api.get<ListEnvelope<WorkflowInstance[]>>("/workflows/instances", params)).data,
  getInstance: async (id: string) =>
    (await api.get<ApiEnvelope<WorkflowInstance>>(`/workflows/instances/${id}`)).data,
  transition: (id: string, action: string, context?: { comment?: string }) =>
    api.post(`/workflows/instances/${id}/transition`, {
      state: action,
      comment: context?.comment,
    }),
};

export const reportApi = {
  getReports: async (params?: Record<string, unknown>) =>
    (await api.get<ListEnvelope<Report[]>>("/reports", params)).data,
  generateReport: async (data: Record<string, unknown>) =>
    (await api.post<ApiEnvelope<Report>>("/reports/generate", data)).data,
  getReport: async (id: string) =>
    (await api.get<ApiEnvelope<Report>>(`/reports/${id}`)).data,
};

export const channelApi = {
  sendMessage: async (data: {
    channel: string;
    to?: string;
    subject?: string;
    message: string;
    metadata?: Record<string, unknown>;
  }) =>
    (
      await api.post<
        ApiEnvelope<{
          channel: string;
          accepted: boolean;
          external_id?: string;
          detail?: string;
          sent_by: string;
          sent_at: string;
        }>
      >("/channels/send", {
        channel: data.channel,
        to: data.to,
        subject: data.subject,
        message: data.message,
        metadata: data.metadata ?? {},
      })
    ).data,
  getStatus: async (channel: string) =>
    (await api.get<ApiEnvelope<Record<string, unknown>>>(`/channels/status/${channel}`)).data,
};
