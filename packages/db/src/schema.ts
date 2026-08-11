import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const icons = sqliteTable('icons', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  label: text('label').notNull(),
  svg: text('svg').notNull(),
  // JSON-encoded string[], e.g. '["frontend","framework"]'
  tags: text('tags').notNull().default('[]'),
  category: text('category'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

export type Icon = typeof icons.$inferSelect
export type NewIcon = typeof icons.$inferInsert
