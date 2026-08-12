import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { IconCustomizer } from '../IconCustomizer'

vi.mock('@/lib/svg-export', () => ({
  svgToPngBlob: vi.fn().mockResolvedValue(new Blob(['fake-png'], { type: 'image/png' })),
  triggerDownload: vi.fn(),
}))

const svg = '<svg viewBox="0 0 24 24"><path fill="#61DAFB" d="M1 1"/></svg>'

beforeEach(() => {
  Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })
})

describe('IconCustomizer', () => {
  it('shows the original SVG untouched, with no reset button, before any interaction', () => {
    const { container } = render(<IconCustomizer name="react" svg={svg} />)
    expect(container.querySelector('.detail-glyph')?.innerHTML).toContain('fill="#61DAFB"')
    expect(screen.queryByText('Reset to original')).not.toBeInTheDocument()
  })

  it('applies the chosen color to the preview and copy output once changed', async () => {
    const { container } = render(<IconCustomizer name="react" svg={svg} />)

    fireEvent.change(screen.getByLabelText(/Color/), { target: { value: '#ff0000' } })

    expect(container.querySelector('.detail-glyph')?.innerHTML).toContain('currentColor')
    expect(screen.getByText('Reset to original')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Copy SVG'))
    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('fill="#ff0000"'),
      ),
    )
  })

  it('updates the size label and preview box as the slider moves', () => {
    const { container } = render(<IconCustomizer name="react" svg={svg} />)

    fireEvent.change(screen.getByLabelText(/Size/), { target: { value: '64' } })

    expect(screen.getByText('Size (64px)')).toBeInTheDocument()
    expect(container.querySelector('.detail-glyph')).toHaveStyle({ width: '64px', height: '64px' })
  })

  it('hides advanced (stroke) controls until "Advanced options" is clicked', () => {
    render(<IconCustomizer name="react" svg={svg} />)

    expect(screen.queryByLabelText('Stroke')).not.toBeInTheDocument()
    fireEvent.click(screen.getByText('Advanced options'))
    expect(screen.getByLabelText('Stroke')).toBeInTheDocument()
    expect(screen.getByLabelText('Stroke width')).toBeInTheDocument()
  })

  it('resets to the original, untouched SVG and hides the reset button again', () => {
    const { container } = render(<IconCustomizer name="react" svg={svg} />)

    fireEvent.change(screen.getByLabelText(/Color/), { target: { value: '#ff0000' } })
    expect(screen.getByText('Reset to original')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Reset to original'))

    expect(container.querySelector('.detail-glyph')?.innerHTML).toContain('fill="#61DAFB"')
    expect(screen.queryByText('Reset to original')).not.toBeInTheDocument()
  })
})
