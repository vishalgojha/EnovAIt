import type { NextFunction, Request, Response } from "express";

import { AppError } from "../../lib/errors.js";
import { createUserSupabaseClient, supabaseAdmin } from "../../lib/supabase.js";

export const requireAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Missing Bearer token", 401, "UNAUTHORIZED");
    }

    const token = authHeader.slice("Bearer ".length).trim();
    const userClient = createUserSupabaseClient(token);
    const { data: authUserData, error: authError } = await userClient.auth.getUser(token);

    if (authError || !authUserData.user?.id) {
      throw new AppError("Invalid or expired access token", 401, "UNAUTHORIZED", authError);
    }

    const { data: appUser, error } = await supabaseAdmin
      .from("users")
      .select("id, org_id, role, email")
      .eq("id", authUserData.user.id)
      .single();

    if (error || !appUser) {
      throw new AppError("No application user mapping found", 403, "USER_NOT_MAPPED", error ?? undefined);
    }

    req.auth = {
      userId: appUser.id,
      orgId: appUser.org_id,
      role: appUser.role,
      email: appUser.email
    };
    req.supabase = userClient;
    req.accessToken = token;

    next();
  } catch (error) {
    next(error);
  }
};
