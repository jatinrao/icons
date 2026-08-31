import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { IconDetailPanel } from '../IconDetailPanel'
import type { GalleryIcon } from '@/lib/icons'

vi.mock('@/lib/svg-export', () => ({
  svgToPngBlob: vi.fn().mockResolvedValue(new Blob(['fake-png'], { type: 'image/png' })),
  triggerDownload: vi.fn(),
}))

const svg = '<svg viewBox="0 0 24 24"><path fill="#61DAFB" d="M1 1"/></svg>'

const icon: GalleryIcon = {
  name: 'react',
  label: 'React',
  svg,
  tags: ['framework', 'frontend'],
  category: 'original',
}

beforeEach(() => {
  Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })
})

describe('IconDetailPanel', () => {
  it('renders the name, category badge, and tags', () => {
    render(<IconDetailPanel icon={icon} />)
    expect(screen.getByRole('heading', { name: 'React icon' })).toBeInTheDocument()
    expect(screen.getByText('react')).toBeInTheDocument()
    expect(screen.getByText('Devicon')).toBeInTheDocument()
    expect(screen.getByText('framework')).toBeInTheDocument()
    expect(screen.getByText('frontend')).toBeInTheDocument()
  })

  it('omits the category badge for an icon with no category', () => {
    render(<IconDetailPanel icon={{ ...icon, category: null }} />)
    expect(screen.queryByText('Devicon')).not.toBeInTheDocument()
  })

  it('shows the original SVG untouched, with no reset button, before any interaction', () => {
    const { container } = render(<IconDetailPanel icon={icon} />)
    expect(container.querySelector('.detail-glyph')?.innerHTML).toContain('fill="#61DAFB"')
    expect(screen.queryByText('Reset to original')).not.toBeInTheDocument()
  })

  it('applies the chosen color to the preview and copy output once changed', async () => {
    const { container } = render(<IconDetailPanel icon={icon} />)

    fireEvent.change(screen.getByLabelText(/Color/), { target: { value: '#ff0000' } })

    // Assert on the actual child element, not just a substring anywhere in
    // innerHTML — currentColor resolves against the CSS `color` property,
    // not a parent's `fill` attribute, so a root-only fill change would be a
    // false pass here (and silently fail to recolor anything for real).
    expect(container.querySelector('.detail-glyph path')).toHaveAttribute('fill', '#ff0000')
    expect(container.querySelector('.detail-glyph')?.innerHTML).not.toContain('currentColor')
    expect(screen.getByText('Reset to original')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Copy SVG'))
    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('fill="#ff0000"'),
      ),
    )
  })

  it('updates the size label and preview box as the slider moves', () => {
    const { container } = render(<IconDetailPanel icon={icon} />)

    fireEvent.change(screen.getByLabelText(/Size/), { target: { value: '64' } })

    expect(screen.getByText('Size (64px)')).toBeInTheDocument()
    expect(container.querySelector('.detail-glyph')).toHaveStyle({ width: '64px', height: '64px' })
  })

  it('hides advanced (stroke) controls until "Advanced options" is clicked', () => {
    render(<IconDetailPanel icon={icon} />)

    expect(screen.queryByLabelText('Stroke')).not.toBeInTheDocument()
    fireEvent.click(screen.getByText('Advanced options'))
    expect(screen.getByLabelText('Stroke')).toBeInTheDocument()
    expect(screen.getByLabelText('Stroke width')).toBeInTheDocument()
  })

  it('resets to the original, untouched SVG and hides the reset button again', () => {
    const { container } = render(<IconDetailPanel icon={icon} />)

    fireEvent.change(screen.getByLabelText(/Color/), { target: { value: '#ff0000' } })
    expect(screen.getByText('Reset to original')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Reset to original'))

    expect(container.querySelector('.detail-glyph')?.innerHTML).toContain('fill="#61DAFB"')
    expect(screen.queryByText('Reset to original')).not.toBeInTheDocument()
  })

  it('applies a quick-pick color swatch and marks it pressed', () => {
    const { container } = render(<IconDetailPanel icon={icon} />)

    const indigo = screen.getByLabelText('Indigo accent color')
    expect(indigo).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(indigo)

    expect(indigo).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('.detail-glyph path')).toHaveAttribute('fill', '#6155F5')
  })

  it('adjusts stroke width with the +/- stepper, clamped to its bounds', () => {
    render(<IconDetailPanel icon={icon} />)
    fireEvent.click(screen.getByText('Advanced options'))

    const decrease = screen.getByLabelText('Decrease stroke width')
    const increase = screen.getByLabelText('Increase stroke width')

    fireEvent.click(increase)
    expect(screen.getByText('Stroke width (2.5)')).toBeInTheDocument()

    fireEvent.click(decrease)
    fireEvent.click(decrease)
    expect(screen.getByText('Stroke width (1.5)')).toBeInTheDocument()

    // Drive it down to the floor and confirm the button disables rather than going negative.
    for (let i = 0; i < 10; i++) fireEvent.click(decrease)
    expect(screen.getByText('Stroke width (0)')).toBeInTheDocument()
    expect(decrease).toBeDisabled()
  })
})
