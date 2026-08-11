import { createDb, type Db } from '@web-portfolio/icons-db'

// See apps/gallery/lib/db.ts for why this is cached on globalThis rather
// than a plain module-level const.
declare global {
  var __iconsDb: Db | undefined
}

export const db: Db = globalThis.__iconsDb ?? (globalThis.__iconsDb = createDb())
