import { randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";
import type { Request, Response } from "express";

import { env } from "../../config.js";
import { AppError } from "../../lib/errors.js";
import { createUserSupabaseClient, supabaseAdmin } from "../../lib/supabase.js";
import { SignInSchema, SignUpSchema } from "../schemas/authSchemas.js";

const slugify = (value: string): string => {
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return normalized || "org";
};

const createAnonAuthClient = () =>
  createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

const resolveUniqueOrgSlug = async (baseName: string): Promise<string> => {
  const baseSlug = slugify(baseName);

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const suffix = attempt === 0 ? "" : `-${randomUUID().slice(0, 6)}`;
    const candidate = `${baseSlug}${suffix}`;

    const { data, error } = await supabaseAdmin
      .from("organizations")
      .select("id")
      .eq("slug", candidate)
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new AppError("Failed to validate organization slug", 500, "DB_READ_FAILED", error);
    }

    if (!data) {
      return candidate;
    }
  }

  throw new AppError("Unable to reserve a unique organization slug", 500, "ORG_SLUG_CONFLICT");
};

const fetchAuthProfile = async (accessToken: string) => {
  const userClient = createUserSupabaseClient(accessToken);
  const { data: authUserData, error: authUserError } = await userClient.auth.getUser(accessToken);
  const authUserId = authUserData.user?.id;

  if (authUserError || !authUserId) {
    throw new AppError("Failed to resolve authenticated user", 401, "UNAUTHORIZED", authUserError ?? undefined);
  }

  const { data: appUser, error: userError } = await userClient
    .from("users")
    .select("id, email, full_name, role, org_id")
    .eq("id", authUserId)
    .single();

  if (userError || !appUser) {
    throw new AppError("No application user mapping found", 403, "USER_NOT_MAPPED", userError ?? undefined);
  }

  const { data: org, error: orgError } = await userClient
    .from("organizations")
    .select("id, name, slug, settings")
    .eq("id", appUser.org_id)
    .single();

  if (orgError || !org) {
    throw new AppError("Organization mapping not found", 403, "ORG_NOT_MAPPED", orgError ?? undefined);
  }

  return {
    user: {
      id: appUser.id,
      email: appUser.email,
      role: appUser.role,
      name: appUser.full_name ?? appUser.email
    },
    tenant: {
      id: org.id,
      name: org.name,
      slug: org.slug,
      settings: (org.settings as Record<string, unknown> | null) ?? {}
    }
  };
};

export const authController = {
  async signUp(req: Request, res: Response) {
    const payload = SignUpSchema.parse(req.body);
    const orgSlug = await resolveUniqueOrgSlug(payload.company_name);

    const { data: createdAuthUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email: payload.email,
      password: payload.password,
      email_confirm: true,
      user_metadata: {
        full_name: payload.full_name
      }
    });

    if (createUserError || !createdAuthUser.user) {
      const message = createUserError?.message?.toLowerCase() ?? "";
      if (message.includes("already") || message.includes("registered")) {
        throw new AppError("Email is already registered", 409, "AUTH_EMAIL_EXISTS", createUserError);
      }
      throw new AppError("Failed to create auth user", 500, "AUTH_SIGNUP_FAILED", createUserError);
    }

    const { data: org, error: orgError } = await supabaseAdmin
      .from("organizations")
      .insert({
        name: payload.company_name,
        slug: orgSlug,
        settings: {
          timezone: "Asia/Kolkata"
        },
        created_by: createdAuthUser.user.id,
        updated_by: createdAuthUser.user.id
      })
      .select("id, name, slug, settings")
      .single();

    if (orgError || !org) {
      throw new AppError("Failed to create organization", 500, "DB_WRITE_FAILED", orgError);
    }

    const { error: userMapError } = await supabaseAdmin.from("users").insert({
      id: createdAuthUser.user.id,
      org_id: org.id,
      email: payload.email,
      full_name: payload.full_name,
      role: "owner",
      is_active: true,
      created_by: createdAuthUser.user.id,
      updated_by: createdAuthUser.user.id
    });

    if (userMapError) {
      throw new AppError("Failed to create application user mapping", 500, "DB_WRITE_FAILED", userMapError);
    }

    const anonAuthClient = createAnonAuthClient();
    const { data: sessionData, error: signInError } = await anonAuthClient.auth.signInWithPassword({
      email: payload.email,
      password: payload.password
    });

    const accessToken = sessionData.session?.access_token;
    if (signInError || !accessToken) {
      throw new AppError("Account created but automatic sign-in failed", 500, "AUTH_SIGNIN_FAILED", signInError);
    }

    const profile = await fetchAuthProfile(accessToken);

    res.status(201).json({
      data: {
        token: accessToken,
        ...profile
      }
    });
  },

  async signIn(req: Request, res: Response) {
    const payload = SignInSchema.parse(req.body);
    const anonAuthClient = createAnonAuthClient();

    const { data: sessionData, error: signInError } = await anonAuthClient.auth.signInWithPassword({
      email: payload.email,
      password: payload.password
    });

    const accessToken = sessionData.session?.access_token;
    if (signInError || !accessToken) {
      throw new AppError("Invalid credentials", 401, "AUTH_INVALID_CREDENTIALS", signInError);
    }

    const profile = await fetchAuthProfile(accessToken);

    res.status(200).json({
      data: {
        token: accessToken,
        ...profile
      }
    });
  }
};
