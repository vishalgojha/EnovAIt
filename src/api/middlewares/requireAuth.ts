import { createSecretKey } from "crypto";
import type { NextFunction, Request, Response } from "express";
import { jwtVerify } from "jose";

import { env } from "../../config.js";
import { AppError } from "../../lib/errors.js";
import { createUserSupabaseClient } from "../../lib/supabase.js";

const jwtSecret = createSecretKey(Buffer.from(env.SUPABASE_JWT_SECRET, "utf-8"));

interface JwtPayload {
  sub?: string;
  email?: string;
}

export const requireAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Missing Bearer token", 401, "UNAUTHORIZED");
    }

    const token = authHeader.slice("Bearer ".length).trim();
    const { payload } = await jwtVerify(token, jwtSecret);
    const jwtPayload = payload as JwtPayload;

    if (!jwtPayload.sub) {
      throw new AppError("Invalid JWT payload", 401, "UNAUTHORIZED");
    }

    const userClient = createUserSupabaseClient(token);
    const { data: appUser, error } = await userClient
      .from("users")
      .select("id, org_id, role, email")
      .eq("id", jwtPayload.sub)
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
