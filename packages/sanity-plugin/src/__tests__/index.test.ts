import { describe, expect, it } from 'vitest'
import {
  sanityIconPicker,
  iconRef,
  IconPickerInput,
  formatCategoryLabel,
  matchesQuery,
  rankMatch,
} from '../index'

// These exercise src/index.ts and src/iconRef.ts directly, independent of
// whichever bundler produces dist/ — verify-package.mjs already checks the
// built output shape, but nothing previously asserted this behavior at the
// source level, so a bundler swap had no test signal of its own.
describe('sanityIconPicker', () => {
  it('is a Sanity plugin factory that registers the iconRef schema type', () => {
    const plugin = sanityIconPicker()
    expect(plugin.name).toBe('sanity-icon-picker')
    expect(plugin.schema?.types).toEqual([iconRef])
  })
})

describe('iconRef', () => {
  it('is a string-backed schema type wired to IconPickerInput', () => {
    expect(iconRef.name).toBe('iconRef')
    expect(iconRef.type).toBe('string')
    expect(iconRef.components?.input).toBe(IconPickerInput)
  })
})

describe('public export surface', () => {
  it('exports the documented picker-building primitives', () => {
    expect(typeof IconPickerInput).toBe('function')
    expect(typeof formatCategoryLabel).toBe('function')
    expect(typeof matchesQuery).toBe('function')
    expect(typeof rankMatch).toBe('function')
  })
})
