import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Icon } from '../Icon'

vi.mock('@web-portfolio/icons-core', () => ({
  registry: {
    react: {
      viewBox: '0 0 128 128',
      innerHTML: '<circle cx="64" cy="64" r="10" fill="currentColor"/>',
      label: 'React',
      tags: ['framework'],
    },
    'stroke-icon': {
      viewBox: '0 0 24 24',
      innerHTML:
        '<path d="M1 1" stroke="#000000" stroke-width="2"/><path d="M2 2" fill="currentColor"/>',
      label: 'Stroke Icon',
      tags: ['test'],
    },
  },
}))

describe('Icon', () => {
  it('renders the svg for a known name', () => {
    const { container } = render(<Icon name="react" />)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    expect(svg?.getAttribute('viewBox')).toBe('0 0 128 128')
    expect(svg?.innerHTML).toContain('<circle')
  })

  it('applies size and color props', () => {
    const { container } = render(<Icon name="react" size={32} color="#ff0000" />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('width')).toBe('32')
    expect(svg?.getAttribute('height')).toBe('32')
    expect(svg?.getAttribute('fill')).toBe('#ff0000')
  })

  it('also sets color via CSS style, since currentColor children resolve against that — not the fill attribute', () => {
    // jsdom can't compute actual currentColor resolution, so this only
    // proves the mechanism is wired up, not that it visually renders red —
    // confirmed separately in a real browser.
    const { container } = render(<Icon name="react" color="#ff0000" />)
    const svg = container.querySelector('svg')
    expect(svg?.style.color).toBe('rgb(255, 0, 0)')
  })

  it('lets an explicit style prop pass through without breaking the color style', () => {
    const { container } = render(<Icon name="react" color="#ff0000" style={{ opacity: 0.5 }} />)
    const svg = container.querySelector('svg')
    expect(svg?.style.color).toBe('rgb(255, 0, 0)')
    expect(svg?.style.opacity).toBe('0.5')
  })

  it('renders nothing and warns for an unknown name', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { container } = render(<Icon name="does-not-exist" />)
    expect(container.querySelector('svg')).toBeNull()
    expect(warnSpy).toHaveBeenCalledOnce()
    warnSpy.mockRestore()
  })

  it('injects a <title> and sets role="img" when title is provided', () => {
    const { container } = render(<Icon name="react" title="React logo" />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('role')).toBe('img')
    expect(svg?.querySelector('title')?.textContent).toBe('React logo')
  })

  it('is decorative (aria-hidden, role=presentation) when no title is given', () => {
    const { container } = render(<Icon name="react" />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('role')).toBe('presentation')
    expect(svg?.getAttribute('aria-hidden')).toBe('true')
  })

  it('passes through className and other svg props', () => {
    const { container } = render(<Icon name="react" className="my-icon" data-testid="icon" />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('class')).toBe('my-icon')
    expect(svg?.getAttribute('data-testid')).toBe('icon')
  })

  it('sets stroke/strokeWidth on the root svg for elements with no stroke of their own', () => {
    const { container } = render(<Icon name="stroke-icon" stroke="#00ff00" strokeWidth={4} />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('stroke')).toBe('#00ff00')
    expect(svg?.getAttribute('stroke-width')).toBe('4')
  })

  it('rewrites an element that already declares its own stroke/stroke-width', () => {
    const { container } = render(<Icon name="stroke-icon" stroke="#00ff00" strokeWidth={4} />)
    const strokedPath = container.querySelector('path[d="M1 1"]')
    expect(strokedPath?.getAttribute('stroke')).toBe('#00ff00')
    expect(strokedPath?.getAttribute('stroke-width')).toBe('4')
  })

  it('is a no-op on an icon with no stroke anywhere when stroke props are omitted', () => {
    const { container } = render(<Icon name="react" />)
    const svg = container.querySelector('svg')
    expect(svg?.hasAttribute('stroke')).toBe(false)
    expect(svg?.hasAttribute('stroke-width')).toBe(false)
  })
})
