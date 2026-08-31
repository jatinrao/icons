import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { StringInputProps } from 'sanity'
import { studioTheme, ThemeProvider } from '@sanity/ui'
import { IconPickerInput } from '../IconPickerInput'

// PAGE_SIZE (48) is well above the 3-icon mock the main test file uses, so
// none of its tests ever exercise pagination — "Show more" and the
// stale-offset reset are entirely uncovered without a larger set. This file
// gets its own vi.mock (module mocks are scoped per test file) specifically
// so it can be big enough to matter without disturbing the small, readable
// fixture the rest of the suite relies on.
// The generator has to live inside the factory: vi.mock is hoisted above
// this file's own top-level declarations, so a module-scope `metadata`
// referenced here would still be in its temporal dead zone when this runs.
vi.mock('@web-portfolio/icons-core', () => ({
  metadata: Object.fromEntries(
    Array.from({ length: 60 }, (_, i) => {
      const n = String(i).padStart(2, '0')
      return [`widget-${n}`, { label: `Widget ${n}`, tags: ['widget'], category: 'gadgets' }]
    }),
  ),
}))
vi.mock('@web-portfolio/icons', () => ({
  Icon: ({ name }: { name: string }) => <svg data-testid={`icon-${name}`} />,
}))

function renderWithTheme(props: Partial<StringInputProps> = {}) {
  return render(
    <ThemeProvider theme={studioTheme}>
      <IconPickerInput
        {...({
          value: undefined,
          onChange: vi.fn(),
          elementProps: {} as StringInputProps['elementProps'],
          ...props,
        } as unknown as StringInputProps)}
      />
    </ThemeProvider>,
  )
}

describe('IconPickerInput pagination', () => {
  it('renders only the first page and offers to show the rest', () => {
    renderWithTheme()
    fireEvent.click(screen.getByText('Select icon'))

    // Sorted alphabetically, widget-00..widget-47 are the first 48 — the
    // remaining 12 (widget-48..widget-59) start one page later.
    expect(screen.getByText('Widget 00')).toBeInTheDocument()
    expect(screen.queryByText('Widget 59')).not.toBeInTheDocument()
    expect(screen.getByText('Show 12 more')).toBeInTheDocument()
    // The footer count tracks the *filtered* set, not how many of them are
    // currently paged into view — nothing here is filtered out, so it reads
    // as a plain total despite only 48 tiles being on screen.
    expect(screen.getByText('60 icons')).toBeInTheDocument()
  })

  it('reveals the rest on click and then hides the button', () => {
    renderWithTheme()
    fireEvent.click(screen.getByText('Select icon'))

    fireEvent.click(screen.getByText('Show 12 more'))

    expect(screen.getByText('Widget 59')).toBeInTheDocument()
    expect(screen.queryByText(/Show \d+ more/)).not.toBeInTheDocument()
  })

  it('resets pagination back to the first page when the query changes, even if the match count does not', () => {
    // Regression coverage for the effect documented in IconPickerInput.tsx:
    // "A stale offset would leave 'Show more' hidden — or worse, show an
    // empty page — the moment the result set shrinks under the current
    // count." Every widget shares the "widget" tag, so typing "widget" still
    // matches all 60 — the only thing that should change is the page reset.
    renderWithTheme()
    fireEvent.click(screen.getByText('Select icon'))
    fireEvent.click(screen.getByText('Show 12 more'))
    expect(screen.queryByText(/Show \d+ more/)).not.toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText('Search by name, label, or tag…'), {
      target: { value: 'widget' },
    })

    expect(screen.getByText('Show 12 more')).toBeInTheDocument()
    expect(screen.queryByText('Widget 59')).not.toBeInTheDocument()
  })
})
