# EnovAIt Coolify + Traefik Migration

This project is currently deployed on Hetzner with:

- `Caddy` terminating HTTP/HTTPS and routing requests
- frontend files copied to `/opt/enovait/app`
- backend running as a host `systemd` service on port `8080`

For Coolify, the cleaner model is:

- `Coolify` manages deployment from the Git repo
- `Traefik` is the default proxy and terminates TLS
- EnovAIt runs as one container from `packages/backend`, serving the UI and API together
- host-level Caddy routing for EnovAIt is removed after cutover

Coolify documentation used for this setup:

- `https://coolify.io/docs/knowledge-base/docker/compose`
- `https://coolify.io/docs/knowledge-base/proxy/traefik/overview`
- `https://coolify.io/docs/knowledge-base/server/proxies`

## Files used for deployment

- `docker-compose.coolify.yml`
- `packages/backend/Dockerfile`

## Recommended target domain

- `app.enov360.com` -> `enovait`

The app already serves its API from the same container, so `/api/v1` stays on the same host. That keeps login, cookies, and WhatsApp pairing simpler.

## How to deploy in Coolify

1. Push this repo to GitHub/GitLab.
2. In Coolify create a new `Docker Compose` application.
3. Point it at this repo and set the compose file to `docker-compose.coolify.yml`.
4. Do not set a separate Dockerfile location like `backend` or `ui` in the Coolify UI. In this repo those names are directories in generated deploy bundles, so Coolify will fail with `failed to read dockerfile ... is a directory`.
5. Add environment variables in Coolify for the app service.
6. Add a persistent volume mounted at `/data` so Baileys sessions survive container restarts.
7. Assign the public domain in Coolify:
   - `https://app.enov360.com`
8. Deploy and verify health checks.

Note: with Coolify compose deployments, the compose file is the source of truth for container config. Traefik is managed by Coolify, so you do not need the old Caddy routes for this domain. Public access still happens on `80` and `443`; `8080` is only the internal container port.

## DNS changes

Point your DNS record to the Hetzner server where Coolify runs:

- `app.enov360.com` A -> your Coolify server IP

Do not remove the current records until the Coolify deployment is healthy.

## Cutover steps

1. Deploy the app in Coolify and wait for healthy status.
2. Confirm:
   - `https://app.enov360.com`
   - `https://app.enov360.com/api/v1/health`
3. Update any frontend env or integrations that still reference the server IP.
4. Remove the old host routing and service setup after Coolify is healthy.
5. Stop and disable the old host service:
   - `systemctl stop enovait-api`
   - `systemctl disable enovait-api`
6. Remove old files from `/opt/enovait` only after rollback is no longer needed.

## Important security issue

The old host service file pattern contained live-looking secrets. Those values should not remain in any tracked deployment artifact.

Recommended action:

1. Rotate the exposed credentials.
2. Remove secrets from committed service files.
3. Store secrets only in Coolify environment variables or a managed secret store.

## What you can remove after migration

After a successful cutover, these are no longer part of the main deployment path:

- manual `scp` deployment scripts
- host `systemd` unit for EnovAIt backend
- static files under `/opt/enovait/app`

Keep them temporarily until rollback is no longer needed.
