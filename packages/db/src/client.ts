import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'

export interface CreateDbOptions {
  url?: string
  authToken?: string
}

/**
 * Falls back to a local libSQL file when Turso env vars are absent, so
 * tests and local dev never need a hosted database.
 */
export function createDb(options: CreateDbOptions = {}) {
  const url = options.url ?? process.env.TURSO_DATABASE_URL ?? 'file:./local.db'
  const authToken = options.authToken ?? process.env.TURSO_AUTH_TOKEN

  const client = createClient({ url, authToken })
  return drizzle(client, { schema })
}

export type Db = ReturnType<typeof createDb>
