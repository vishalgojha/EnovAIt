# EnovAIt

EnovAIt is an India-first ESG and BRSR operations platform. It ingests evidence from WhatsApp, email, files, and system feeds, then turns that into reviewer queues, readiness tracking, and filing outputs.

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

Optional AI provider settings:

- `AI_PROVIDER=anthropic` with `ANTHROPIC_API_KEY`
- `AI_PROVIDER=openrouter` with `OPENROUTER_API_KEY`
- `AI_PROVIDER=openai_compatible` with `OPENAI_BASE_URL`

If you are setting this up by hand, the easiest path is to copy `packages/backend/.env.example` to `packages/backend/.env` and replace the placeholder values.

## Commands

Run the backend in one command:

```powershell
npm run backend
```

Run the backend in watch mode:

```powershell
npm run dev
```

Run the UI locally:

```powershell
npm run dev:ui
```

Build the backend:

```powershell
npm run build
```

Build the UI:

```powershell
npm run build:ui
```

## What This Includes

- ESG and BRSR evidence ingestion
- WhatsApp-based intake via supported providers
- reviewer workflows and readiness tracking
- subscription and seat management
- EnovAIt super admin controls
- Archon orchestration for longer reasoning tasks

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
