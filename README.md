# icons

An icon library: a React component (`@web-portfolio/icons`) and a Sanity
Studio icon picker plugin (`@web-portfolio/icons-sanity`), both built from one
bundled registry, plus a database-backed admin dashboard to manage icons and a
fully static public gallery to browse and copy them.

**Live gallery: [icons.getresume.dev](https://icons.getresume.dev)**

## Packages & apps

- `packages/db` — Drizzle schema + Turso/libSQL client (private, internal).
  Used by `apps/admin` and by the seed scripts — never by `apps/gallery` or
  the published npm packages at runtime.
- `packages/core` — shared icon registry + the `generate-registry` build script
  (private, internal; bundled into the two published packages via tsup, and
  imported directly by `apps/gallery`).
- `packages/react` — **`@web-portfolio/icons`**, published to npm. `<Icon
  name="react" />`.
- `packages/sanity-plugin` — **`@web-portfolio/icons-sanity`**, published to
  npm. A Sanity Studio input component for picking an icon by name.
- `apps/admin` — credential-gated CRUD dashboard for adding/editing/removing
  icons, backed by Turso ([apps/admin/README setup](#local-development)).
- `apps/gallery` — public site to search, preview, customize, and copy/download
  icons as SVG or PNG, modeled on [techicons.dev](https://techicons.dev).
  Deployed at [icons.getresume.dev](https://icons.getresume.dev).
  **Fully static** — built directly from `packages/core`'s bundled registry,
  no database at request time or build time. Admin edits show up here after
  the next `pnpm generate-registry` + redeploy, not live.

## Attribution

The icon set (633 icons) is seeded from three sources:

- [devicon](https://github.com/devicons/devicon) (MIT licensed) — 578 tech/tool
  logos. `pnpm --filter @web-portfolio/icons-db seed-devicon`
- [Material Symbols](https://github.com/marella/material-symbols) (Apache-2.0
  licensed) — 38 icons, split across two curated lists:
  - 34 communication, navigation/utility, and device/data icons (including
    Connected TV and a generic SQL/database glyph — neither devicon nor Simple
    Icons has a "SQL" brand mark, since SQL isn't a company).
    `pnpm --filter @web-portfolio/icons-db seed-material-icons`
  - 4 generic stand-ins (Bolt, Translate, Checklist, Gift) backing the
    portfolio site's feature-highlight row, which previously used Apple SF
    Symbols exported as local PNGs — not safe to trace or redistribute from an
    openly published MIT package.
    `pnpm --filter @web-portfolio/icons-db seed-portfolio-highlight-icons`
- [Simple Icons](https://simpleicons.org) (CC0-1.0, public domain) — 17 icons
  devicon doesn't cover, split across two curated lists:
  - 12 social platform logos (Instagram, YouTube, WhatsApp, etc. — devicon
    already has Facebook, Twitter, LinkedIn, GitHub, GitLab, Slack, and
    Behance). `pnpm --filter @web-portfolio/icons-db seed-social-icons`
  - 5 developer-tool/product brand logos (MCP, Google Analytics, LangChain,
    Ollama, Pydantic). `pnpm --filter @web-portfolio/icons-db seed-tool-icons`

Run all five with `pnpm --filter @web-portfolio/icons-db seed-all`.

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

`apps/admin` needs its own `.env.local` (see `apps/admin/.env.example`)
pointed at the local db file, e.g.:

```
TURSO_DATABASE_URL=file:/absolute/path/to/icons/packages/db/local.db
```

`apps/gallery` needs no env vars at all — it only ever reads
`packages/core/src/registry.generated.ts`, so as long as you've run
`pnpm generate-registry` at least once, `pnpm --filter gallery dev` works
with zero setup.

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

- **apps/gallery**: deploy to Vercel with **no environment variables at
  all**. Import the repo, set Root Directory to `apps/gallery`, deploy.
  It's a pure static build off the committed `registry.generated.ts` — no
  database, no Turso account needed. To publish a new icon set, run
  `pnpm generate-registry` against whichever database has the latest data
  and redeploy (or just let a normal push through CI regenerate it, since
  `ci.yml` already does this before every build).
- **apps/admin**: optional, and separate from the above — only needed if you
  want a hosted UI for editing icons instead of running it locally. Create a
  [Turso](https://turso.tech) database (`turso auth login && turso db
  create`) first, then deploy to Vercel with `TURSO_DATABASE_URL`,
  `TURSO_AUTH_TOKEN`, and the three [admin credential](#admin-credentials)
  env vars set.
- **Publishing the npm packages**: run the "Publish" GitHub Actions workflow
  (`.github/workflows/publish.yml`, manual `workflow_dispatch`). Needs repo
  secrets `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` (to regenerate the
  registry from the latest data before publishing), and `NPM_TOKEN`.
