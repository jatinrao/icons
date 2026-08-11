import { beforeEach, describe, expect, it } from 'vitest'
import { createDb, type Db } from '../client'
import {
  createIcon,
  deleteIcon,
  DuplicateIconNameError,
  getIconByName,
  listIcons,
  updateIcon,
  upsertIconByName,
} from '../queries'

let db: Db

beforeEach(async () => {
  db = createDb({ url: ':memory:' })
  await db.run(`
    CREATE TABLE icons (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      label TEXT NOT NULL,
      svg TEXT NOT NULL,
      tags TEXT NOT NULL DEFAULT '[]',
      category TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `)
})

const sample = {
  name: 'react',
  label: 'React',
  svg: '<svg viewBox="0 0 24 24"><path d="M0 0"/></svg>',
  tags: ['frontend', 'framework'],
}

describe('createIcon', () => {
  it('inserts a new icon', async () => {
    const icon = await createIcon(db, sample)
    expect(icon.name).toBe('react')

    const found = await getIconByName(db, 'react')
    expect(found?.label).toBe('React')
    expect(JSON.parse(found?.tags ?? '[]')).toEqual(['frontend', 'framework'])
  })

  it('rejects a duplicate name', async () => {
    await createIcon(db, sample)
    await expect(createIcon(db, sample)).rejects.toThrow(DuplicateIconNameError)
  })
})

describe('updateIcon', () => {
  it('updates fields and bumps updatedAt', async () => {
    const icon = await createIcon(db, sample)
    await updateIcon(db, icon.id, { label: 'React.js' })

    const found = await getIconByName(db, 'react')
    expect(found?.label).toBe('React.js')
  })

  it('rejects renaming into an existing name', async () => {
    await createIcon(db, sample)
    const other = await createIcon(db, { ...sample, name: 'vue', label: 'Vue' })

    await expect(updateIcon(db, other.id, { name: 'react' })).rejects.toThrow(
      DuplicateIconNameError,
    )
  })
})

describe('deleteIcon', () => {
  it('removes the row', async () => {
    const icon = await createIcon(db, sample)
    await deleteIcon(db, icon.id)

    expect(await getIconByName(db, 'react')).toBeUndefined()
  })
})

describe('listIcons', () => {
  it('returns icons ordered by name', async () => {
    await createIcon(db, { ...sample, name: 'vue', label: 'Vue' })
    await createIcon(db, sample)

    const all = await listIcons(db)
    expect(all.map((i) => i.name)).toEqual(['react', 'vue'])
  })
})

describe('upsertIconByName', () => {
  it('creates on first call, updates on second (idempotent)', async () => {
    await upsertIconByName(db, sample)
    await upsertIconByName(db, { ...sample, label: 'React (updated)' })

    const all = await listIcons(db)
    expect(all).toHaveLength(1)
    expect(all[0].label).toBe('React (updated)')
  })
})
