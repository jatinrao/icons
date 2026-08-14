import { describe, expect, it } from 'vitest'
import {
  categoryAccent,
  formatCategoryLabel,
  getAllIcons,
  getCategories,
  getIconByName,
  matchesCategory,
  matchesQuery,
} from '../icons'

const icon = { name: 'react', label: 'React', tags: ['framework', 'frontend'] }

describe('getAllIcons', () => {
  it('reads every icon from the bundled registry, not a database', () => {
    const icons = getAllIcons()
    expect(icons.length).toBeGreaterThan(600)
    expect(icons.every((i) => typeof i.svg === 'string' && i.svg.startsWith('<svg'))).toBe(true)
  })
})

describe('getIconByName', () => {
  it('reassembles a full <svg> string from the registry\'s split viewBox/innerHTML', () => {
    const react = getIconByName('react')
    expect(react).toBeDefined()
    expect(react!.svg).toContain('<svg xmlns="http://www.w3.org/2000/svg" viewBox="')
    expect(react!.svg).toMatch(/<\/svg>$/)
  })

  it('returns undefined for an unknown name', () => {
    expect(getIconByName('totally-not-a-real-icon')).toBeUndefined()
  })
})

describe('matchesQuery', () => {
  it('matches on name, label, or tags (case-insensitive)', () => {
    expect(matchesQuery(icon, 'REACT')).toBe(true)
    expect(matchesQuery(icon, 'framework')).toBe(true)
    expect(matchesQuery(icon, 'docker')).toBe(false)
  })

  it('matches everything for an empty query', () => {
    expect(matchesQuery(icon, '')).toBe(true)
    expect(matchesQuery(icon, '   ')).toBe(true)
  })
})

describe('matchesCategory', () => {
  it('an empty selection matches every icon, including ones with no category', () => {
    expect(matchesCategory({ category: 'material' }, [])).toBe(true)
    expect(matchesCategory({ category: null }, [])).toBe(true)
  })

  it('matches any of several selected categories', () => {
    expect(matchesCategory({ category: 'social' }, ['social', 'tools'])).toBe(true)
    expect(matchesCategory({ category: 'tools' }, ['social', 'tools'])).toBe(true)
    expect(matchesCategory({ category: 'material' }, ['social', 'tools'])).toBe(false)
    expect(matchesCategory({ category: null }, ['social'])).toBe(false)
  })
})

describe('categoryAccent', () => {
  it('returns a curated accent for a known category', () => {
    expect(categoryAccent('social')).toBe('var(--accent-pink)')
    expect(categoryAccent('tools')).toBe('var(--accent-green)')
  })

  it('falls back to a default for no category', () => {
    expect(categoryAccent(null)).toBe('var(--accent-blue)')
  })

  it('deterministically maps an unrecognized category to a palette color', () => {
    const a = categoryAccent('some-brand-new-category')
    const b = categoryAccent('some-brand-new-category')
    expect(a).toBe(b)
    expect(a).toMatch(/^var\(--accent-/)
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

  it('returns an empty array when nothing has a category', () => {
    expect(getCategories([{ category: null }])).toEqual([])
  })
})

describe('formatCategoryLabel', () => {
  it('title-cases and replaces separators with spaces', () => {
    expect(formatCategoryLabel('material')).toBe('Material')
    expect(formatCategoryLabel('plain-wordmark')).toBe('Plain Wordmark')
    expect(formatCategoryLabel('plain_line')).toBe('Plain Line')
  })

  it('labels devicon\'s "original" variants by source, not devicon\'s internal jargon', () => {
    expect(formatCategoryLabel('original')).toBe('Devicon')
    expect(formatCategoryLabel('original-wordmark')).toBe('Devicon Wordmark')
  })
})
