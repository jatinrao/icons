import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ModalShell } from '../ModalShell'

const back = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ back }),
}))

beforeEach(() => {
  back.mockClear()
  document.body.style.overflow = ''
})

describe('ModalShell', () => {
  it('renders as a labeled dialog with its content', () => {
    render(
      <ModalShell label="React icon details">
        <p>content</p>
      </ModalShell>,
    )
    expect(screen.getByRole('dialog', { name: 'React icon details' })).toBeInTheDocument()
    expect(screen.getByText('content')).toBeInTheDocument()
  })

  it('closes via router.back() when the backdrop is clicked', () => {
    render(
      <ModalShell label="React icon details">
        <p>content</p>
      </ModalShell>,
    )
    fireEvent.click(screen.getByRole('presentation'))
    expect(back).toHaveBeenCalledOnce()
  })

  it('does not close when the dialog content itself is clicked', () => {
    render(
      <ModalShell label="React icon details">
        <p>content</p>
      </ModalShell>,
    )
    fireEvent.click(screen.getByRole('dialog'))
    expect(back).not.toHaveBeenCalled()
  })

  it('closes via the close button', () => {
    render(
      <ModalShell label="React icon details">
        <p>content</p>
      </ModalShell>,
    )
    fireEvent.click(screen.getByLabelText('Close'))
    expect(back).toHaveBeenCalledOnce()
  })

  it('closes on Escape', () => {
    render(
      <ModalShell label="React icon details">
        <p>content</p>
      </ModalShell>,
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(back).toHaveBeenCalledOnce()
  })

  it('locks page scroll while mounted and restores it on unmount', () => {
    const { unmount } = render(
      <ModalShell label="React icon details">
        <p>content</p>
      </ModalShell>,
    )
    expect(document.body.style.overflow).toBe('hidden')
    unmount()
    expect(document.body.style.overflow).toBe('')
  })
})
