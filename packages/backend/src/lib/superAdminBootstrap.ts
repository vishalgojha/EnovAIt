import { randomBytes } from "node:crypto";

import { env } from "../config.js";
import { logger } from "./logger.js";
import { supabaseAdmin } from "./supabase.js";

type ReservedAdmin = {
  email: string;
  fullName: string;
};

const PLATFORM_ORG_SLUG = "enovait-platform";

const RESERVED_ADMINS: ReservedAdmin[] = [
  { email: "khush@enov360.com", fullName: "Khush" },
  { email: "vishal@chaoscraftlabs.com", fullName: "Vishal" }
];

const normalizeEmail = (value: string): string => value.trim().toLowerCase();

export const isReservedSuperAdminEmail = (value: string): boolean =>
  RESERVED_ADMINS.some((admin) => normalizeEmail(admin.email) === normalizeEmail(value));

const generateRotatingPassword = (): string =>
  `Demo-${randomBytes(10).toString("base64url")}!A1`;

const findAuthUserByEmail = async (email: string) => {
  const normalizedEmail = normalizeEmail(email);
  const pageSize = 1000;
  let page = 1;

  for (;;) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: pageSize });

    if (error) {
      throw error;
    }

    const matched = data.users.find((user) => normalizeEmail(user.email ?? "") === normalizedEmail);
    if (matched) {
      return matched;
    }

    if (data.users.length < pageSize) {
      return null;
    }

    page += 1;
  }
};

const ensurePlatformOrg = async () => {
  const { data: existingOrg, error: readError } = await supabaseAdmin
    .from("organizations")
    .select("id, name, slug, settings")
    .eq("slug", PLATFORM_ORG_SLUG)
    .maybeSingle();

  if (readError) {
    throw readError;
  }

  if (existingOrg) {
    return existingOrg;
  }

  const { data: createdOrg, error: createError } = await supabaseAdmin
    .from("organizations")
    .insert({
      name: "EnovAIt Platform",
      slug: PLATFORM_ORG_SLUG,
      settings: {
        timezone: "Asia/Kolkata",
        is_platform: true,
        billing_scope: "platform",
        seed_mode: "super_admin_bootstrap"
      }
    })
    .select("id, name, slug, settings")
    .single();

  if (createError || !createdOrg) {
    throw createError ?? new Error("Failed to create platform organization");
  }

  return createdOrg;
};

const ensureReservedAdmin = async (orgId: string, admin: ReservedAdmin) => {
  const password = generateRotatingPassword();
  const existingAuthUser = await findAuthUserByEmail(admin.email);

  let authUserId: string;

  if (existingAuthUser) {
    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existingAuthUser.id, {
      password,
      email_confirm: true,
      user_metadata: {
        full_name: admin.fullName,
        role: "super_admin",
        seed_origin: "enovait_platform_bootstrap"
      }
    });

    if (updateError || !updatedUser.user) {
      throw updateError ?? new Error(`Failed to update auth user for ${admin.email}`);
    }

    authUserId = updatedUser.user.id;
  } else {
    const { data: createdUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: admin.email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: admin.fullName,
        role: "super_admin",
        seed_origin: "enovait_platform_bootstrap"
      }
    });

    if (createError || !createdUser.user) {
      throw createError ?? new Error(`Failed to create auth user for ${admin.email}`);
    }

    authUserId = createdUser.user.id;
  }

  const { error: userUpsertError } = await supabaseAdmin.from("users").upsert({
    id: authUserId,
    org_id: orgId,
    email: admin.email,
    full_name: admin.fullName,
    role: "super_admin",
    is_active: true,
    profile: {
      access_scope: "platform",
      seat_scope: "all",
      seeded_by: "super_admin_bootstrap"
    },
    updated_by: authUserId,
    created_by: authUserId
  });

  if (userUpsertError) {
    throw userUpsertError;
  }

  logger.warn(
    {
      email: admin.email,
      user_id: authUserId,
      password,
      org_id: orgId
    },
    "Bootstrapped rotating super admin credentials"
  );
};

export const bootstrapSuperAdmins = async (): Promise<void> => {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return;
  }

  const platformOrg = await ensurePlatformOrg();

  for (const admin of RESERVED_ADMINS) {
    await ensureReservedAdmin(platformOrg.id, admin);
  }
};
