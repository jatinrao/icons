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
})
