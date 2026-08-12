import { describe, expect, it } from 'vitest'
import { MATERIAL_ICONS } from '../seed-material-icons'

describe('MATERIAL_ICONS', () => {
  it('has no duplicate names', () => {
    const names = MATERIAL_ICONS.map((icon) => icon.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('names are lowercase snake_case (matching the Material Symbols filenames)', () => {
    for (const icon of MATERIAL_ICONS) {
      expect(icon.name).toMatch(/^[a-z0-9]+(_[a-z0-9]+)*$/)
    }
  })

  it('every icon has a non-empty label and at least one tag', () => {
    for (const icon of MATERIAL_ICONS) {
      expect(icon.label.trim().length).toBeGreaterThan(0)
      expect(icon.tags.length).toBeGreaterThan(0)
    }
  })
})
