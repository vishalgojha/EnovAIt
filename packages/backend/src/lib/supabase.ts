import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { env } from "../config.js";
import { AppError } from "./errors.js";

const PLACEHOLDER_SUPABASE_URL = "https://placeholder.supabase.co";

const baseAuthOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
} as const;

let adminClient: SupabaseClient | null = null;

const missingSupabaseEnv = (keys: string[]): string[] =>
  keys.filter((key) => {
    const value = env[key as keyof typeof env];
    if (typeof value !== "string") {
      return false;
    }

    if (key === "SUPABASE_URL") {
      return value === PLACEHOLDER_SUPABASE_URL;
    }

    return value.trim().length === 0;
  });

const createSupabaseConfigError = (keys: string[]): AppError => {
  const missing = missingSupabaseEnv(keys);

  return new AppError(
    `Supabase is not configured. Missing: ${missing.join(", ")}`,
    503,
    "SUPABASE_NOT_CONFIGURED",
    { missing }
  );
};

const assertSupabaseConfig = (keys: string[]): void => {
  const missing = missingSupabaseEnv(keys);
  if (missing.length > 0) {
    throw createSupabaseConfigError(keys);
  }
};

export const isSupabaseConfigured = (): boolean =>
  missingSupabaseEnv(["SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]).length === 0;

export const getSupabaseAdmin = (): SupabaseClient => {
  assertSupabaseConfig(["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]);

  if (!adminClient) {
    adminClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, baseAuthOptions);
  }

  return adminClient;
};

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, property, receiver) {
    return Reflect.get(getSupabaseAdmin(), property, receiver);
  }
});

export const createAnonSupabaseClient = (): SupabaseClient => {
  assertSupabaseConfig(["SUPABASE_URL", "SUPABASE_ANON_KEY"]);
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, baseAuthOptions);
};

export const createUserSupabaseClient = (jwt: string): SupabaseClient => {
  assertSupabaseConfig(["SUPABASE_URL", "SUPABASE_ANON_KEY"]);

  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${jwt}`
      }
    },
    ...baseAuthOptions
  });
};

export const createRequiredSupabaseConfigError = (): AppError =>
  createSupabaseConfigError(["SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]);
