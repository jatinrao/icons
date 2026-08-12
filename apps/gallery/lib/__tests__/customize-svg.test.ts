import { describe, expect, it } from 'vitest'
import { applyCustomization } from '../customize-svg'

const options = { size: 64, color: '#ff0000', strokeColor: '#00ff00', strokeWidth: 3 }

describe('applyCustomization', () => {
  it('sets width, height, and root fill', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M1 1"/></svg>'
    const result = applyCustomization(svg, options)

    expect(result).toContain('width="64"')
    expect(result).toContain('height="64"')
    expect(result).toContain('fill="#ff0000"')
  })

  it('replaces an existing width/height/fill rather than duplicating them', () => {
    const svg = '<svg width="24" height="24" fill="#000" viewBox="0 0 24 24"><path d="M1 1"/></svg>'
    const result = applyCustomization(svg, options)

    expect(result.match(/width="/g)).toHaveLength(1)
    expect(result.match(/height="/g)).toHaveLength(1)
    expect(result.match(/ fill="/g)).toHaveLength(1)
    expect(result).toContain('width="64"')
  })

  it('rewrites inner explicit fills to currentColor so they defer to the new root fill', () => {
    const svg = '<svg viewBox="0 0 24 24"><path fill="#61DAFB" d="M1 1"/><circle fill="none" cx="1" cy="1" r="1"/></svg>'
    const result = applyCustomization(svg, options)

    expect(result).toContain('<path fill="currentColor" d="M1 1"/>')
    expect(result).toContain('fill="none"')
  })

  it('recolors stroke and stroke-width only on elements that already declare a stroke', () => {
    const svg = '<svg viewBox="0 0 24 24"><path stroke="#000" stroke-width="2" d="M1 1"/><path d="M2 2"/></svg>'
    const result = applyCustomization(svg, options)

    expect(result).toContain('stroke="#00ff00"')
    expect(result).toContain('stroke-width="3"')
    // The second path never had a stroke — customization shouldn't add one.
    expect(result).not.toMatch(/<path d="M2 2" stroke/)
  })

  it('handles a self-closing root <svg>', () => {
    const svg = '<svg viewBox="0 0 24 24"/>'
    const result = applyCustomization(svg, options)
    expect(result).toBe('<svg viewBox="0 0 24 24" width="64" height="64" fill="#ff0000"/>')
  })

  it('returns the input unchanged when there is no <svg> root', () => {
    const notSvg = '<div>not svg</div>'
    expect(applyCustomization(notSvg, options)).toBe(notSvg)
  })
})
