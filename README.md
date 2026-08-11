# icons

A dynamic, database-backed icon library: a React component
(`@web-portfolio/icons`) and a Sanity Studio icon picker plugin
(`@web-portfolio/icons-sanity`), both built from one bundled registry, plus an
admin dashboard to manage icons and a public gallery to browse and copy them.

## Packages & apps

- `packages/db` — Drizzle schema + Turso/libSQL client (private, internal).
- `packages/core` — shared icon registry + the `generate-registry` build script
  (private, internal; bundled into the two published packages via tsup).
- `packages/react` — **`@web-portfolio/icons`**, published to npm. `<Icon
  name="react" />`.
- `packages/sanity-plugin` — **`@web-portfolio/icons-sanity`**, published to
  npm. A Sanity Studio input component for picking an icon by name.
- `apps/admin` — credential-gated CRUD dashboard for adding/editing/removing
  icons ([apps/admin/README setup](#local-development)).
- `apps/gallery` — public site to search, preview, and copy/download icons as
  SVG or PNG, modeled on [techicons.dev](https://techicons.dev).

## Attribution

The initial icon set (578 icons) is seeded from
[devicon](https://github.com/devicons/devicon) (MIT licensed).

## Local development

```bash
corepack enable pnpm
pnpm install
```

Each package/app that touches the database reads `TURSO_DATABASE_URL` /
`TURSO_AUTH_TOKEN`. Locally, just leave them unset — `packages/db`'s client
falls back to a local libSQL file (`file:./local.db`, relative to whichever
process's cwd), so nothing needs to be installed or provisioned to develop.

```bash
# One-time: create the schema and seed it from devicon
pnpm --filter @web-portfolio/icons-db db:migrate
pnpm --filter @web-portfolio/icons-db seed-devicon

# Build the registry the two published packages embed
pnpm generate-registry

# Run everything
pnpm dev     # turbo run dev — starts apps/admin and apps/gallery
pnpm test    # turbo run test — all packages/apps
pnpm build   # turbo run build
```

`apps/admin` and `apps/gallery` each need their own `.env.local` (see
`apps/admin/.env.example` / there's no separate example for gallery — it only
needs `TURSO_DATABASE_URL`) pointed at the **same** local db file, e.g.:

```
TURSO_DATABASE_URL=file:/absolute/path/to/icons/packages/db/local.db
```

`apps/admin` additionally needs `ADMIN_USER`, `ADMIN_PASSWORD_HASH` (generate
with `pnpm --filter admin hash-password '<password>'`), and `SESSION_SECRET`
(any long random string).

## Deploying

- **Database**: create a [Turso](https://turso.tech) database
  (`turso auth login && turso db create`), then set `TURSO_DATABASE_URL` /
  `TURSO_AUTH_TOKEN` wherever `apps/admin`, `apps/gallery`, and the
  `publish.yml` GitHub Actions secrets are configured.
- **apps/admin** and **apps/gallery**: deploy independently to Vercel (or any
  Next.js host). Set the env vars above per app.
- **Publishing the npm packages**: run the "Publish" GitHub Actions workflow
  (`.github/workflows/publish.yml`, manual `workflow_dispatch`). Needs repo
  secrets `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, and `NPM_TOKEN`.
