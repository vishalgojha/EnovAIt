#!/usr/bin/env node

import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const DEFAULT_API_URL = "http://127.0.0.1:8000/api/v1";
const LOCAL_PROFILE_FILE = ".coolify.local.json";

function usage() {
  return [
    "Usage:",
    "  npm run coolify -- <command> [options]",
    "",
    "If no command is provided, the CLI enters guided mode.",
    "",
    "Commands:",
    "  guided    Walk through the task interactively",
    "  setup     EnovAIt-friendly guided setup",
    "  env       Sync env vars from a file, inline pairs, or stdin",
    "  deploy    Trigger a Coolify deploy by name or UUID",
    "  restart   Restart a Coolify application or service",
    "  list      Show resources and exit",
    "",
    "Common options:",
    "  --type <application|service>   Resource type, default application",
    "  --uuid <resource-uuid>         Coolify resource UUID",
    "  --name <resource-name>         Resolve a resource by name",
    "  --api-url <url>                Coolify API base URL",
    "  --token <token>                Coolify API token",
    "  --dry-run                      Print the payload without calling Coolify",
    "",
    "Useful env vars:",
    "  COOLIFY_API_URL                Coolify API base URL",
    "  COOLIFY_API_TOKEN              Coolify API token",
    "  COOLIFY_RESOURCE_TYPE          Default resource type",
    "  COOLIFY_RESOURCE_UUID          Default resource UUID",
    "  COOLIFY_RESOURCE_NAME          Default resource name",
    "",
    `Local profile: ${LOCAL_PROFILE_FILE} in the project root`,
    "",
    "env command options:",
    "  --file <env-file>              Read KEY=VALUE pairs from a local env file",
    "  --set KEY=VALUE                Add or override a single env var; repeatable",
    "  --stdin                        Read KEY=VALUE pairs from stdin",
    "  --no-redeploy                  Update envs only",
    "  --force                        Use literal values as-is, including placeholders",
    "",
    "deploy command options:",
    "  --force                        Force rebuild for applications",
    "",
    "restart command options:",
    "  --latest                       Pull latest image before restarting services",
  ].join("\n");
}

function parseArgs(argv) {
  const args = {
    command: undefined,
    resourceType: "application",
    dryRun: false,
    force: false,
    latest: false,
    allowPlaceholders: false,
    noRedeploy: false,
    file: undefined,
    token: undefined,
    apiUrl: undefined,
    resourceUuid: undefined,
    resourceName: undefined,
    stdin: false,
    inlinePairs: [],
    pastedText: undefined,
  };

  const tokens = [...argv];
  if (tokens.length > 0 && !tokens[0].startsWith("--")) {
    args.command = tokens.shift();
  }

  for (let index = 0; index < tokens.length; index += 1) {
    const arg = tokens[index];

    if (arg === "--type" || arg === "--resource-type") args.resourceType = tokens[++index];
    else if (arg === "--uuid" || arg === "--resource-uuid") args.resourceUuid = tokens[++index];
    else if (arg === "--name" || arg === "--resource-name") args.resourceName = tokens[++index];
    else if (arg === "--file" || arg === "--env-file") args.file = tokens[++index];
    else if (arg === "--api-url") args.apiUrl = tokens[++index];
    else if (arg === "--token") args.token = tokens[++index];
    else if (arg === "--stdin") args.stdin = true;
    else if (arg === "--dry-run") args.dryRun = true;
    else if (arg === "--force") args.force = true;
    else if (arg === "--latest") args.latest = true;
    else if (arg === "--allow-placeholders") args.allowPlaceholders = true;
    else if (arg === "--no-redeploy") args.noRedeploy = true;
    else if (arg === "--set") args.inlinePairs.push(tokens[++index]);
    else if (arg === "--help" || arg === "-h") args.help = true;
    else if (!arg.startsWith("--") && !args.command) args.command = arg;
  }

  return args;
}

async function firstExistingFile(candidates) {
  for (const candidate of candidates) {
    try {
      await readFile(candidate, "utf8");
      return candidate;
    } catch {
      // Keep scanning.
    }
  }
  return undefined;
}

async function readLocalProfile() {
  try {
    const raw = await readFile(LOCAL_PROFILE_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function writeLocalProfile(profile) {
  await writeFile(LOCAL_PROFILE_FILE, `${JSON.stringify(profile, null, 2)}\n`, "utf8");
}

async function discoverEnvFiles() {
  const entries = await readdir(process.cwd(), { withFileTypes: true });
  const names = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => {
      const lower = name.toLowerCase();
      return (
        lower === "coolify.env" ||
        lower === "server-env.env" ||
        lower === ".env" ||
        lower.startsWith(".env.") ||
        lower.endsWith(".env")
      );
    });

  return names.sort((a, b) => a.localeCompare(b));
}

function parseEnvText(text) {
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

function isPlaceholderValue(value) {
  const normalized = String(value).trim().toLowerCase();
  return (
    normalized.length === 0 ||
    normalized.startsWith("your-") ||
    normalized.includes("your-project-id") ||
    normalized.includes("placeholder") ||
    normalized.includes("example")
  );
}

function inferSecretFlag(key) {
  return /(_KEY|_TOKEN|_SECRET|PASSWORD|JWT|PRIVATE|API_KEY)$/i.test(key);
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

function createPrompt() {
  const rl = createInterface({ input, output });
  return {
    async ask(question, defaultValue) {
      const suffix = defaultValue ? ` [${defaultValue}]` : "";
      const answer = (await rl.question(`${question}${suffix}: `)).trim();
      return answer || defaultValue || "";
    },
    async choose(question, options) {
      while (true) {
        console.log(`\n${question}`);
        options.forEach((option, index) => {
          console.log(`  ${index + 1}. ${option.label}`);
        });
        const answer = (await rl.question("Choose a number: ")).trim();
        const index = Number.parseInt(answer, 10);
        if (Number.isInteger(index) && index >= 1 && index <= options.length) {
          return options[index - 1];
        }
        console.log("Invalid choice. Try again.");
      }
    },
    async confirm(question, defaultYes = true) {
      const hint = defaultYes ? "Y/n" : "y/N";
      while (true) {
        const answer = (await rl.question(`${question} (${hint}): `)).trim().toLowerCase();
        if (!answer) return defaultYes;
        if (["y", "yes"].includes(answer)) return true;
        if (["n", "no"].includes(answer)) return false;
        console.log("Please answer yes or no.");
      }
    },
    async multiline(question, endMarker = "END") {
      console.log(`${question}\nPaste lines now. Enter ${endMarker} on its own line to finish.`);
      const lines = [];
      while (true) {
        const line = await rl.question("");
        if (line.trim() === endMarker) break;
        lines.push(line);
      }
      return lines.join("\n");
    },
    close() {
      rl.close();
    },
  };
}

function parseInlinePairs(pairs) {
  const entries = new Map();

  for (const pair of pairs) {
    const eq = pair.indexOf("=");
    if (eq <= 0) {
      throw new Error(`Invalid --set value "${pair}". Use KEY=VALUE.`);
    }

    const key = pair.slice(0, eq).trim();
    let value = pair.slice(eq + 1);
    if (!key) {
      throw new Error(`Invalid --set value "${pair}". Use KEY=VALUE.`);
    }

    const quoted = (value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"));
    if (quoted && value.length >= 2) value = value.slice(1, -1);

    entries.set(key, value);
  }

  return entries;
}

async function callCoolifyApi({ apiUrl, token, method, resourceType, resourceUuid, suffix = "", body, query = {} }) {
  const url = new URL(`${apiUrl.replace(/\/$/, "")}/${resourceType}s/${resourceUuid}${suffix}`);

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === false || value === "") continue;
    url.searchParams.set(key, String(value));
  }

  let response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    throw new Error(`Unable to reach Coolify at ${url.origin}. Check COOLIFY_API_URL and network access. ${error instanceof Error ? error.message : String(error)}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : await response.text().catch(() => "");

  if (!response.ok) {
    const message = typeof payload === "string" ? payload : payload?.message || response.statusText;
    throw new Error(`Coolify API ${method} ${url.pathname} failed (${response.status}): ${message}`);
  }

  return payload;
}

async function listResources({ apiUrl, token, resourceType }) {
  const endpoint = resourceType === "application" ? "applications" : "services";
  let response;
  try {
    response = await fetch(`${apiUrl.replace(/\/$/, "")}/${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    throw new Error(`Unable to reach Coolify at ${apiUrl}. Check COOLIFY_API_URL and network access. ${error instanceof Error ? error.message : String(error)}`);
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload?.message || response.statusText;
    throw new Error(`Coolify API GET /${endpoint} failed (${response.status}): ${message}`);
  }

  return Array.isArray(payload) ? payload : [];
}

async function resolveCredentials({ apiUrl, token, prompt, requireInteractiveToken = false }) {
  const profile = await readLocalProfile();
  const resolvedApiUrl = apiUrl ?? process.env.COOLIFY_API_URL ?? profile.apiUrl ?? DEFAULT_API_URL;
  let resolvedToken = token ?? process.env.COOLIFY_API_TOKEN ?? profile.token;

  if (!resolvedToken && process.stdin.isTTY) {
    const shouldAsk = requireInteractiveToken || (await prompt.confirm("No Coolify token found. Enter one now?", true));
    if (shouldAsk) {
      resolvedToken = await prompt.ask("Coolify API token", "");
      const save = await prompt.confirm("Save this token locally for next time?", true);
      if (save && resolvedToken) {
        await writeLocalProfile({
          ...profile,
          apiUrl: resolvedApiUrl,
          token: resolvedToken,
        });
        console.log(`Saved local Coolify profile to ${LOCAL_PROFILE_FILE}.`);
      }
    }
  }

  if (!resolvedToken) {
    throw new Error("Missing Coolify API token. Set COOLIFY_API_TOKEN or pass --token.");
  }

  if (resolvedApiUrl !== profile.apiUrl) {
    await writeLocalProfile({
      ...profile,
      apiUrl: resolvedApiUrl,
      token: resolvedToken ?? profile.token,
    });
  }

  return { apiUrl: resolvedApiUrl, token: resolvedToken };
}

async function resolveApiUrl({ apiUrl, prompt, requireInteractive = false }) {
  const profile = await readLocalProfile();
  let resolvedApiUrl = apiUrl ?? process.env.COOLIFY_API_URL ?? profile.apiUrl;

  if (!resolvedApiUrl && process.stdin.isTTY) {
    const shouldAsk = requireInteractive || (await prompt.confirm("No Coolify API URL found. Enter one now?", true));
    if (shouldAsk) {
      resolvedApiUrl = await prompt.ask("Coolify API URL", "http://your-coolify-host:8000/api/v1");
    }
  }

  if (!resolvedApiUrl) {
    throw new Error("Missing Coolify API URL. Set COOLIFY_API_URL or pass --api-url.");
  }

  return resolvedApiUrl;
}

function normalizeName(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function matchesResource(resource, query) {
  const name = normalizeName(resource.name);
  const fqdn = normalizeName(resource.fqdn);
  const uuid = normalizeName(resource.uuid);
  const q = normalizeName(query);
  return name === q || fqdn === q || uuid === q || name.includes(q) || fqdn.includes(q) || uuid.includes(q);
}

function describeResource(resource, resourceType) {
  const extra = resourceType === "application" ? (resource.fqdn ? ` ${resource.fqdn}` : "") : resource.description ? ` ${resource.description}` : "";
  return `${resource.name}${extra} (${resource.uuid})`;
}

async function resolveResource({ args, apiUrl, token, prompt }) {
  const resourceType = (args.resourceType ?? process.env.COOLIFY_RESOURCE_TYPE ?? "application").toLowerCase();
  const resourceName = args.resourceName ?? process.env.COOLIFY_RESOURCE_NAME;
  if (!["application", "service"].includes(resourceType)) {
    throw new Error(`Invalid resource type: ${resourceType}`);
  }

  if (args.resourceUuid) {
    return { resourceType, resourceUuid: args.resourceUuid, resourceName };
  }

  if (!process.stdin.isTTY) {
    throw new Error("Missing resource UUID. Pass --uuid or --name, or run the command in an interactive terminal.");
  }

  const resources = await listResources({ apiUrl, token, resourceType });
  if (resources.length === 0) {
    throw new Error(`No ${resourceType}s found in Coolify.`);
  }

  const exact = resourceName
    ? resources.filter((resource) => matchesResource(resource, resourceName))
    : [];

  if (exact.length === 1) {
    return {
      resourceType,
      resourceUuid: exact[0].uuid,
      resourceName: exact[0].name,
    };
  }

  const filter = resourceName ? ` matching "${resourceName}"` : "";
  const visible = resources.slice(0, 12);
  console.log(`\nFound ${resources.length} ${resourceType}s${filter}.`);
  visible.forEach((resource, index) => {
    console.log(`  ${index + 1}. ${describeResource(resource, resourceType)}`);
  });
  if (resources.length > visible.length) {
    console.log(`  ...and ${resources.length - visible.length} more`);
  }

  if (resourceName && exact.length > 1) {
    console.log(`\nMore than one ${resourceType} matched "${resourceName}".`);
    const choice = await prompt.choose(
      `Pick the ${resourceType} you want`,
      exact.map((resource) => ({
        label: describeResource(resource, resourceType),
        value: resource,
      }))
    );
    return {
      resourceType,
      resourceUuid: choice.value.uuid,
      resourceName: choice.value.name,
    };
  }

  if (resourceName && exact.length === 0) {
    throw new Error(`No ${resourceType} matched "${resourceName}". Try a different name or use --list.`);
  }

  const choice = await prompt.choose(
    `Pick the ${resourceType} you want`,
    resources.map((resource) => ({
      label: describeResource(resource, resourceType),
      value: resource,
    }))
  );

  return {
    resourceType,
    resourceUuid: choice.value.uuid,
    resourceName: choice.value.name,
  };
}

async function collectEnvEntries(args) {
  const sources = [];
  const fallbackEnvFile = await firstExistingFile([
    args.file,
    process.env.COOLIFY_ENV_FILE,
    "coolify.env",
    "server-env.env",
    ".env",
  ].filter(Boolean));

  if (fallbackEnvFile) {
    const fileText = await readFile(fallbackEnvFile, "utf8");
    sources.push({ source: fallbackEnvFile, entries: parseEnvText(fileText) });
  }

  if (args.stdin) {
    const stdinText = await readStdin();
    sources.push({ source: "stdin", entries: parseEnvText(stdinText) });
  }

  if (args.inlinePairs.length > 0) {
    sources.push({ source: "inline", entries: parseInlinePairs(args.inlinePairs) });
  }

  if (args.pastedText) {
    sources.push({ source: "paste", entries: parseEnvText(args.pastedText) });
  }

  if (sources.length === 0) {
    throw new Error("No env input provided. Use --file, --stdin, or one or more --set KEY=VALUE values.");
  }

  const merged = new Map();
  for (const { entries } of sources) {
    for (const [key, value] of entries.entries()) {
      merged.set(key, value);
    }
  }

  return { merged, sourceLabel: sources.map((item) => item.source).join(", ") };
}

function buildEnvPayload({ envMap, allowPlaceholders }) {
  const data = [];

  for (const [key, value] of envMap.entries()) {
    if (!allowPlaceholders && isPlaceholderValue(value)) continue;

    data.push({
      key,
      value,
      is_preview: false,
      is_literal: true,
      is_multiline: String(value).includes("\n"),
      is_shown_once: inferSecretFlag(key),
    });
  }

  return { data };
}

async function syncEnv(args) {
  const prompt = createPrompt();
  try {
    const { apiUrl, token } = await resolveCredentials({ apiUrl: args.apiUrl, token: args.token, prompt });

    const { merged, sourceLabel } = await collectEnvEntries(args);
    const payload = buildEnvPayload({ envMap: merged, allowPlaceholders: args.allowPlaceholders });
    const resource = await resolveResource({ args, apiUrl, token, prompt });

    if (payload.data.length === 0) {
      throw new Error("No env vars matched after filtering placeholders.");
    }

    console.log(`Syncing ${payload.data.length} env vars from ${sourceLabel} to ${resource.resourceType} ${resource.resourceUuid} via ${apiUrl}`);
    console.log(`Target: ${resource.resourceName ?? resource.resourceUuid}`);

    if (args.dryRun) {
      console.log(JSON.stringify(payload, null, 2));
      return;
    }

    await callCoolifyApi({
      apiUrl,
      token,
      method: "PATCH",
      resourceType: resource.resourceType,
      resourceUuid: resource.resourceUuid,
      suffix: "/envs/bulk",
      body: payload,
    });
    console.log("Environment variables updated.");

    if (args.noRedeploy) return;

    await redeploy({ ...args, apiUrl, token, resourceUuid: resource.resourceUuid, resourceType: resource.resourceType, fromEnvSync: true });
  } finally {
    prompt.close();
  }
}

async function redeploy(args) {
  const prompt = createPrompt();
  try {
    const { apiUrl, token } = await resolveCredentials({ apiUrl: args.apiUrl, token: args.token, prompt });
    const resource = await resolveResource({ args, apiUrl, token, prompt });

    if (resource.resourceType === "application") {
      const query = { force: args.force ? true : undefined };
      if (args.dryRun) {
        console.log(JSON.stringify({ method: "GET", path: `/applications/${resource.resourceUuid}/start`, query }, null, 2));
        return;
      }

      await callCoolifyApi({
        apiUrl,
        token,
        method: "GET",
        resourceType: resource.resourceType,
        resourceUuid: resource.resourceUuid,
        suffix: "/start",
        query,
      });

      console.log("Deployment queued.");
      return;
    }

    if (args.dryRun) {
      console.log(
        JSON.stringify(
          { method: "GET", path: `/services/${resource.resourceUuid}/restart`, query: { latest: args.latest ? true : undefined } },
          null,
          2
        )
      );
      return;
    }

    await callCoolifyApi({
      apiUrl,
      token,
      method: "GET",
      resourceType: resource.resourceType,
      resourceUuid: resource.resourceUuid,
      suffix: "/restart",
      query: { latest: args.latest ? true : undefined },
    });

    console.log("Service restart queued.");
  } finally {
    prompt.close();
  }
}

async function restart(args) {
  const prompt = createPrompt();
  try {
    const { apiUrl, token } = await resolveCredentials({ apiUrl: args.apiUrl, token: args.token, prompt });
    const resource = await resolveResource({ args, apiUrl, token, prompt });

    const query = resource.resourceType === "service" ? { latest: args.latest ? true : undefined } : {};
    const payload = await callCoolifyApi({
      apiUrl,
      token,
      method: "GET",
      resourceType: resource.resourceType,
      resourceUuid: resource.resourceUuid,
      suffix: "/restart",
      query,
    });

    console.log(`${resource.resourceType === "application" ? "Deployment" : "Service restart"} queued.`);
  } finally {
    prompt.close();
  }
}

async function guided(args) {
  const prompt = createPrompt();

  try {
    const { apiUrl, token } = await resolveCredentials({ apiUrl: args.apiUrl, token: args.token, prompt, requireInteractiveToken: true });

    const action = await prompt.choose("What do you want to do?", [
      { label: "Update environment variables", value: "env" },
      { label: "Redeploy application or service", value: "deploy" },
      { label: "Restart application or service", value: "restart" },
      { label: "List resources only", value: "list" },
    ]);

    if (action.value === "list") {
      const typeChoice = await prompt.choose("Which resource type?", [
        { label: "Application", value: "application" },
        { label: "Service", value: "service" },
      ]);
      const resources = await listResources({ apiUrl, token, resourceType: typeChoice.value });
      if (resources.length === 0) {
        console.log(`No ${typeChoice.value}s found.`);
        return;
      }
      console.log(`\n${typeChoice.value === "application" ? "Applications" : "Services"}:`);
      resources.forEach((resource) => {
        console.log(`- ${describeResource(resource, typeChoice.value)}`);
      });
      return;
    }

    const typeChoice = await prompt.choose("What kind of resource is it?", [
      { label: "Application", value: "application" },
      { label: "Service", value: "service" },
    ]);
    args.resourceType = typeChoice.value;

    const defaultName = path.basename(process.cwd());
    const name = await prompt.ask("Enter the resource name, FQDN, or leave blank to pick from the list", defaultName);
    if (name) args.resourceName = name;

    if (action.value === "env") {
      const source = await prompt.choose("Where should env vars come from?", [
        { label: "Use an env file", value: "file" },
        { label: "Paste KEY=VALUE pairs", value: "paste" },
        { label: "Type one key at a time", value: "single" },
      ]);

      if (source.value === "file") {
        args.file = await prompt.ask("Path to env file", "server-env.env");
      } else if (source.value === "paste") {
        args.pastedText = await prompt.multiline("Paste your KEY=VALUE lines", "END");
      } else {
        const pairs = [];
        while (true) {
          const key = await prompt.ask("Key (blank to finish)", "");
          if (!key) break;
          const value = await prompt.ask(`Value for ${key}`, "");
          pairs.push(`${key}=${value}`);
        }
        args.inlinePairs = pairs;
      }

      const redeployChoice = await prompt.confirm("Redeploy after saving env vars?", true);
      args.noRedeploy = !redeployChoice;
      await syncEnv(args);
      return;
    }

    if (action.value === "deploy") {
      args.force = await prompt.confirm("Force rebuild?", false);
      await redeploy(args);
      return;
    }

    if (action.value === "restart") {
      if (args.resourceType === "service") {
        args.latest = await prompt.confirm("Pull latest image first?", false);
      }
      await restart(args);
      return;
    }
  } finally {
    prompt.close();
  }
}

async function setup(args) {
  const prompt = createPrompt();

  try {
    console.log("EnovAIt Coolify setup");
    console.log("This configures an existing Coolify resource. If you have not created one yet, create the Docker Compose app first.");

    const apiUrl = await resolveApiUrl({ apiUrl: args.apiUrl, prompt, requireInteractive: true });
    const { token } = await resolveCredentials({ apiUrl, token: args.token, prompt, requireInteractiveToken: true });

    const resourceKind = await prompt.choose("What are you setting up?", [
      { label: "Main app / compose stack", value: "application" },
      { label: "A service resource", value: "service" },
    ]);
    args.resourceType = resourceKind.value;

    const resourceName = await prompt.ask("Coolify resource name", path.basename(process.cwd()));
    if (resourceName) args.resourceName = resourceName;
    await writeLocalProfile({
      ...(await readLocalProfile()),
      apiUrl,
      token,
      resourceType: args.resourceType,
      resourceName,
      envFile: args.file,
    });

    const discovered = await discoverEnvFiles();

    if (discovered.length === 1) {
      args.file = discovered[0];
      console.log(`Using detected env file: ${args.file}`);
    } else if (discovered.length > 1) {
      const envChoice = await prompt.choose("I found these env files. Which one should I use?", discovered.map((name) => ({
        label: name,
        value: name,
      })));
      args.file = envChoice.value;
    } else {
      const envMode = await prompt.choose("I could not find an env file. What do you want to do?", [
        { label: "Type a file path", value: "path" },
        { label: "Paste KEY=VALUE lines", value: "paste" },
        { label: "Skip env sync for now", value: "skip" },
      ]);

      if (envMode.value === "path") {
        args.file = await prompt.ask("Path to your env file", "coolify.env");
      } else if (envMode.value === "paste") {
        args.pastedText = await prompt.multiline("Paste your KEY=VALUE lines", "END");
      }
    }

    await writeLocalProfile({
      ...(await readLocalProfile()),
      apiUrl,
      token,
      resourceType: args.resourceType,
      resourceName,
      envFile: args.file,
    });

    const updateEnv = await prompt.confirm("Push env vars now?", true);
    const hasEnvSource = Boolean(args.file || args.stdin || args.inlinePairs.length > 0 || args.pastedText);

    if (updateEnv && !hasEnvSource) {
      const needSource = await prompt.choose("I still need an env source. What do you want to do?", [
        { label: "Pick a file now", value: "path" },
        { label: "Paste KEY=VALUE lines", value: "paste" },
        { label: "Skip env sync and deploy only", value: "skip" },
      ]);

      if (needSource.value === "path") {
        args.file = await prompt.ask("Path to your env file", "coolify.env");
      } else if (needSource.value === "paste") {
        args.pastedText = await prompt.multiline("Paste your KEY=VALUE lines", "END");
      } else {
        args.noRedeploy = false;
        await redeploy(args);
        return;
      }
    }

    if (!updateEnv) {
      const deployOnly = await prompt.confirm("Deploy or restart now anyway?", false);
      if (deployOnly) {
        await redeploy(args);
        return;
      }

      console.log("\nManual next steps:");
      console.log(`1. Open or create the Coolify ${args.resourceType} named "${resourceName}".`);
      console.log("2. Use docker-compose.coolify.yml from this repo.");
      console.log("3. Add the env vars from your env file.");
      console.log("4. Mount persistent storage at /data for Baileys sessions.");
      console.log("5. Assign the public domain:");
      console.log("   - app.enov360.com");
      console.log("6. Run: npx coolify env --name <your-resource-name> --file <your-env-file>");
      console.log("7. Run: npx coolify deploy --name <your-resource-name> --force");
      return;
    }

    args.noRedeploy = !(await prompt.confirm("Deploy or restart after env sync?", true));
    await syncEnv(args);
  } finally {
    prompt.close();
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || !args.command) {
    if (!args.command && process.stdin.isTTY) {
      await guided(args);
      return;
    }
    console.log(usage());
    return;
  }

  if (args.command === "env" && args.force) {
    args.allowPlaceholders = true;
  }

  if (args.command === "guided") {
    await guided(args);
    return;
  }

  if (args.command === "setup") {
    await setup(args);
    return;
  }

  if (args.command === "list") {
    const apiUrl = args.apiUrl ?? process.env.COOLIFY_API_URL ?? DEFAULT_API_URL;
    const token = args.token ?? process.env.COOLIFY_API_TOKEN;
    if (!token) throw new Error("Missing Coolify API token. Set COOLIFY_API_TOKEN or pass --token.");

    const prompt = createPrompt();
    try {
      const typeChoice = args.resourceType
        ? { value: args.resourceType }
        : await prompt.choose("Which resource type?", [
            { label: "Application", value: "application" },
            { label: "Service", value: "service" },
          ]);
      const resources = await listResources({ apiUrl, token, resourceType: typeChoice.value });
      if (resources.length === 0) {
        console.log(`No ${typeChoice.value}s found.`);
        return;
      }
      resources.forEach((resource) => {
        console.log(describeResource(resource, typeChoice.value));
      });
    } finally {
      prompt.close();
    }
    return;
  }

  if (args.command === "env") {
    await syncEnv(args);
    return;
  }

  if (args.command === "deploy") {
    await redeploy(args);
    return;
  }

  if (args.command === "restart") {
    await restart(args);
    return;
  }

  throw new Error(`Unknown command: ${args.command}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
