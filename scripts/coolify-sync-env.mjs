#!/usr/bin/env node

import { runCoolifyEnvSync, callCoolifyApi } from "./coolify-common.mjs";

function usage() {
  return [
    "Usage:",
    "  npm run coolify:sync-env -- --uuid <resource-uuid> --file <env-file> [--type application|service]",
    "",
    "Required:",
    "  --uuid                Coolify application or service UUID",
    "  --file                Path to a local .env file with real values",
    "",
    "Optional:",
    "  --type                application (default) or service",
    "  --api-url             Coolify API base URL, default http://127.0.0.1:8000/api/v1",
    "  --token                Coolify API token",
    "  --no-restart          Skip the restart call after syncing",
    "  --dry-run             Print payloads without calling the API",
    "  --allow-placeholders   Permit .example files and placeholder values",
  ].join("\n");
}

async function main() {
  const result = await runCoolifyEnvSync({
    argv: process.argv.slice(2),
    defaults: { resourceType: "application", restart: true, allowPlaceholders: false },
    usage,
    envFileDefault: "coolify.env",
    selectEntries: ({ envMap, args, isPlaceholderValue }) =>
      [...envMap.entries()]
        .filter(([, value]) => (args.allowPlaceholders ? true : !isPlaceholderValue(value)))
        .map(([key, value]) => ({ key, value })),
  });

  if (!result) return;

  const { args, apiUrl, resourceType, resourceUuid, payload } = result;

  console.log(`Syncing ${payload.data.length} env vars from ${result.envFile} to ${resourceType} ${resourceUuid} via ${apiUrl}`);

  if (args.dryRun) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  await callCoolifyApi({ apiUrl, token: args.token ?? process.env.COOLIFY_API_TOKEN, method: "PATCH", resourceType, resourceUuid, suffix: "/envs/bulk", body: payload });
  console.log("Environment variables updated.");

  if (args.restart) {
    await callCoolifyApi({ apiUrl, token: args.token ?? process.env.COOLIFY_API_TOKEN, method: "GET", resourceType, resourceUuid, suffix: "/restart" });
    console.log("Restart queued.");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
