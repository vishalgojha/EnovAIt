#!/usr/bin/env node

import { runCoolifyEnvSync, callCoolifyApi } from "./coolify-common.mjs";
import { REQUIRED_ENV_KEYS, selectKeysFromEnvMap } from "./coolify-presets.mjs";

function usage() {
  return [
    "Usage:",
    "  npm run coolify:sync-required-env -- --uuid <resource-uuid> --file <env-file> [--type application|service]",
    "",
    "This command syncs only the core required vars from a local env file.",
  ].join("\n");
}

async function main() {
  const result = await runCoolifyEnvSync({
    argv: process.argv.slice(2),
    defaults: { resourceType: "application", restart: true, allowPlaceholders: false },
    usage,
    envFileDefault: "server-env.env",
    selectEntries: ({ envMap, args, isPlaceholderValue }) => {
      const { selected, missing } = selectKeysFromEnvMap({
        envMap,
        keys: REQUIRED_ENV_KEYS,
        allowPlaceholders: args.allowPlaceholders,
        isPlaceholderValue,
      });

      if (missing.length > 0) {
        console.log(`Skipping missing required entries in file: ${missing.join(", ")}`);
      }
      return selected;
    },
  });

  if (!result) return;

  const { args, apiUrl, resourceType, resourceUuid, payload } = result;

  console.log(`Syncing ${payload.data.length} required env vars from ${result.envFile} to ${resourceType} ${resourceUuid} via ${apiUrl}`);

  if (args.dryRun) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  await callCoolifyApi({ apiUrl, token: args.token ?? process.env.COOLIFY_API_TOKEN, method: "PATCH", resourceType, resourceUuid, suffix: "/envs/bulk", body: payload });
  console.log("Required environment variables updated.");

  if (args.restart) {
    await callCoolifyApi({ apiUrl, token: args.token ?? process.env.COOLIFY_API_TOKEN, method: "GET", resourceType, resourceUuid, suffix: "/restart" });
    console.log("Restart queued.");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
