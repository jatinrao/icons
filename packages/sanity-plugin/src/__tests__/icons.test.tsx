import { createRef } from 'react'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ImageIcon, SearchIcon, TrashIcon, WarningOutlineIcon } from '../icons'

/**
 * These are inlined copies of four `@sanity/icons` components (see the
 * comment in ../icons.tsx for why: that package's root barrel export stops
 * resolving at all on v5+, which Sanity Studio v6 already installs). Nothing
 * here is business logic — it's regression coverage for the copy itself,
 * since a typo in one of these `d` attributes has no other test to catch it.
 */
const icons = {
  ImageIcon,
  SearchIcon,
  TrashIcon,
  WarningOutlineIcon,
} as const

describe.each(Object.entries(icons))('%s', (_name, IconComponent) => {
  it('renders an svg matching @sanity/icons’ own viewBox and stroke conventions', () => {
    const { container } = render(<IconComponent data-testid="icon" />)
    const svg = container.querySelector('svg')

    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('viewBox', '0 0 25 25')
    expect(svg).toHaveAttribute('width', '1em')
    expect(svg).toHaveAttribute('height', '1em')
    expect(svg).toHaveAttribute('fill', 'none')

    const path = svg?.querySelector('path')
    expect(path).toHaveAttribute('stroke', 'currentColor')
    expect(path?.getAttribute('d')?.length).toBeGreaterThan(0)
  })

  it('forwards a ref to the underlying svg element, like @sanity/icons’ components do', () => {
    const ref = createRef<SVGSVGElement>()
    render(<IconComponent ref={ref} />)
    expect(ref.current).toBeInstanceOf(SVGSVGElement)
  })

  it('spreads extra props onto the svg (Button/Text pass size, className, etc. through this way)', () => {
    const { container } = render(<IconComponent className="custom" data-marker="x" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('custom')
    expect(svg).toHaveAttribute('data-marker', 'x')
  })
})

describe('the four icons', () => {
  it('each have distinct path data (guards against a copy-paste mistake reusing one path for two icons)', () => {
    const paths = Object.values(icons).map((IconComponent) => {
      const { container } = render(<IconComponent />)
      return container.querySelector('path')?.getAttribute('d')
    })

    expect(new Set(paths).size).toBe(paths.length)
  })
})
