import { describe, expect, it } from 'vitest'
import { SOCIAL_ICONS } from '../seed-social-icons'

// Platforms devicon's own seed already covers — must never overlap with
// SOCIAL_ICONS, or seeding this list would silently overwrite those rows.
const DEVICON_COVERED = new Set([
  'facebook',
  'twitter',
  'linkedin',
  'github',
  'gitlab',
  'slack',
  'behance',
])

describe('SOCIAL_ICONS', () => {
  it('has no duplicate names', () => {
    const names = SOCIAL_ICONS.map((icon) => icon.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('does not collide with platforms devicon already seeds', () => {
    for (const icon of SOCIAL_ICONS) {
      expect(DEVICON_COVERED.has(icon.name)).toBe(false)
    }
  })

  it('names are lowercase, matching simple-icons slugs', () => {
    for (const icon of SOCIAL_ICONS) {
      expect(icon.name).toMatch(/^[a-z0-9]+$/)
    }
  })

  it('every icon has a non-empty label', () => {
    for (const icon of SOCIAL_ICONS) {
      expect(icon.label.trim().length).toBeGreaterThan(0)
    }
  })
})
