import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { describe, expect, it } from 'vitest'
import { TOOL_ICONS } from '../seed-tool-icons'

const require = createRequire(import.meta.url)

describe('TOOL_ICONS', () => {
  it('has no duplicate names', () => {
    const names = TOOL_ICONS.map((icon) => icon.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('names are lowercase', () => {
    for (const icon of TOOL_ICONS) {
      expect(icon.name).toMatch(/^[a-z0-9]+$/)
    }
  })

  it('every icon has a non-empty label and at least one tag', () => {
    for (const icon of TOOL_ICONS) {
      expect(icon.label.trim().length).toBeGreaterThan(0)
      expect(icon.tags.length).toBeGreaterThan(0)
    }
  })

  it('resolves to a real Simple Icons file (name, or sourceFile override)', () => {
    for (const icon of TOOL_ICONS) {
      const svgPath = require.resolve(`simple-icons/icons/${icon.sourceFile ?? icon.name}.svg`)
      expect(existsSync(svgPath)).toBe(true)
    }
  })
})
