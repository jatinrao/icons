# icons

A dynamic, database-backed icon library: a React component
(`@web-portfolio/icons`) and a Sanity Studio icon picker plugin
(`@web-portfolio/icons-sanity`), both built from one bundled registry, plus an
admin dashboard to manage icons and a public gallery to browse and copy them.

## Packages & apps

- `packages/db` — Drizzle schema + Turso/libSQL client (private, internal).
- `packages/core` — shared icon registry + the `generate-registry` build script
  (private, internal; bundled into the two published packages).
- `packages/react` — **`@web-portfolio/icons`**, published to npm. `<Icon
  name="react" />`.
- `packages/sanity-plugin` — **`@web-portfolio/icons-sanity`**, published to
  npm. A Sanity Studio input component for picking an icon by name.
- `apps/admin` — credential-gated CRUD dashboard for adding/editing/removing
  icons.
- `apps/gallery` — public site to search, preview, and copy/download icons as
  SVG or PNG.

## Attribution

The initial icon set is seeded from [devicon](https://github.com/devicons/devicon)
(MIT licensed).

## Development

```bash
corepack enable pnpm
pnpm install
cp .env.example .env.local   # fill in TURSO_DATABASE_URL / TURSO_AUTH_TOKEN
pnpm --filter @web-portfolio/icons-db seed-devicon
pnpm generate-registry
pnpm dev
pnpm test
```
