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

The icon set (629 icons) is seeded from three sources:

- [devicon](https://github.com/devicons/devicon) (MIT licensed) — 578 tech/tool
  logos. `pnpm --filter @web-portfolio/icons-db seed-devicon`
- [Material Symbols](https://github.com/marella/material-symbols) (Apache-2.0
  licensed) — 34 curated communication, navigation/utility, and device/data
  icons (including Connected TV and a generic SQL/database glyph — neither
  devicon nor Simple Icons has a "SQL" brand mark, since SQL isn't a company).
  `pnpm --filter @web-portfolio/icons-db seed-material-icons`
- [Simple Icons](https://simpleicons.org) (CC0-1.0, public domain) — 17 icons
  devicon doesn't cover, split across two curated lists:
  - 12 social platform logos (Instagram, YouTube, WhatsApp, etc. — devicon
    already has Facebook, Twitter, LinkedIn, GitHub, GitLab, Slack, and
    Behance). `pnpm --filter @web-portfolio/icons-db seed-social-icons`
  - 5 developer-tool/product brand logos (MCP, Google Analytics, LangChain,
    Ollama, Pydantic). `pnpm --filter @web-portfolio/icons-db seed-tool-icons`

Run all four with `pnpm --filter @web-portfolio/icons-db seed-all`.

Not every requested icon has a licensed source to pull from: **Segment,
Statsig, and Google Stitch** aren't in devicon, Material Symbols, or Simple
Icons (Google Stitch in particular is too new — released after all three
sources' latest releases). Add them manually via `apps/admin`'s "paste raw
SVG" flow if needed, rather than scraping brand assets without a clear
redistribution license.

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
# One-time: create the schema and seed all three icon sources
pnpm --filter @web-portfolio/icons-db db:migrate
pnpm --filter @web-portfolio/icons-db seed-all

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

### Admin credentials

`apps/admin` additionally needs three env vars, none of which are ever
committed to this repo:

- `ADMIN_USER` — whatever username you want to log in with (e.g. `admin`).
- `ADMIN_PASSWORD_HASH` — **not** the password itself, its scrypt hash.
  Generate it from a password of your choosing:

  ```bash
  cd apps/admin
  pnpm hash-password '<your password>'
  # -> prints something like  a1b2c3...:d4e5f6...
  ```

  Paste that output as `ADMIN_PASSWORD_HASH`. Save the actual password
  somewhere (password manager) — it's only usable once as input to the
  command above, and there's no way to recover it from the hash.
- `SESSION_SECRET` — any long random string, used to sign the login session
  cookie:

  ```bash
  openssl rand -hex 32
  ```

Add all three to `apps/admin/.env.local` for local dev, and to your
deployment host's env vars (e.g. Vercel project settings) for production —
never to a file that gets committed.

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
