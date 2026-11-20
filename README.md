# VeloLinkAI

VeloLinkAI helps local businesses modernize their web presence with reusable website frameworks, human-reviewed content migration, managed AI receptionists, and local SEO services.

- Public site: https://velolinkai.com
- Rep workspace: https://internal.velolinkai.com/builder
- Lovable project: https://lovable.dev/projects/7af3572d-87ff-40ee-8624-bf2f870ae458

## Stack

- TanStack Start and React
- TypeScript and Tailwind CSS
- Supabase/PostgreSQL
- WorkOS authentication for the private rep workspace
- Vitest

## Development

```sh
bun install
bun run dev
```

Verification:

```sh
bun run lint
bun run test
bun run build
```

Copy `.env.example` to a local environment file and supply values through the local environment or deployment platform. Never commit real credentials or tokens.

## Branch and release workflow

1. All work begins on `development`.
2. Run build, lint, tests, and preview checks on `development`.
3. Review and merge approved changes into `main`.
4. Production is published only from the approved `main` release.

Do not commit directly to `main` or publish unreviewed development work.
