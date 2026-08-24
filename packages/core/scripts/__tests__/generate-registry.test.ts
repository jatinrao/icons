import { describe, expect, it } from 'vitest'
import {
  buildRegistry,
  buildRegistryEntry,
  normalizeToCurrentColor,
  splitEntries,
  splitSvg,
} from '../generate-registry'

describe('splitSvg', () => {
  it('extracts viewBox and inner markup', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path d="M1 1"/></svg>'
    expect(splitSvg(svg)).toEqual({ viewBox: '0 0 128 128', innerHTML: '<path d="M1 1"/>' })
  })

  it('falls back to a default viewBox when absent', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><path d="M1 1"/></svg>'
    expect(splitSvg(svg).viewBox).toBe('0 0 24 24')
  })

  it('throws on markup with no <svg> root', () => {
    expect(() => splitSvg('<div>not svg</div>')).toThrow()
  })
})

describe('normalizeToCurrentColor', () => {
  it('replaces explicit fill/stroke colors with currentColor', () => {
    const input = '<path fill="#61DAFB" stroke="#000000" d="M1 1"/>'
    expect(normalizeToCurrentColor(input)).toBe(
      '<path fill="currentColor" stroke="currentColor" d="M1 1"/>',
    )
  })

  it('leaves fill="none" untouched', () => {
    const input = '<path fill="none" stroke="#000" d="M1 1"/>'
    expect(normalizeToCurrentColor(input)).toBe('<path fill="none" stroke="currentColor" d="M1 1"/>')
  })
})

const monochromeIcon = {
  svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill="#0db7ed" d="M10 10 L60 10 L60 60 L10 60 Z"/></svg>',
  label: 'Docker',
  tags: '["platform","deploy"]',
  category: 'plain',
}

const brandIcon = {
  svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><circle fill="#61DAFB" cx="64" cy="64" r="10"/></svg>',
  label: 'React',
  tags: '["framework"]',
  category: 'original',
}

describe('buildRegistryEntry', () => {
  it('normalizes colors for a monochrome ("plain") variant', () => {
    const entry = buildRegistryEntry(monochromeIcon)
    expect(entry.innerHTML).toContain('fill="currentColor"')
    expect(entry.viewBox).toBe('0 0 128 128')
    expect(entry.label).toBe('Docker')
    expect(entry.tags).toEqual(['platform', 'deploy'])
    expect(entry.category).toBe('plain')
  })

  it('leaves colors untouched for a multi-color ("original") brand mark', () => {
    const entry = buildRegistryEntry(brandIcon)
    expect(entry.innerHTML.toLowerCase()).toContain('fill="#61dafb"')
    expect(entry.innerHTML).not.toContain('currentColor')
  })

  it('carries a null category through unchanged', () => {
    const entry = buildRegistryEntry({ ...monochromeIcon, category: null })
    expect(entry.category).toBeNull()
  })
})

describe('buildRegistry', () => {
  it('keys entries by icon name', () => {
    const registry = buildRegistry([
      { ...monochromeIcon, name: 'docker' },
      { ...brandIcon, name: 'react' },
    ])
    expect(Object.keys(registry).sort()).toEqual(['docker', 'react'])
    expect(registry.docker.label).toBe('Docker')
    expect(registry.react.label).toBe('React')
  })
})

describe('splitEntries', () => {
  it('separates render fields from search fields, keyed by the same names', () => {
    const full = buildRegistry([
      { ...monochromeIcon, name: 'docker' },
      { ...brandIcon, name: 'react' },
    ])
    const { registry, metadata } = splitEntries(full)

    expect(Object.keys(registry).sort()).toEqual(['docker', 'react'])
    expect(Object.keys(metadata).sort()).toEqual(['docker', 'react'])

    expect(registry.docker).toEqual({ viewBox: full.docker.viewBox, innerHTML: full.docker.innerHTML })
    expect(metadata.docker).toEqual({
      label: full.docker.label,
      tags: full.docker.tags,
      category: full.docker.category,
    })

    // Neither half leaks the other's fields.
    expect(registry.docker).not.toHaveProperty('label')
    expect(metadata.docker).not.toHaveProperty('viewBox')
  })
})
