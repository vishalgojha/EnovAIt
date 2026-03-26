import type { SupabaseClient } from "@supabase/supabase-js";

import type { AuthContext } from "./auth.js";

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
      supabase?: SupabaseClient;
      accessToken?: string;
      rawBody?: string;
    }
  }
}

export {};
