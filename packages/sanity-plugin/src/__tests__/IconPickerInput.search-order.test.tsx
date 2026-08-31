import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { StringInputProps } from 'sanity'
import { studioTheme, ThemeProvider } from '@sanity/ui'
import { IconPickerInput } from '../IconPickerInput'

// `rankMatch`'s own unit tests (in IconPickerInput.test.tsx) prove the
// scoring function returns the right numbers in isolation, but nothing
// previously confirmed the rendered grid is actually sorted by it. A naive
// fixture doesn't catch that: `names` (and so the unsorted filter result) is
// already alphabetical, and "go" < "godot" < "gopher" alphabetically happens
// to match rank order too — a regression that dropped `.sort()` entirely
// would still pass. `gitlab` breaks that coincidence on purpose: it only
// matches via its tag (name/label don't contain "go" at all), so it ranks
// last, but "gitlab" < "go" alphabetically — an unsorted result would put it
// first.
vi.mock('@web-portfolio/icons-core', () => ({
  metadata: {
    godot: { label: 'Godot', tags: ['engine'], category: 'plain' },
    gopher: { label: 'Gopher', tags: ['mascot'], category: 'plain' },
    go: { label: 'Go', tags: ['language'], category: 'plain' },
    gitlab: { label: 'GitLab', tags: ['go-based'], category: 'plain' },
  },
}))
vi.mock('@web-portfolio/icons', () => ({
  Icon: ({ name }: { name: string }) => <svg data-testid={`icon-${name}`} />,
}))

function renderWithTheme() {
  return render(
    <ThemeProvider theme={studioTheme}>
      <IconPickerInput
        {...({
          value: undefined,
          onChange: vi.fn(),
          elementProps: {} as StringInputProps['elementProps'],
        } as unknown as StringInputProps)}
      />
    </ThemeProvider>,
  )
}

describe('IconPickerInput search result order', () => {
  it('ranks an exact match ahead of prefix matches, ahead of a tag-only hit — not alphabetically', () => {
    renderWithTheme()
    fireEvent.click(screen.getByText('Select icon'))

    fireEvent.change(screen.getByPlaceholderText('Search by name, label, or tag…'), {
      target: { value: 'go' },
    })

    const order = screen
      .getAllByRole('button', { name: /\((go|godot|gopher|gitlab)\)/ })
      .map((button) => button.getAttribute('aria-label'))

    // Unsorted (alphabetical) this would be GitLab, Go, Godot, Gopher —
    // rankMatch instead orders by match quality: exact name match, then
    // name-prefix matches (godot/gopher tie, so alphabetical order breaks
    // the tie between them), then GitLab last — it only matched via its
    // "go-based" tag, which rankMatch doesn't score for at all, so it falls
    // through to the lowest tier regardless of where it'd sort alphabetically.
    expect(order).toEqual(['Go (go)', 'Godot (godot)', 'Gopher (gopher)', 'GitLab (gitlab)'])
  })
})
