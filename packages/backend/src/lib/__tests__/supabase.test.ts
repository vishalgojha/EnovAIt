import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

describe("supabase helpers", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("loads without throwing when Supabase secrets are missing", async () => {
    process.env.SUPABASE_URL = "https://placeholder.supabase.co";
    process.env.SUPABASE_ANON_KEY = "";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "";

    const module = await import("../supabase.js");

    expect(module.isSupabaseConfigured()).toBe(false);
    const getAdmin = () => module.getSupabaseAdmin();

    expect(getAdmin).toThrowError(/Supabase is not configured/);
    expect(() => {
      try {
        getAdmin();
      } catch (error) {
        expect(error).toMatchObject({
          code: "SUPABASE_NOT_CONFIGURED",
          statusCode: 503
        });
        throw error;
      }
    }).toThrowError(/Supabase is not configured/);
  });

  it("creates clients when Supabase secrets are present", async () => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_ANON_KEY = "anon-key";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";

    const module = await import("../supabase.js");

    expect(module.isSupabaseConfigured()).toBe(true);
    expect(module.getSupabaseAdmin()).toBeTruthy();
    expect(module.createAnonSupabaseClient()).toBeTruthy();
    expect(module.createUserSupabaseClient("jwt-token")).toBeTruthy();
  });
});
