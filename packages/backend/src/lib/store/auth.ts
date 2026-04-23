import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role } from "@/lib/rbac";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  settings: Record<string, any>;
}

interface User {
  id: string;
  email: string;
  role: Role;
  name: string;
}

interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  token: string | null;
  hasHydrated: boolean;
  sessionStatus: "loading" | "ready";
  setAuth: (user: User, tenant: Tenant, token: string) => void;
  clearAuth: () => void;
  updateTenant: (tenant: Partial<Tenant>) => void;
  setHydrated: (hydrated: boolean) => void;
  setSessionStatus: (status: "loading" | "ready") => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tenant: null,
      token: null,
      hasHydrated: false,
      sessionStatus: "loading",
      setAuth: (user, tenant, token) => set({ user, tenant, token }),
      clearAuth: () => set({ user: null, tenant: null, token: null }),
      updateTenant: (tenantUpdate) =>
        set((state) => ({
          tenant: state.tenant ? { ...state.tenant, ...tenantUpdate } : null,
        })),
      setHydrated: (hydrated) => set({ hasHydrated: hydrated }),
      setSessionStatus: (status) => set({ sessionStatus: status }),
    }),
    {
      name: "enovait-auth-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
