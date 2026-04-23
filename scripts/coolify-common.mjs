import { readFile } from "node:fs/promises";
import path from "node:path";

export const DEFAULT_API_URL = "http://127.0.0.1:8000/api/v1";

export function parseEnvText(text) {
  const entries = new Map();

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eq = rawLine.indexOf("=");
    if (eq < 0) continue;

    const key = rawLine.slice(0, eq).trim();
    let value = rawLine.slice(eq + 1).trim();
    if (!key) continue;

    const quoted = (value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"));
    if (quoted && value.length >= 2) value = value.slice(1, -1);

    entries.set(key, value);
  }

  return entries;
}

export function isPlaceholderValue(value) {
  const normalized = String(value).trim().toLowerCase();
  return (
    normalized.length === 0 ||
    normalized.startsWith("your-") ||
    normalized.includes("your-project-id") ||
    normalized.includes("placeholder") ||
    normalized.includes("example")
  );
}

export function inferSecretFlag(key) {
  return /(_KEY|_TOKEN|_SECRET|PASSWORD|JWT|PRIVATE|API_KEY)$/i.test(key);
}

export function parseCommonArgs(argv, defaults = {}) {
  const args = {
    resourceType: defaults.resourceType ?? "application",
    restart: defaults.restart ?? true,
    dryRun: false,
    allowPlaceholders: defaults.allowPlaceholders ?? false,
    envFile: defaults.envFile,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--type" || arg === "--resource-type") args.resourceType = argv[++index];
    else if (arg === "--uuid" || arg === "--resource-uuid") args.resourceUuid = argv[++index];
    else if (arg === "--file" || arg === "--env-file") args.envFile = argv[++index];
    else if (arg === "--api-url") args.apiUrl = argv[++index];
    else if (arg === "--token") args.token = argv[++index];
    else if (arg === "--no-restart") args.restart = false;
    else if (arg === "--dry-run") args.dryRun = true;
    else if (arg === "--allow-placeholders") args.allowPlaceholders = true;
    else if (arg === "--help" || arg === "-h") args.help = true;
  }

  return args;
}

export async function callCoolifyApi({ apiUrl, token, method, resourceType, resourceUuid, suffix, body }) {
  const response = await fetch(`${apiUrl.replace(/\/$/, "")}/${resourceType}s/${resourceUuid}${suffix}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : await response.text().catch(() => "");

  if (!response.ok) {
    const message = typeof payload === "string" ? payload : payload?.message || response.statusText;
    throw new Error(`Coolify API ${method} ${suffix || ""} failed (${response.status}): ${message}`);
  }

  return payload;
}

export async function runCoolifyEnvSync({
  argv,
  defaults = {},
  usage,
  selectEntries,
  envFileDefault,
}) {
  const args = parseCommonArgs(argv, { ...defaults, envFile: envFileDefault });

  if (args.help) {
    console.log(usage());
    return;
  }

  const resourceType = (args.resourceType ?? process.env.COOLIFY_RESOURCE_TYPE ?? "application").toLowerCase();
  if (!["application", "service"].includes(resourceType)) {
    throw new Error(`Invalid resource type: ${resourceType}`);
  }

  const apiUrl = args.apiUrl ?? process.env.COOLIFY_API_URL ?? DEFAULT_API_URL;
  const token = args.token ?? process.env.COOLIFY_API_TOKEN;
  const resourceUuid = args.resourceUuid ?? process.env.COOLIFY_RESOURCE_UUID;
  const envFile = args.envFile ?? process.env.COOLIFY_ENV_FILE ?? envFileDefault;

  if (!token) throw new Error("Missing Coolify API token. Set COOLIFY_API_TOKEN or pass --token.");
  if (!resourceUuid) throw new Error("Missing Coolify resource UUID. Set COOLIFY_RESOURCE_UUID or pass --uuid.");
  if (path.basename(envFile).toLowerCase().endsWith(".example")) {
    throw new Error(`Refusing to sync from example file "${envFile}". Use a real env file.`);
  }

  const raw = await readFile(envFile, "utf8");
  const envMap = parseEnvText(raw);
  const selected = selectEntries({
    envMap,
    args,
    isPlaceholderValue,
  });

  if (selected.length === 0) {
    throw new Error(`No matching vars found in ${envFile}`);
  }

  const payload = {
    data: selected.map(({ key, value }) => ({
      key,
      value,
      is_preview: false,
      is_literal: true,
      is_multiline: String(value).includes("\n"),
      is_shown_once: inferSecretFlag(key),
    })),
  };

  return { args, apiUrl, resourceType, resourceUuid, envFile, payload };
}
