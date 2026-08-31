import { createRef, type ReactElement } from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { StringInputProps } from 'sanity'
import { rem, studioTheme, ThemeProvider } from '@sanity/ui'
import { useTheme } from 'styled-components'
import {
  IconPickerInput,
  formatCategoryLabel,
  matchesQuery,
  rankMatch,
} from '../IconPickerInput'

// @sanity/ui's primitives (Stack, Card, Dialog, ...) read from theme
// context, which Sanity Studio normally provides — supply it ourselves here.
function renderWithTheme(ui: ReactElement) {
  return render(<ThemeProvider theme={studioTheme}>{ui}</ThemeProvider>)
}

// styled-components injects generated rules into <style> tags rather than
// applying them as computed styles jsdom can read back — reading the raw CSS
// text is the only way to assert a rule actually landed, as opposed to a
// prop that merely didn't crash anything.
function injectedCss(): string {
  return Array.from(document.querySelectorAll('style'))
    .map((styleEl) => styleEl.textContent)
    .join('\n')
}

// `studioTheme` (a `BaseTheme`) is the raw config passed *into*
// `<ThemeProvider>` — it has no `.sanity` property. `theme.sanity.space` only
// exists on the scoped context value `ThemeProvider` builds *from* it and
// hands to descendants (what `VStack`'s styled() callback reads), so reading
// the real space scale means asking a component inside that provider, via
// the same `useTheme()` hook styled-components gives production code.
function ThemeSpy({ onSpace }: { onSpace: (space: number[]) => void }) {
  onSpace(useTheme().sanity.space)
  return null
}

vi.mock('@web-portfolio/icons-core', () => ({
  metadata: {
    react: { label: 'React', tags: ['framework', 'frontend'], category: 'original' },
    docker: { label: 'Docker', tags: ['platform', 'deploy'], category: 'plain' },
    mail: { label: 'Mail', tags: ['email', 'contact'], category: 'material' },
  },
}))

// The picker delegates rendering to @web-portfolio/icons's <Icon> rather than
// reading SVG markup itself — stub it so these tests stay independent of
// whatever the real bundled icon set currently contains.
vi.mock('@web-portfolio/icons', () => ({
  Icon: ({ name, size }: { name: string; size?: number }) => (
    <svg data-testid={`icon-${name}`} width={size} height={size} />
  ),
}))

const SEARCH_PLACEHOLDER = 'Search by name, label, or tag…'

describe('matchesQuery', () => {
  const entry = {
    label: 'React',
    tags: ['framework', 'frontend'],
    category: 'original',
  }

  it('matches on name, label, or tags (case-insensitive)', () => {
    expect(matchesQuery('react', entry, 'REACT')).toBe(true)
    expect(matchesQuery('react', entry, 'framework')).toBe(true)
    expect(matchesQuery('react', entry, 'docker')).toBe(false)
  })

  it('matches everything for an empty query', () => {
    expect(matchesQuery('react', entry, '')).toBe(true)
    expect(matchesQuery('react', entry, '   ')).toBe(true)
  })
})

describe('rankMatch', () => {
  const make = (label: string) => ({
    label,
    tags: ['lang'],
    category: 'plain',
  })

  it('ranks an exact name ahead of a prefix match, and a prefix ahead of a tag-only hit', () => {
    // The reason this ordering exists: alphabetically "godot" beats "go",
    // so searching "go" used to bury the icon the editor actually wanted.
    const exact = rankMatch('go', make('Go'), 'go')
    const prefix = rankMatch('godot', make('Godot'), 'go')
    const tagOnly = rankMatch('rust', make('Rust'), 'go')

    expect(exact).toBeLessThan(prefix)
    expect(prefix).toBeLessThan(tagOnly)
  })

  it('treats every icon equally when there is no query', () => {
    expect(rankMatch('go', make('Go'), '')).toBe(rankMatch('rust', make('Rust'), ''))
  })
})

describe('formatCategoryLabel', () => {
  it("renames devicon's internal variant names to something an editor can read", () => {
    expect(formatCategoryLabel('original')).toBe('Devicon')
    expect(formatCategoryLabel('original-wordmark')).toBe('Devicon Wordmark')
  })

  it('title-cases any other category, so a new one needs no code change', () => {
    expect(formatCategoryLabel('material')).toBe('Material')
    expect(formatCategoryLabel('plain-wordmark')).toBe('Plain Wordmark')
  })
})

function makeProps(overrides: Partial<StringInputProps> = {}): StringInputProps {
  return {
    value: undefined,
    onChange: vi.fn(),
    elementProps: {} as StringInputProps['elementProps'],
    ...overrides,
  } as unknown as StringInputProps
}

describe('IconPickerInput', () => {
  it('shows "No icon selected" when there is no value', () => {
    renderWithTheme(<IconPickerInput {...makeProps()} />)
    expect(screen.getByText('No icon selected')).toBeInTheDocument()
  })

  it('shows the selected icon label, its stored name, and its category', () => {
    renderWithTheme(<IconPickerInput {...makeProps({ value: 'react' })} />)
    expect(screen.getByText('React')).toBeInTheDocument()
    // The stored string is what gets passed to <Icon name="..." /> downstream.
    expect(screen.getByText('react')).toBeInTheDocument()
    expect(screen.getByText('Devicon')).toBeInTheDocument()
  })

  it('opens the picker, filters by query, and selects an icon', () => {
    const onChange = vi.fn()
    renderWithTheme(<IconPickerInput {...makeProps({ onChange })} />)

    fireEvent.click(screen.getByText('Select icon'))
    expect(screen.getByPlaceholderText(SEARCH_PLACEHOLDER)).toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText(SEARCH_PLACEHOLDER), {
      target: { value: 'docker' },
    })

    expect(screen.queryByText('React')).not.toBeInTheDocument()
    fireEvent.click(screen.getByText('Docker'))

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ type: 'set', value: 'docker' }))
    // Picking a result closes the dialog — a caller who only checks onChange
    // would miss a regression that left the picker open after selection.
    expect(screen.queryByPlaceholderText(SEARCH_PLACEHOLDER)).not.toBeInTheDocument()
  })

  it('clears the search query via the search field’s own clear button, restoring the full list', () => {
    renderWithTheme(<IconPickerInput {...makeProps()} />)
    fireEvent.click(screen.getByText('Select icon'))

    fireEvent.change(screen.getByPlaceholderText(SEARCH_PLACEHOLDER), {
      target: { value: 'docker' },
    })
    expect(screen.queryByText('React')).not.toBeInTheDocument()

    // TextInput's own clear button only renders once there's a query to
    // clear, and shares its accessible name ("Clear") with the trigger row's
    // Clear button — unambiguous here only because no value is selected, so
    // that other button never renders.
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }))

    expect(screen.getByPlaceholderText(SEARCH_PLACEHOLDER)).toHaveValue('')
    expect(screen.getByText('React')).toBeInTheDocument()
  })

  it('closes the dialog via Cancel without emitting a patch, and drops the in-progress search', () => {
    const onChange = vi.fn()
    renderWithTheme(<IconPickerInput {...makeProps({ onChange })} />)

    fireEvent.click(screen.getByText('Select icon'))
    fireEvent.change(screen.getByPlaceholderText(SEARCH_PLACEHOLDER), {
      target: { value: 'docker' },
    })
    fireEvent.click(screen.getByText('Cancel'))

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.queryByPlaceholderText(SEARCH_PLACEHOLDER)).not.toBeInTheDocument()

    // Reopening should show a clean slate, not "docker" still in the search
    // box from the cancelled attempt.
    fireEvent.click(screen.getByText('Select icon'))
    expect(screen.getByPlaceholderText(SEARCH_PLACEHOLDER)).toHaveValue('')
    expect(screen.getByText('React')).toBeInTheDocument()
  })

  it('shows a plain count in the footer when nothing is filtered out', () => {
    renderWithTheme(<IconPickerInput {...makeProps()} />)
    fireEvent.click(screen.getByText('Select icon'))

    expect(screen.getByText('3 icons')).toBeInTheDocument()
  })

  it('combines the category filter and the search query with AND, not OR', () => {
    renderWithTheme(<IconPickerInput {...makeProps()} />)
    fireEvent.click(screen.getByText('Select icon'))

    // "mail" matches the mail icon by name, but its category is "material",
    // not "plain" — a filter that silently OR'd these together would still
    // show it.
    fireEvent.change(screen.getByLabelText('Filter by category'), {
      target: { value: 'plain' },
    })
    fireEvent.change(screen.getByPlaceholderText(SEARCH_PLACEHOLDER), {
      target: { value: 'mail' },
    })
    expect(screen.queryByText('Mail')).not.toBeInTheDocument()
    expect(screen.getByText('No icons match that search')).toBeInTheDocument()

    // A query that matches *within* the selected category still finds it.
    fireEvent.change(screen.getByPlaceholderText(SEARCH_PLACEHOLDER), {
      target: { value: 'dock' },
    })
    expect(screen.getByText('Docker')).toBeInTheDocument()
  })

  it('focuses the search field when the dialog opens, not the header close button', () => {
    // Regression test: @sanity/ui's Dialog unconditionally focuses the first
    // focusable descendant on mount, which is the header's close button (it
    // sits before the dialog body in the DOM) — that used to win the race
    // against this field's own `autoFocus`.
    renderWithTheme(<IconPickerInput {...makeProps()} />)
    fireEvent.click(screen.getByText('Select icon'))

    expect(screen.getByPlaceholderText(SEARCH_PLACEHOLDER)).toHaveFocus()
  })

  it('narrows results with the category filter', () => {
    renderWithTheme(<IconPickerInput {...makeProps()} />)
    fireEvent.click(screen.getByText('Select icon'))

    fireEvent.change(screen.getByLabelText('Filter by category'), {
      target: { value: 'material' },
    })

    expect(screen.getByText('Mail')).toBeInTheDocument()
    expect(screen.queryByText('Docker')).not.toBeInTheDocument()
    expect(screen.getByText('1 of 3 icons')).toBeInTheDocument()
  })

  it('shows an empty state instead of a blank grid when nothing matches', () => {
    renderWithTheme(<IconPickerInput {...makeProps()} />)
    fireEvent.click(screen.getByText('Select icon'))

    fireEvent.change(screen.getByPlaceholderText(SEARCH_PLACEHOLDER), {
      target: { value: 'nothing-matches-this' },
    })

    expect(screen.getByText('No icons match that search')).toBeInTheDocument()
  })

  it('marks the current value as pressed in the grid', () => {
    renderWithTheme(<IconPickerInput {...makeProps({ value: 'react' })} />)
    fireEvent.click(screen.getByText('Change icon'))

    expect(screen.getByRole('button', { name: 'React (react)' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Docker (docker)' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('shows the icon’s raw registry name as a native title on hover, not a Sanity UI Tooltip', () => {
    // Regression test: @sanity/ui moved `Tooltip` from its root export to the
    // `@sanity/ui/tooltip` subpath in v4 — a subpath that doesn't exist in
    // v2/v3, so there's no single import specifier that resolves on both.
    // Importing it from the root (as this used to) is `undefined` on v4 and
    // crashes the grid the moment it renders. A plain `title` attribute
    // works identically on every version.
    renderWithTheme(<IconPickerInput {...makeProps()} />)
    fireEvent.click(screen.getByText('Select icon'))

    expect(screen.getByRole('button', { name: 'React (react)' })).toHaveAttribute('title', 'react')
    expect(screen.getByRole('button', { name: 'Docker (docker)' })).toHaveAttribute(
      'title',
      'docker',
    )
  })

  it('gives the field’s stacked sections a real pixel gap via VStack’s own override, not Stack’s native spacing', () => {
    // Regression test: @sanity/ui v4 silently drops `Stack`'s `space` prop
    // (replaced by `gap`) — it still renders without error, just with the
    // gap missing. `VStack`'s override has to land as a real CSS rule, not
    // merely "didn't crash" — and it has to be *its own* rule: `$space`
    // never reaches `Stack` as `space` (styled-components drops `$`-prefixed
    // props before forwarding), but on an installed version where Stack
    // *would* have generated its own `grid-gap:<value>` rule for a real
    // `space` prop, a naive `gap:<value>` substring match would pass whether
    // or not `VStack`'s override exists at all — "grid-gap:0.75rem" contains
    // "gap:0.75rem". The `&&` selector doubles VStack's generated class
    // (see IconTile below for the same pattern), which is a shape Stack's
    // own single-class rule never produces — matching that shape is what
    // actually proves the override fired.
    let space: number[] = []
    render(
      <ThemeProvider theme={studioTheme}>
        <ThemeSpy onSpace={(s) => (space = s)} />
        <IconPickerInput {...makeProps({ value: 'react' })} />
      </ThemeProvider>,
    )

    const expectedGap = rem(space[3]).toString().replace('.', '\\.')
    expect(injectedCss()).toMatch(
      new RegExp(`(\\.[\\w-]+)\\1\\s*\\{\\s*gap:\\s*${expectedGap}\\b`),
    )
  })

  it('gives the results grid a responsive column count via plain CSS, not Grid’s removed `columns` prop', () => {
    // Regression test: @sanity/ui v4 removes `Grid`'s `columns` prop
    // (replaced by `gridTemplateColumns`) — a fixed [3, 4, 6] breakpoint
    // array would silently do nothing there, collapsing the icon grid to a
    // single column with no error.
    renderWithTheme(<IconPickerInput {...makeProps()} />)
    fireEvent.click(screen.getByText('Select icon'))

    expect(injectedCss()).toMatch(/grid-template-columns:\s*repeat\(auto-fill,\s*minmax\(/)
  })

  it('clears the value via the Clear button', () => {
    const onChange = vi.fn()
    renderWithTheme(<IconPickerInput {...makeProps({ value: 'react', onChange })} />)

    fireEvent.click(screen.getByText('Clear'))
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ type: 'unset' }))
  })

  it('explains a stored value that is no longer in the bundled set', () => {
    renderWithTheme(<IconPickerInput {...makeProps({ value: 'removed-upstream' })} />)

    const warning = screen.getByText(/isn’t in the bundled icon set/)
    expect(warning).toBeInTheDocument()
    expect(within(warning).getByText('removed-upstream')).toBeInTheDocument()
  })

  describe('readOnly', () => {
    it('disables both actions so a locked field cannot be edited', () => {
      renderWithTheme(<IconPickerInput {...makeProps({ value: 'react', readOnly: true })} />)

      expect(screen.getByRole('button', { name: /Change icon/ })).toBeDisabled()
      expect(screen.getByRole('button', { name: /Clear/ })).toBeDisabled()
    })

    it('never emits a patch even if a click gets through', () => {
      const onChange = vi.fn()
      renderWithTheme(
        <IconPickerInput {...makeProps({ value: 'react', readOnly: true, onChange })} />,
      )

      fireEvent.click(screen.getByText('Clear'))
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  it('wires Sanity’s focus-tracking elementProps onto the trigger button', () => {
    const onFocus = vi.fn()
    const onBlur = vi.fn()
    const ref = createRef<HTMLButtonElement>()
    const elementProps = {
      id: 'field-icon',
      onFocus,
      onBlur,
      ref,
      'aria-describedby': 'field-icon-description',
    } as unknown as StringInputProps['elementProps']

    renderWithTheme(<IconPickerInput {...makeProps({ elementProps })} />)

    const trigger = screen.getByRole('button', { name: /Select icon/ })
    expect(trigger).toHaveAttribute('id', 'field-icon')
    expect(trigger).toHaveAttribute('aria-describedby', 'field-icon-description')
    // Sanity positions the presence/status indicator off this ref — it has
    // to land on the real trigger button, not get lost forwarding through
    // Sanity UI's Button.
    expect(ref.current).toBe(trigger)

    fireEvent.focus(trigger)
    expect(onFocus).toHaveBeenCalled()

    fireEvent.blur(trigger)
    expect(onBlur).toHaveBeenCalled()
  })
})
