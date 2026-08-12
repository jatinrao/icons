import { describe, expect, it } from 'vitest'
import { formatCategoryLabel, getCategories, matchesCategory, matchesQuery } from '../icons'

const icon = { name: 'react', label: 'React', tags: ['framework', 'frontend'] }

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
  it('"all" matches every icon, including ones with no category', () => {
    expect(matchesCategory({ category: 'material' }, 'all')).toBe(true)
    expect(matchesCategory({ category: null }, 'all')).toBe(true)
  })

  it('matches only the exact category', () => {
    expect(matchesCategory({ category: 'social' }, 'social')).toBe(true)
    expect(matchesCategory({ category: 'material' }, 'social')).toBe(false)
    expect(matchesCategory({ category: null }, 'social')).toBe(false)
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
    expect(formatCategoryLabel('original-wordmark')).toBe('Original Wordmark')
    expect(formatCategoryLabel('plain_line')).toBe('Plain Line')
  })
})
