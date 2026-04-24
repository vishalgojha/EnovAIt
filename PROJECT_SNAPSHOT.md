# EnovAIt Project Snapshot

Date: 2026-04-24

## Current State

- Legacy Hetzner/Caddy/manual-deploy files have been removed.
- The repo now centers on Coolify-based deployment with Traefik.
- A guided Coolify CLI is available at `scripts/coolify.mjs`.
- The CLI can:
  - store a local Coolify profile
  - resolve resources by name
  - update env vars
  - deploy or restart resources
  - guide a non-technical operator through setup

## What Has Been Committed

- Commit: `3d7b529`
- Message: `chore: simplify coolify deployment path`

## Pending Work

- Enter the real Coolify API URL for your server.
- Save the real Coolify API token into the local profile when prompted.
- Confirm the Coolify application/service names for EnovAIt.
- Create or verify the Coolify resources on the Hetzner host.
- Run the guided setup from the project root:
  - `.\node_modules\.bin\coolify.cmd setup`
- Deploy and verify:
  - UI opens at `https://app.enov360.com`
  - API health responds at `https://api.enov360.com/api/v1/health`

## Notes

- The local token/profile file is gitignored as `.coolify.local.json`.
- The old file-based deployment path should not be reintroduced unless rollback is needed.
- If any deployment step fails, the first thing to check is `COOLIFY_API_URL`.
