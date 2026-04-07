# Archon in EnovAIt

EnovAIt now includes a first-class Archon integration with:

- a vendored local Archon runtime under `vendor/archon`
- protected EnovAIt backend proxy endpoints at `/api/v1/archon/*`
- an Integrations page panel for checking Archon health and launching tasks

## What was added

- `GET /api/v1/archon/health`
  - checks whether EnovAIt can reach the configured Archon runtime
- `POST /api/v1/archon/tasks`
  - forwards orchestration tasks to Archon `POST /v1/tasks`

## Backend environment

Add these values to `packages/backend/.env`:

```env
ARCHON_BASE_URL=http://127.0.0.1:8000
ARCHON_API_TOKEN=your-archon-bearer-token
ARCHON_TIMEOUT_MS=20000
```

`ARCHON_API_TOKEN` should match a bearer token accepted by your Archon server. `ARCHON_BASE_URL`
must point at a running Archon API instance.

## Running the vendored Archon runtime

From `vendor/archon`:

```powershell
py -3 -m venv .venv
.venv\Scripts\Activate.ps1
pip install -e .
python -m archon.interfaces.api.server
```

By default Archon serves on `http://127.0.0.1:8000`.

## EnovAIt flow

1. Start Archon locally from `vendor/archon`.
2. Set `ARCHON_BASE_URL` and `ARCHON_API_TOKEN` in `packages/backend/.env`.
3. Start EnovAIt backend and UI.
4. Open the Integrations page and use the Archon orchestration panel.
