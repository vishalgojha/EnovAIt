# EnovAIt Handoff

Date: 2026-04-24

## Status

The repo has been trimmed to a Coolify-first deployment path, and the backend CI failure caused by missing frontend dependencies has been fixed locally.

Completed:
- Removed old Hetzner/Caddy/manual-deploy files.
- Added a guided Coolify CLI in `scripts/coolify.mjs`.
- Added a local profile shim so the CLI is callable from the repo root.
- Added `PROJECT_SNAPSHOT.md`.
- Committed and pushed the cleanup to `origin/main`.
- Added the frontend runtime packages required by the backend build.
- Verified `npm run typecheck`, `npm run test`, and `npm run build` in `packages/backend`.

Latest commits:
- `372e73c` `docs: add project snapshot`
- `3d7b529` `chore: simplify coolify deployment path`

## Current Deployment Model

- Coolify on Hetzner is the intended production path.
- Traefik is the public ingress.
- The backend serves on internal port `8080`.
- The UI is containerized and exposed through Coolify.

## Local CLI

Primary command:
```powershell
.\node_modules\.bin\coolify.cmd
```

Useful modes:
```powershell
.\node_modules\.bin\coolify.cmd setup
.\node_modules\.bin\coolify.cmd list --type application
.\node_modules\.bin\coolify.cmd env --name enovait --file coolify.env --type application
.\node_modules\.bin\coolify.cmd deploy --name enovait --type application --force
```

## Local Profile

The CLI stores a local profile at:
- `.coolify.local.json`

That file is gitignored and is meant to store:
- Coolify API URL
- Coolify API token
- default resource name/type
- env file path

## Pending Work

1. Commit and push the CI dependency fix.
2. Enter the real Coolify API URL for the Hetzner instance.
3. Enter the Coolify API token once and save it to the local profile.
4. Confirm the actual Coolify resource name for EnovAIt.
5. Run `.\node_modules\.bin\coolify.cmd setup`.
6. Deploy and verify:
   - `https://app.enov360.com`
   - `https://api.enov360.com/api/v1/health`

## Notes

- If the CLI reports `fetch failed`, the first thing to check is the saved Coolify API URL.
- The repo is currently not clean because the CI dependency fix and this handoff update are still unstaged.
- If anything needs rollback, the old file-based deployment path was intentionally removed and would need to be restored from git history.
