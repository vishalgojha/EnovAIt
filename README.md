# EnovAIt

EnovAIt is an India-first ESG and BRSR operations platform. It ingests evidence from WhatsApp (Baileys), email, files, and system feeds, then turns that into reviewer queues, readiness tracking, and filing outputs.

## Quick Start

If you are not the person setting up the server, the short version is:

1. Ask them to prepare the EnovAIt backend settings file.
2. Ask them to add the Supabase connection details.
3. Ask them to add one AI provider key if assistant features are needed.
4. Ask them to start the backend and open the app.

If you are the setup person, the backend settings file lives at:

- `packages/backend/.env`

It must include these required values:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`

Optional AI provider settings (Primary → Fallback):

- `AI_PROVIDER=gemini` with `GEMINI_API_KEY` (Primary - supports PDF input)
- `AI_PROVIDER=groq` with `GROQ_API_KEY` (Secondary)
- `AI_PROVIDER=openrouter` with `OPENROUTER_API_KEY` (Fallback)

For AI agent tools (MCP), also add:

- `SUPABASE_ACCESS_TOKEN` - Personal access token from https://supabase.com/dashboard/account/tokens
- `SUPABASE_PROJECT_REF` - Your project ref (e.g., `xfkfzpldrwdcjmzzwymz`)

If you are setting this up by hand, the easiest path is to copy `packages/backend/.env.example` to `packages/backend/.env` and replace the placeholder values.

## Commands

**Prerequisites:**
- Node.js 20+
- Supabase project (https://supabase.com)
- Gemini API key (https://aistudio.google.com/apikey)

**Local Development:**

```powershell
# Install dependencies
npm run install:all

# Run backend in dev mode (with hot reload)
npm run dev:backend

# Run UI locally
npm run dev:ui

# Or run both with one command
npm run dev
```

**Production Build:**

```powershell
# Build backend
cd packages/backend; npm run build

# Build UI
cd packages/ui; npm run build
```

**Using Docker (Coolify / Self-hosted):**

```powershell
# Build with Docker Compose
docker compose -f docker-compose.coolify.yml --env-file server-env.env up -d --force-recreate

# Or let Coolify handle it automatically via git push
git push origin main
```

## WhatsApp Integration

EnovAIt uses **WhatsApp Baileys** for messaging:

- QR code login via `/api/v1/channels/whatsapp/status`
- Session persisted in `/data/baileys`
- No Meta Business account required

## AI Agent Capabilities

The AI assistant uses **function calling** via Supabase MCP tools:

- Database: `execute_sql`, `list_tables`, `apply_migration`
- Debugging: `get_logs`, `get_advisors`
- Edge Functions: `list_edge_functions`, `deploy_edge_function`
- Documentation: `search_docs`
- Project Management: `list_projects`, `create_project`

**Supported AI Models:**
- **Gemini 2.5 Flash** (Primary - supports PDF input)
- **Groq** (Secondary - `llama-3.3-70b-versatile`)
- **OpenRouter** (Fallback - `openrouter/free`)

## Roles & Permissions (RBAC)

EnovAIt includes role-based access control for ESG reporting:

| Role | Access Level |
|------|--------------|
| `cso` (Chief Sustainability Officer) | Full ESG access |
| `senior_manager` | Review & assign, no final approval |
| `owner` / `admin` | Full platform access |
| `manager` / `c_env_officer` | Review workflows |
| `member` / `viewer` | Limited / view-only |

## What This Includes

- ESG and BRSR evidence ingestion
- WhatsApp Baileys-based intake
- Reviewer workflows and readiness tracking
- Supabase MCP tools for AI agent
- Role-based access control (RBAC)
- EnovAIt super admin controls

## Demo Notes

For the April 10 demo, the product should be presented as a live ESG operations system, not a generic chatbot. The flow is:

1. Teams send daily or weekly ESG evidence.
2. EnovAIt ingests and classifies it.
3. Reviewers handle exceptions.
4. Leadership sees readiness before audit time.

## Plain-English Setup

If you are not technical, the main thing to remember is:

1. Someone needs to place the secret keys into the backend settings file.
2. Someone needs to start the backend service.
3. Someone needs to open the EnovAIt app in the browser.

After that, the product is ready for use.
