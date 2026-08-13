import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { describe, expect, it } from 'vitest'
import { MATERIAL_ICONS } from '../seed-material-icons'

const require = createRequire(import.meta.url)

describe('MATERIAL_ICONS', () => {
  it('has no duplicate names', () => {
    const names = MATERIAL_ICONS.map((icon) => icon.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('names are lowercase snake_case', () => {
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

  it('resolves to a real Material Symbols file (name, or sourceFile override)', () => {
    const packageJsonPath = require.resolve('@material-symbols/svg-400/package.json')
    const packageRoot = packageJsonPath.replace(/package\.json$/, '')
    for (const icon of MATERIAL_ICONS) {
      const svgPath = `${packageRoot}outlined/${icon.sourceFile ?? icon.name}.svg`
      expect(existsSync(svgPath)).toBe(true)
    }
  })
})
