import { describe, expect, it } from 'vitest'
import { matchesQuery } from '../icons'

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
