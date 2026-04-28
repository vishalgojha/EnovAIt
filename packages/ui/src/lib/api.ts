const API_BASE = import.meta.env.VITE_API_URL || "/api/v1";

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || error.message || "Request failed");
  }

  return response.json();
}

export const api = {
  dashboard: {
    stats: () => fetchWithAuth("/dashboard/stats"),
    filings: () => fetchWithAuth("/dashboard/filings"),
    modules: () => fetchWithAuth("/dashboard/modules"),
  },
  chat: {
    send: (messages: unknown[], options?: { model?: string; use_tools?: boolean; files?: unknown[] }) =>
      fetchWithAuth("/chat", {
        method: "POST",
        body: JSON.stringify({ messages, ...options }),
      }),
    providers: () => fetchWithAuth("/chat/providers"),
  },
  modules: {
    list: () => fetchWithAuth("/modules"),
    get: (id: string) => fetchWithAuth(`/modules/${id}`),
  },
  data: {
    records: (params?: Record<string, string>) => {
      const query = params ? `?${new URLSearchParams(params).toString()}` : "";
      return fetchWithAuth(`/data/records${query}`);
    },
    upload: async (file: File, type: "excel" | "document") => {
      const formData = new FormData();
      formData.append("file", file);
      
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE}/data/ingest/${type}`, {
        method: "POST",
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      return response.json();
    },
  },
  channels: {
    list: () => fetchWithAuth("/channels"),
    create: (data: unknown) =>
      fetchWithAuth("/channels", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
};