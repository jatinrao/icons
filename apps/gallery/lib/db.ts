import { createDb, type Db } from '@web-portfolio/icons-db'

// Next.js's App Router can instantiate this module more than once across
// compiled "layers" (RSC/SSR/metadata) within the same process. A plain
// `export const db = createDb()` would then open multiple concurrent
// connections to the same local libSQL file, which raced and intermittently
// produced "no such table" during static generation. Cache on `globalThis`
// so every layer shares one real connection — the same pattern used for
// Prisma clients in dev to survive module re-evaluation.
declare global {
  var __iconsDb: Db | undefined
}

export const db: Db = globalThis.__iconsDb ?? (globalThis.__iconsDb = createDb())
