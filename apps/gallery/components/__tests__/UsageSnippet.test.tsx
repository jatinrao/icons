import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UsageSnippet } from '../UsageSnippet'

beforeEach(() => {
  Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })
})

describe('UsageSnippet', () => {
  it('copies the <Icon name="..." /> usage snippet on click', async () => {
    render(<UsageSnippet name="react" />)
    fireEvent.click(screen.getByRole('button'))

    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('<Icon name="react" />'),
    )
    await screen.findByText('Copied!')
  })
})
