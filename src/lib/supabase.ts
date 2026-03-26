import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { env } from "../config.js";

export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export const createUserSupabaseClient = (jwt: string): SupabaseClient => {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${jwt}`
      }
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};
