import { describe, expect, it } from 'vitest'
import { ensureCurrentColorFill } from '../svg-utils'

describe('ensureCurrentColorFill', () => {
  it('injects fill="currentColor" onto a root <svg> with no fill', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M1 1"/></svg>'
    expect(ensureCurrentColorFill(svg)).toBe(
      '<svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M1 1"/></svg>',
    )
  })

  it('leaves an svg with an existing fill untouched', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" fill="#ff0000" viewBox="0 0 24 24"><path d="M1 1"/></svg>'
    expect(ensureCurrentColorFill(svg)).toBe(svg)
  })
})
