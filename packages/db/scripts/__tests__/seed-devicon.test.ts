import { describe, expect, it } from 'vitest'
import { pickVariant, toLabel } from '../seed-devicon'

describe('pickVariant', () => {
  it('prefers plain over original', () => {
    expect(pickVariant(['original', 'plain', 'line'])).toBe('plain')
  })

  it('falls back to original when plain is absent', () => {
    expect(pickVariant(['original', 'original-wordmark'])).toBe('original')
  })

  it('skips wordmark-only variants when a glyph exists', () => {
    expect(pickVariant(['original-wordmark', 'plain'])).toBe('plain')
  })

  it('falls back to a wordmark variant when nothing else is available', () => {
    expect(pickVariant(['original-wordmark'])).toBe('original-wordmark')
  })

  it('returns undefined for an empty list', () => {
    expect(pickVariant([])).toBeUndefined()
  })
})

describe('toLabel', () => {
  it('titlecases a plain slug', () => {
    expect(toLabel('react')).toBe('React')
  })

  it('splits camelCase and hyphens/underscores into words', () => {
    expect(toLabel('reactNative')).toBe('React Native')
    expect(toLabel('vue-js')).toBe('Vue Js')
    expect(toLabel('node_js')).toBe('Node Js')
  })
})
