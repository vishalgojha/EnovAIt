import { api } from "./client";
import type { Role } from "@/lib/rbac";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface AuthTenant {
  id: string;
  name: string;
  slug: string;
  settings: Record<string, unknown>;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
  tenant: AuthTenant;
}

interface AuthResponse {
  data: AuthSession;
}

export interface SignInPayload {
  email: string;
  password: string;
}

export async function signIn(payload: SignInPayload): Promise<AuthSession> {
  const response = await api.post<AuthResponse>("/public/auth/signin", payload);
  return response.data;
}

export async function refreshSession(): Promise<AuthSession> {
  const response = await api.get<AuthResponse>("/public/auth/me");
  return response.data;
}
