# EnovAIt Coolify + Traefik Migration

This project is currently deployed on Hetzner with:

- `Caddy` terminating HTTP/HTTPS and routing requests
- frontend files copied to `/opt/enovait/app`
- backend running as a host `systemd` service on port `3000`

For Coolify, the cleaner model is:

- `Coolify` manages deployment from the Git repo
- `Traefik` is the default proxy and terminates TLS
- frontend and backend run as containers
- host-level `Caddyfile` routing for EnovAIt is removed after cutover

Coolify documentation used for this setup:

- `https://coolify.io/docs/knowledge-base/docker/compose`
- `https://coolify.io/docs/knowledge-base/proxy/traefik/overview`
- `https://coolify.io/docs/knowledge-base/server/proxies`

## Files added

- `docker-compose.coolify.yml`
- `packages/ui/Dockerfile`

## Recommended target domains

- `app.enov360.com` -> `enovait-ui`
- `api.enov360.com` -> `enovait-api`

If you want a single domain later, keep the UI on the main host and route `/api` to the backend with custom Traefik labels or an edge proxy. For the first migration, separate subdomains are lower risk.

## How to deploy in Coolify

1. Push this repo to GitHub/GitLab.
2. In Coolify create a new `Docker Compose` application.
3. Point it at this repo and set the compose file to `docker-compose.coolify.yml`.
4. Do not set a separate Dockerfile location like `backend` or `ui` in the Coolify UI. In this repo those names are directories in generated deploy bundles, so Coolify will fail with `failed to read dockerfile ... is a directory`.
5. If you are deploying only the backend as a single Dockerfile app instead of Compose, keep the build context at the repo root and set the Dockerfile path to `packages/backend/Dockerfile`.
6. If you are deploying only the UI as a single Dockerfile app instead of Compose, keep the build context at the repo root and set the Dockerfile path to `packages/ui/Dockerfile`.
7. Add environment variables in Coolify for the backend service.
8. Assign domains in Coolify:
   - UI service: `https://app.enov360.com:3000`
   - API service: `https://api.enov360.com:8080`
9. Set `VITE_API_BASE_URL` in Coolify to `https://api.enov360.com/api/v1`.
10. The UI Dockerfile now installs from the workspace root `package-lock.json`, so keep the build context at the repo root.
10. Deploy and verify health checks.

Note: with Coolify compose deployments, the compose file is the source of truth for container config. Traefik is managed by Coolify, so you do not need the old Caddy routes for these domains.

Important: `VITE_API_BASE_URL` is consumed at frontend build time, not runtime. In this stack it is passed into the UI Docker build through a compose build arg. The UI build also relies on the repo root `package-lock.json`, not a package-local lockfile.

## DNS changes

Point your DNS records to the Hetzner server where Coolify runs:

- `app.enov360.com` A -> your Coolify server IP
- `api.enov360.com` A -> your Coolify server IP

Do not remove the current records until the Coolify deployment is healthy.

## Cutover steps

1. Deploy both services in Coolify and wait for healthy status.
2. Confirm:
   - `https://api.enov360.com/api/v1/health`
   - `https://app.enov360.com`
3. Update any frontend env or integrations that still reference the server IP.
4. Remove only the EnovAIt block from the host `Caddyfile`.
5. Stop and disable the old host service:
   - `systemctl stop enovait-api`
   - `systemctl disable enovait-api`
6. Remove old files from `/opt/enovait` only after rollback is no longer needed.

## Important security issue

The checked-in `enovait-api.service` contains live-looking secrets. Those values should not remain in the repository.

Recommended action:

1. Rotate the exposed credentials.
2. Remove secrets from committed service files.
3. Store secrets only in Coolify environment variables or a managed secret store.

## What you can remove after migration

After a successful cutover, these are no longer part of the main deployment path:

- `Caddyfile` entries for EnovAIt
- manual `scp` deployment scripts
- host `systemd` unit for EnovAIt backend
- static files under `/opt/enovait/app`

Keep them temporarily until rollback is no longer needed.
