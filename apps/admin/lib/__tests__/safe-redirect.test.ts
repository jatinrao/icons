import { describe, expect, it } from 'vitest'
import { safeRedirectTarget } from '../safe-redirect'

describe('safeRedirectTarget', () => {
  it('follows a same-site path', () => {
    expect(safeRedirectTarget('/icons/new')).toBe('/icons/new')
  })

  it('defaults to / for missing/empty input', () => {
    expect(safeRedirectTarget(null)).toBe('/')
    expect(safeRedirectTarget(undefined)).toBe('/')
    expect(safeRedirectTarget('')).toBe('/')
  })

  it('rejects protocol-relative URLs (open redirect)', () => {
    expect(safeRedirectTarget('//evil.com')).toBe('/')
  })

  it('rejects absolute URLs to another host', () => {
    expect(safeRedirectTarget('https://evil.com')).toBe('/')
    expect(safeRedirectTarget('http://evil.com/x')).toBe('/')
  })

  it('rejects a path with no leading slash', () => {
    expect(safeRedirectTarget('icons/new')).toBe('/')
  })
})
