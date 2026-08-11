import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import type { Db } from './client'
import { icons, type Icon } from './schema'

export interface IconInput {
  name: string
  label: string
  svg: string
  tags?: string[]
  category?: string | null
}

export class DuplicateIconNameError extends Error {
  constructor(name: string) {
    super(`An icon named "${name}" already exists.`)
    this.name = 'DuplicateIconNameError'
  }
}

export async function listIcons(db: Db): Promise<Icon[]> {
  return db.select().from(icons).orderBy(icons.name)
}

export async function getIconByName(db: Db, name: string): Promise<Icon | undefined> {
  const rows = await db.select().from(icons).where(eq(icons.name, name)).limit(1)
  return rows[0]
}

export async function getIconById(db: Db, id: string): Promise<Icon | undefined> {
  const rows = await db.select().from(icons).where(eq(icons.id, id)).limit(1)
  return rows[0]
}

export async function createIcon(db: Db, input: IconInput): Promise<Icon> {
  const existing = await getIconByName(db, input.name)
  if (existing) throw new DuplicateIconNameError(input.name)

  const now = new Date()
  const row = {
    id: nanoid(),
    name: input.name,
    label: input.label,
    svg: input.svg,
    tags: JSON.stringify(input.tags ?? []),
    category: input.category ?? null,
    createdAt: now,
    updatedAt: now,
  }
  await db.insert(icons).values(row)
  return row
}

export async function updateIcon(
  db: Db,
  id: string,
  input: Partial<IconInput>,
): Promise<void> {
  if (input.name) {
    const existing = await getIconByName(db, input.name)
    if (existing && existing.id !== id) throw new DuplicateIconNameError(input.name)
  }

  await db
    .update(icons)
    .set({
      ...(input.name !== undefined && { name: input.name }),
      ...(input.label !== undefined && { label: input.label }),
      ...(input.svg !== undefined && { svg: input.svg }),
      ...(input.tags !== undefined && { tags: JSON.stringify(input.tags) }),
      ...(input.category !== undefined && { category: input.category }),
      updatedAt: new Date(),
    })
    .where(eq(icons.id, id))
}

export async function deleteIcon(db: Db, id: string): Promise<void> {
  await db.delete(icons).where(eq(icons.id, id))
}

/** Idempotent upsert keyed by `name`, used by the devicon seed script. */
export async function upsertIconByName(db: Db, input: IconInput): Promise<void> {
  const existing = await getIconByName(db, input.name)
  const now = new Date()

  if (existing) {
    await db
      .update(icons)
      .set({
        label: input.label,
        svg: input.svg,
        tags: JSON.stringify(input.tags ?? []),
        category: input.category ?? null,
        updatedAt: now,
      })
      .where(eq(icons.id, existing.id))
    return
  }

  await db.insert(icons).values({
    id: nanoid(),
    name: input.name,
    label: input.label,
    svg: input.svg,
    tags: JSON.stringify(input.tags ?? []),
    category: input.category ?? null,
    createdAt: now,
    updatedAt: now,
  })
}
