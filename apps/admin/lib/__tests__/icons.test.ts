import { createDb, type Db } from '@web-portfolio/icons-db'
import { beforeEach, describe, expect, it } from 'vitest'
import { createIcon, deleteIcon, listIcons, updateIcon, ValidationError } from '../icons'

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

const validInput = {
  name: 'my-icon',
  label: 'My Icon',
  svg: '<svg viewBox="0 0 24 24"><path d="M0 0"/></svg>',
  tags: ['custom'],
}

describe('validateIconInput (via createIcon)', () => {
  it('rejects an uppercase or spaced name', async () => {
    await expect(createIcon(db, { ...validInput, name: 'My Icon' })).rejects.toThrow(
      ValidationError,
    )
  })

  it('rejects a name with leading/trailing hyphens', async () => {
    await expect(createIcon(db, { ...validInput, name: '-my-icon-' })).rejects.toThrow(
      ValidationError,
    )
  })

  it('accepts a valid lowercase-hyphenated name', async () => {
    await expect(createIcon(db, validInput)).resolves.toMatchObject({ name: 'my-icon' })
  })

  it('rejects an empty label', async () => {
    await expect(createIcon(db, { ...validInput, label: '   ' })).rejects.toThrow(ValidationError)
  })

  it('rejects markup without an <svg> element', async () => {
    await expect(createIcon(db, { ...validInput, svg: '<div>not svg</div>' })).rejects.toThrow(
      ValidationError,
    )
  })
})

describe('listIcons', () => {
  it('filters by name, label, or tag', async () => {
    await createIcon(db, validInput)
    await createIcon(db, { ...validInput, name: 'other', label: 'Other', tags: ['zzz'] })

    expect((await listIcons(db, 'my-icon')).map((i) => i.name)).toEqual(['my-icon'])
    expect((await listIcons(db, 'custom')).map((i) => i.name)).toEqual(['my-icon'])
    expect((await listIcons(db, undefined)).length).toBe(2)
  })
})

describe('updateIcon', () => {
  it('re-validates the merged result', async () => {
    const icon = await createIcon(db, validInput)
    await expect(updateIcon(db, icon.id, { label: '   ' })).rejects.toThrow(ValidationError)
  })

  it('applies a valid partial update', async () => {
    const icon = await createIcon(db, validInput)
    await updateIcon(db, icon.id, { label: 'Renamed' })

    const [found] = await listIcons(db)
    expect(found.label).toBe('Renamed')
  })

  it('throws for a nonexistent id', async () => {
    await expect(updateIcon(db, 'does-not-exist', { label: 'X' })).rejects.toThrow(
      ValidationError,
    )
  })
})

describe('deleteIcon', () => {
  it('removes the icon', async () => {
    const icon = await createIcon(db, validInput)
    await deleteIcon(db, icon.id)
    expect(await listIcons(db)).toHaveLength(0)
  })
})
