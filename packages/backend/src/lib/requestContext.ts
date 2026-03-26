import type { Request } from "express";
import type { SupabaseClient } from "@supabase/supabase-js";

import { AppError } from "./errors.js";
import type { AuthContext } from "../types/auth.js";

export interface RequestContext {
  auth: AuthContext;
  supabase: SupabaseClient;
}

export const getRequestContext = (req: Request): RequestContext => {
  if (!req.auth || !req.supabase) {
    throw new AppError("Missing authenticated request context", 401, "UNAUTHORIZED");
  }

  return {
    auth: req.auth,
    supabase: req.supabase
  };
};
