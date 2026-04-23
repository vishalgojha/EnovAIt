# Gemini Prompt: Build the EnovAIt Next.js UI

Use this as the source prompt for Gemini to generate a replacement frontend.

---

You are building the new EnovAIt frontend from scratch as a production-ready Next.js app.

## Product

EnovAIt is an India-first ESG / BRSR / enterprise operating model workspace.

The UI must replace the current Vite app and preserve the existing product structure:
- Dashboard
- AI Assistant
- Modules
- Templates
- Workflows
- Review Queue
- Records / Data
- Filings / Reports
- Channels
- Integrations
- WhatsApp Setup
- Platform Console
- Secrets Environment
- Settings
- Login / Signup / Setup wizard

## Tech Stack

Build with:
- Next.js 15+ App Router
- React 19-compatible patterns where appropriate
- TypeScript
- Tailwind CSS
- shadcn/ui or equivalent clean component primitives
- TanStack Query for client data fetching
- Zustand only if needed for client state
- Framer Motion only for purposeful motion

## Constraints

- Do not use a generic SaaS template aesthetic.
- The UI should feel intentional, premium, and enterprise-grade.
- Avoid washed-out contrast, low-opacity text, and generic purple defaults.
- Keep the theme aligned with the current brand:
  - off-white / deep charcoal / muted green accents
  - soft glass surfaces only where useful
  - strong legibility
- Make the app work well on desktop first, but keep mobile responsive.
- Preserve existing routes and page semantics as much as possible.
- Assume the backend API already exists and keep the API contract stable.
- Build against `https://api.enov360.com/api/v1` via an environment variable.

## Required Pages

Implement these route groups:
- `/` landing page
- `/login`
- `/signup`
- `/setup`
- `/dashboard`
- `/ai`
- `/modules`
- `/templates`
- `/workflow-rules`
- `/integrations`
- `/data`
- `/workflows`
- `/review`
- `/reports`
- `/channels`
- `/whatsapp-setup`
- `/email-templates`
- `/settings`
- `/platform`
- `/secrets`
- `/readiness`

## Layout

Use a persistent shell:
- left sidebar navigation
- top header with workspace identity, search, quick command, notifications, user menu
- content area with roomy spacing and responsive cards

## UI Requirements

- Build reusable components for:
  - cards
  - buttons
  - inputs
  - tables
  - dialogs
  - sidebars
  - breadcrumbs
  - badges
  - switches
  - command palette
- Include strong empty states, loading states, and error states.
- Add a polished modules page with clear cards and readable contrast.
- Ensure the dashboard surfaces key stats and activity.
- Keep auth and settings pages simple and usable.

## Data Integration

Assume the backend exposes REST endpoints under:
- `/api/v1/health`
- `/api/v1/...`

Use a configurable env var:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.enov360.com/api/v1
```

## Deliverables

Generate:
- a complete Next.js app structure
- reusable components
- page implementations for the routes above
- a clean API client layer
- auth/session scaffolding if needed
- a README with local dev and production build instructions

## Acceptance Criteria

- The app builds successfully in production.
- All routes render without runtime errors.
- The UI is visually cohesive and not washed out.
- The shell layout works across the whole app.
- The code is ready to be wired into Coolify.

When in doubt, prefer clean and shippable over over-engineered.
