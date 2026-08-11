import { migrate } from 'drizzle-orm/libsql/migrator'
import { createDb } from '../src/client'

async function main() {
  const db = createDb()
  await migrate(db, { migrationsFolder: new URL('../drizzle', import.meta.url).pathname })
  console.log('Migrations applied.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
