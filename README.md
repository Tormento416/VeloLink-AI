# VeloLink-AI
VeloLinkAI is your local-business service offering. It builds websites from reusable frameworks, adapts them with each client’s approved assets, and adds human quality checks. The broader offer also includes managed AI receptionists and local SEO.

## Repo layout

| Path | What it is |
| --- | --- |
| `packages/core` | Section schemas (Zod), themes, templates, the renderer that turns site JSON into pages, and AI generation (`src/generation`: intake facts in, validated site out) |
| `apps/web` | Next.js app: builder UI, rep deal form, template previews |
| `supabase/migrations` | Database schema with row level security |

## Run it locally

```sh
pnpm install
pnpm check         # typecheck, all tests, and the web build (run before every push)
pnpm --filter @velolink/web dev   # http://localhost:3000, previews at /preview/<template-id>/<package>
```

Copy `.env.example` to `apps/web/.env.local` and fill in keys. Never commit real values.
