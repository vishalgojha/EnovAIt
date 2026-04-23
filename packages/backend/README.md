# EnovAIt Backend

Production-ready Node.js + TypeScript backend for EnovAIt: conversational enterprise data collection, workflow automation, and real-time reporting on Supabase.

## 1) Project Folder Structure

```text
enovait-backend/
|-- .env.example
|-- package.json
|-- tsconfig.json
|-- README.md
|-- supabase/
|   |-- schema.sql
|   `-- seed/
|       `-- seed.sql
`-- src/
    |-- app.ts
    |-- index.ts
    |-- config.ts
    |-- api/
    |   |-- controllers/
    |   |   |-- adminController.ts
    |   |   |-- chatController.ts
    |   |   |-- dataController.ts
    |   |   |-- healthController.ts
    |   |   |-- reportController.ts
    |   |   `-- workflowController.ts
    |   |-- middlewares/
    |   |   |-- errorHandler.ts
    |   |   |-- notFound.ts
    |   |   |-- requireAdmin.ts
    |   |   `-- requireAuth.ts
    |   |-- routes/
    |   |   |-- adminRoutes.ts
    |   |   |-- chatRoutes.ts
    |   |   |-- dataRoutes.ts
    |   |   |-- healthRoutes.ts
    |   |   |-- reportRoutes.ts
    |   |   |-- v1Router.ts
    |   |   `-- workflowRoutes.ts
    |   `-- schemas/
    |       |-- adminSchemas.ts
    |       |-- chatSchemas.ts
    |       |-- dataSchemas.ts
    |       |-- reportSchemas.ts
    |       `-- workflowSchemas.ts
    |-- lib/
    |   |-- asyncHandler.ts
    |   |-- errors.ts
    |   |-- logger.ts
    |   |-- requestContext.ts
    |   `-- supabase.ts
    |-- services/
    |   |-- ai/
    |   |   |-- openaiProvider.ts
    |   |   |-- providerFactory.ts
    |   |   `-- types.ts
    |   |-- chat/
    |   |   `-- chatService.ts
    |   |-- ingestion/
    |   |   `-- excelIngestionService.ts
    |   |-- reporting/
    |   |   `-- reportService.ts
    |   `-- workflow/
    |       `-- workflowEngine.ts
    `-- types/
        |-- auth.ts
        `-- express.d.ts
```

## 2) `.env.example`

```env
NODE_ENV=development
PORT=8080

SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

AI_PROVIDER=openai
OPENAI_API_KEY=your-openai-api-key
AI_MODEL=gpt-4o-mini

LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=120

WEBHOOK_SIGNING_SECRET=replace-me
```

## 3) Database Schema + RLS

- Full schema is in `supabase/schema.sql`
- Seed data is in `supabase/seed/seed.sql`
- Includes:
  - multi-tenant tables (`organizations`, `users`, `modules`, `chat_sessions`, `messages`, `extracted_data`, `data_records`, `workflow_rules`, `workflow_instances`, `reports`, `templates`, `integrations`, `notifications`, `workflow_events`)
  - audit/version fields on all core tables (`created_by`, `updated_by`, `created_at`, `updated_at`, `version`)
  - indexes + JSONB GIN indexes
  - reporting views (`v_esg_summary`, `v_operations_dashboard`) + materialized view (`mv_module_record_counts`)
  - org-scoped Row Level Security policies using `current_org_id()` and `is_org_admin()`

## Architecture (Text Diagram)

```text
Client (Web/Mobile)
  -> POST /api/v1/chat/message
    -> Auth middleware (Supabase JWT)
      -> chatService
        -> persist message (messages)
        -> AI provider (structured output)
        -> persist extraction (extracted_data)
        -> upsert clean record (data_records)
        -> workflowEngine (workflow_rules -> workflow_instances)
        -> assistant response (messages)

Reporting APIs
  -> views/materialized views + reports snapshots

Realtime
  -> Supabase Realtime on postgres_changes for messages, workflow_instances, reports
```

## Setup

1. Create a Supabase project.
2. Copy env file:
   - `cp .env.example .env` (or create manually on Windows).
3. Fill all required env vars.
4. Install dependencies:
   - `npm install`
5. Apply DB schema:
   - `supabase db push` (or run `supabase/schema.sql` directly in SQL editor)
6. Seed demo data:
   - run `supabase/seed/seed.sql`
7. Start backend:
   - `npm run dev`

## Migration Workflow (Supabase CLI)

1. `supabase migration new init_enovait_backend`
2. copy `supabase/schema.sql` into generated migration SQL
3. `supabase db push`
4. `supabase migration list`

## API Surface (`/api/v1/*`)

Public:
- `GET /api/v1/health`

Protected (Supabase JWT required):
- `POST /api/v1/chat/message`
- `GET /api/v1/data/records`
- `GET /api/v1/data/records/:id`
- `POST /api/v1/data/ingest/excel` (multipart, `file`, `module_id`)
- `GET /api/v1/workflows/instances/:id`
- `POST /api/v1/workflows/instances/:id/transition`
- `POST /api/v1/reports/generate`
- `GET /api/v1/reports/:id`
- `GET/POST/PUT /api/v1/admin/modules*`
- `GET/POST/PUT /api/v1/admin/templates*`
- `GET/POST/PUT /api/v1/admin/workflow-rules*`
- `GET/PUT /api/v1/admin/settings`

## Core Chat + Extraction Flow

1. Save incoming user message.
2. Load recent conversation + module template context.
3. Run AI structured extraction (JSON schema mode).
4. Save `extracted_data` with completeness + missing fields.
5. If complete:
   - upsert `data_records`
   - evaluate and trigger `workflow_rules`.
6. Save assistant response (clarifying question or completion acknowledgement).

## SFIL ESG Report Type (Trained Template)

The seed now includes a default ESG annual template named:
- `SFIL ESG Annual Report Intake (Food-People-Planet-Governance)`

It is aligned to the report structure used in `SFIL-ESG Report 2023-24` with:
- sectioned extraction (`food`, `people`, `planet`, `governance`)
- KPI-focused highlights (Scope 1/2, intensity, training coverage, recycling, governance)
- framework alignment (`BRSR`, `GRI`, `SASB`) and assurance summary fields

To apply it:
1. Run `supabase/seed/seed.sql` again.
2. Start an ESG chat session; the default active ESG template will be this annual profile.

## Notes for Production Hardening

- Add provider adapters for Anthropic/Grok in `src/services/ai`.
- Move workflow notification side effects to queue/worker for high throughput.
- Add automated tests for RLS and extraction correctness.
- Upgrade to `multer` 2.x when compatible in your deployment context.

## CI/CD (GitHub Actions)

The repo now includes:
- `.github/workflows/ci.yml`: runs on push/PR and executes `npm ci`, `npm run typecheck`, `npm run build`, and critical production audit.
- `.github/workflows/cd.yml`: runs on `main` (or manually) and:
  - builds + pushes Docker image to GHCR: `ghcr.io/<owner>/<repo>`
  - optionally triggers deploy webhook if configured.

### Required/Optional GitHub Secrets

Optional for CD deploy trigger:
- `DEPLOY_WEBHOOK_URL`: your hosting provider deploy webhook URL (Railway/Render/Fly/etc.)

No PAT is needed for GHCR when using default `GITHUB_TOKEN` in this workflow.

## Docker Deployment

- Build locally:
  - from the repo root: `docker build -f packages/backend/Dockerfile -t enovait-backend:latest .`
- Run locally:
  - `docker run --env-file .env -p 8080:8080 enovait-backend:latest`

The Docker setup uses a multi-stage build and runs compiled `dist/index.js` in production mode. The Docker build context must be the repo root because the Dockerfile copies files from `packages/backend/...`.

## New AI Provider Options

Set `AI_PROVIDER` to one of:
- `openai`
- `anthropic`
- `openrouter`

Provider envs:
- OpenAI: `OPENAI_API_KEY`, optional `OPENAI_MODEL`
- Anthropic: `ANTHROPIC_API_KEY`, optional `ANTHROPIC_MODEL`
- OpenRouter: `OPENROUTER_API_KEY`, optional `OPENROUTER_MODEL`, optional `OPENROUTER_SITE_URL`, `OPENROUTER_APP_NAME`

## WhatsApp Integration Channels

### Authenticated channel endpoints
- `POST /api/v1/channels/whatsapp/send`
  - body: `{ "provider": "official" | "baileys", "to": "<phone>", "message": "<text>" }`
- `GET /api/v1/channels/whatsapp/baileys/status`

### Public webhook endpoint (Meta Official API)
- `GET /api/v1/channels/whatsapp/official/webhook` (verification)
- `POST /api/v1/channels/whatsapp/official/webhook` (events)

### Admin integration config endpoints
- `GET /api/v1/admin/integrations`
- `POST /api/v1/admin/integrations`
- `PUT /api/v1/admin/integrations/:id`

Supported integration types now include:
- `whatsapp_official`
- `whatsapp_baileys`

## Full Channel Matrix (Implemented)

Supported channels:
- `whatsapp_official`
- `whatsapp_baileys`
- `email`
- `slack`
- `msteams`
- `web_widget`
- `mobile_sdk`
- `sms`
- `voice_ivr`
- `iot_mqtt`
- `erp_crm`
- `api_partner`

Unified channel APIs:
- `POST /api/v1/channels/send`
- `GET /api/v1/channels/status/:channel`
- `POST /api/v1/channels/webhooks/:channel` (public, optional `x-channel-webhook-token`)

Backward-compatible WhatsApp APIs still work:
- `POST /api/v1/channels/whatsapp/send`
- `GET /api/v1/channels/whatsapp/baileys/status`
- `GET/POST /api/v1/channels/whatsapp/official/webhook`

## Security + Reliability Hardening (Implemented)

- Tenant-aware API rate limiting:
  - Global API limiter + tenant/user-scoped limiter (`tenant:<org_id>:user:<user_id>:ip:<ip>`)
  - Per-tenant override support via `RATE_LIMIT_TENANT_OVERRIDES_JSON`
- Input sanitization middleware:
  - Recursive sanitization for request body/query using `xss`
- Webhook signature verification:
  - HMAC SHA-256 validation using raw payload body
  - Supports `x-webhook-signature-sha256`, `x-signature`, `x-hub-signature-256`, `x-razorpay-signature`
- AI retry policy:
  - Exponential backoff + jitter (`AI_RETRY_ATTEMPTS`, `AI_RETRY_BASE_MS`)
- AI failure tracking:
  - `ai_failures` table + RLS policy + indexes
  - Chat extraction failures logged for monitoring and alerting pipelines
- Prompt-injection guardrail:
  - Heuristic detection blocks high-risk instruction-manipulation inputs before extraction
