import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CopyDownloadActions } from '../CopyDownloadActions'

vi.mock('@/lib/svg-export', () => ({
  svgToPngBlob: vi.fn().mockResolvedValue(new Blob(['fake-png'], { type: 'image/png' })),
  triggerDownload: vi.fn(),
}))

import { svgToPngBlob, triggerDownload } from '@/lib/svg-export'

const svg = '<svg viewBox="0 0 24 24"><path d="M0 0"/></svg>'

beforeEach(() => {
  vi.clearAllMocks()
  Object.assign(navigator, {
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
      write: vi.fn().mockResolvedValue(undefined),
    },
  })
  // jsdom has no ClipboardItem constructor.
  ;(globalThis as unknown as { ClipboardItem: unknown }).ClipboardItem = vi
    .fn()
    .mockImplementation((data) => data)
})

describe('CopyDownloadActions', () => {
  it('copies raw SVG markup to the clipboard', async () => {
    render(<CopyDownloadActions name="react" svg={svg} />)
    fireEvent.click(screen.getByText('Copy SVG'))

    await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledWith(svg))
    await screen.findByText('Copied!')
  })

  it('rasterizes and copies a PNG', async () => {
    render(<CopyDownloadActions name="react" svg={svg} />)
    fireEvent.click(screen.getByText('Copy PNG'))

    await waitFor(() => expect(svgToPngBlob).toHaveBeenCalledWith(svg))
    await waitFor(() => expect(navigator.clipboard.write).toHaveBeenCalled())
  })

  it('downloads the raw SVG as a file', async () => {
    render(<CopyDownloadActions name="react" svg={svg} />)
    fireEvent.click(screen.getByText('Download SVG'))

    await waitFor(() => expect(triggerDownload).toHaveBeenCalled())
    const [blob, filename] = vi.mocked(triggerDownload).mock.calls[0]
    expect(filename).toBe('react.svg')
    expect(blob.type).toBe('image/svg+xml')
  })

  it('downloads a rasterized PNG file', async () => {
    render(<CopyDownloadActions name="react" svg={svg} />)
    fireEvent.click(screen.getByText('Download PNG'))

    await waitFor(() => expect(svgToPngBlob).toHaveBeenCalledWith(svg))
    await waitFor(() => expect(triggerDownload).toHaveBeenCalled())
    const [, filename] = vi.mocked(triggerDownload).mock.calls[0]
    expect(filename).toBe('react.png')
  })
})
