import { createDb, type Db } from '@web-portfolio/icons-db'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  createIcon,
  deleteIcon,
  formatCategoryLabel,
  getCategories,
  listIcons,
  updateIcon,
  ValidationError,
} from '../icons'

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

  it('accepts an underscore-separated name (Material Symbols convention)', async () => {
    await expect(
      createIcon(db, { ...validInput, name: 'arrow_back' }),
    ).resolves.toMatchObject({ name: 'arrow_back' })
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

  it('filters by category', async () => {
    await createIcon(db, { ...validInput, name: 'a', category: 'material' })
    await createIcon(db, { ...validInput, name: 'b', category: 'social' })

    expect((await listIcons(db, undefined, 'material')).map((i) => i.name)).toEqual(['a'])
    expect((await listIcons(db, undefined, 'social')).map((i) => i.name)).toEqual(['b'])
  })

  it('treats "all" the same as no category filter', async () => {
    await createIcon(db, { ...validInput, name: 'a', category: 'material' })
    await createIcon(db, { ...validInput, name: 'b', category: 'social' })

    expect((await listIcons(db, undefined, 'all')).length).toBe(2)
  })

  it('combines the query and category filters', async () => {
    await createIcon(db, { ...validInput, name: 'mail', label: 'Mail', category: 'material' })
    await createIcon(db, { ...validInput, name: 'discord', label: 'Discord', category: 'social' })

    expect((await listIcons(db, 'mail', 'social')).length).toBe(0)
    expect((await listIcons(db, 'mail', 'material')).map((i) => i.name)).toEqual(['mail'])
  })
})

describe('getCategories', () => {
  it('returns distinct, sorted, non-null categories', () => {
    const icons = [
      { category: 'plain' },
      { category: 'social' },
      { category: null },
      { category: 'plain' },
      { category: 'material' },
    ]
    expect(getCategories(icons)).toEqual(['material', 'plain', 'social'])
  })
})

describe('formatCategoryLabel', () => {
  it('title-cases and replaces separators with spaces', () => {
    expect(formatCategoryLabel('material')).toBe('Material')
    expect(formatCategoryLabel('original-wordmark')).toBe('Original Wordmark')
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
