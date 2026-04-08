import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  role: 'super_admin' | 'owner' | 'admin' | 'manager' | 'member' | 'viewer';
  name: string;
}

interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  token: string | null;
  setAuth: (user: User, tenant: Tenant, token: string) => void;
  clearAuth: () => void;
  updateTenant: (tenant: Partial<Tenant>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tenant: null,
      token: null,
      setAuth: (user, tenant, token) => set({ user, tenant, token }),
      clearAuth: () => set({ user: null, tenant: null, token: null }),
      updateTenant: (tenantUpdate) => 
        set((state) => ({
          tenant: state.tenant ? { ...state.tenant, ...tenantUpdate } : null
        })),
    }),
    {
      name: 'enovait-auth-storage',
    }
  )
);
