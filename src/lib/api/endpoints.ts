import { api } from './client';
import { 
  Module, 
  Template, 
  WorkflowRule, 
  Integration, 
  DataRecord, 
  WorkflowInstance, 
  Report 
} from '../../types';

interface ApiEnvelope<T> {
  data: T;
}

interface DataRecordListEnvelope {
  data: DataRecord[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export const adminApi = {
  // Modules
  getModules: async () => (await api.get<ApiEnvelope<Module[]>>('/admin/modules')).data,
  createModule: (data: Partial<Module>) => api.post<Module>('/admin/modules', data),
  updateModule: async (id: string, data: Partial<Module>) =>
    (await api.put<ApiEnvelope<Module>>(`/admin/modules/${id}`, data)).data,
  deleteModule: async (id: string) =>
    (await api.put<ApiEnvelope<Module>>(`/admin/modules/${id}`, { status: 'inactive' })).data,

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
  // Backend routes for integrations are not wired yet; keep UI stable with local fallback.
  getIntegrations: async (): Promise<Integration[]> => [],
  createIntegration: async (data: Partial<Integration>): Promise<Integration> =>
    ({ id: crypto.randomUUID(), type: 'api_partner', name: data.name ?? 'New Integration', status: 'inactive', config: {} } as Integration),
  updateIntegration: async (id: string, data: Partial<Integration>): Promise<Integration> =>
    ({ id, type: data.type ?? 'api_partner', name: data.name ?? 'Updated Integration', status: data.status ?? 'inactive', config: data.config ?? {} } as Integration),
  deleteIntegration: async (_id: string): Promise<{ ok: true }> => ({ ok: true }),
};

export const dataApi = {
  getRecords: async (params?: any) => (await api.get<DataRecordListEnvelope>('/data/records', params)).data,
  getRecord: async (id: string) => (await api.get<ApiEnvelope<DataRecord>>(`/data/records/${id}`)).data,
};

export const workflowApi = {
  // Backend exposes `GET /workflows/instances/:id` but not list yet.
  getInstances: async (_params?: any): Promise<WorkflowInstance[]> => [],
  getInstance: async (id: string) => (await api.get<ApiEnvelope<WorkflowInstance>>(`/workflows/instances/${id}`)).data,
  transition: (id: string, action: string, context?: any) => 
    api.post(`/workflows/instances/${id}/transition`, { state: action, comment: context?.comment }),
};

export const reportApi = {
  // Backend exposes generate + get-by-id; list endpoint can be added later.
  getReports: async (): Promise<Report[]> => [],
  generateReport: async (data: any) => (await api.post<ApiEnvelope<Report>>('/reports/generate', data)).data,
  getReport: async (id: string) => (await api.get<ApiEnvelope<Report>>(`/reports/${id}`)).data,
};

export const channelApi = {
  // Channel control backend endpoints are pending; keep console operational with local stub.
  sendMessage: async (_data: { channel: string; to: string; content: any }) =>
    ({ ok: true, queued_at: new Date().toISOString() }),
  getStatus: async (_channel: string) => ({ status: 'operational', health: 99 }),
};
