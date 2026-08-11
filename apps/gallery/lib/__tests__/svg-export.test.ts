import { describe, expect, it } from 'vitest'
import { svgToDataUrl } from '../svg-export'

describe('svgToDataUrl', () => {
  it('encodes svg markup as a base64 data URL that decodes back losslessly', () => {
    const svg = '<svg viewBox="0 0 24 24"><path d="M0 0"/></svg>'
    const result = svgToDataUrl(svg)

    expect(result).toMatch(/^data:image\/svg\+xml;base64,/)
    const decoded = Buffer.from(result.split(',')[1], 'base64').toString('utf-8')
    expect(decoded).toBe(svg)
  })

  it('round-trips markup containing non-ASCII characters', () => {
    const svg = '<svg><title>café ★</title><path d="M0 0"/></svg>'
    const result = svgToDataUrl(svg)
    const decoded = Buffer.from(result.split(',')[1], 'base64').toString('utf-8')
    expect(decoded).toBe(svg)
  })
})
