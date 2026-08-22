import type { ReactElement } from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { StringInputProps } from 'sanity'
import { studioTheme, ThemeProvider } from '@sanity/ui'
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

vi.mock('@web-portfolio/icons-core', () => ({
  registry: {
    react: {
      viewBox: '0 0 128 128',
      innerHTML: '<circle cx="64" cy="64" r="10" fill="currentColor"/>',
      label: 'React',
      tags: ['framework', 'frontend'],
      category: 'original',
    },
    docker: {
      viewBox: '0 0 128 128',
      innerHTML: '<path d="M1 1" fill="currentColor"/>',
      label: 'Docker',
      tags: ['platform', 'deploy'],
      category: 'plain',
    },
    mail: {
      viewBox: '0 -960 960 960',
      innerHTML: '<path d="M2 2" fill="currentColor"/>',
      label: 'Mail',
      tags: ['email', 'contact'],
      category: 'material',
    },
  },
}))

const SEARCH_PLACEHOLDER = 'Search by name, label, or tag…'

describe('matchesQuery', () => {
  const entry = {
    viewBox: '',
    innerHTML: '',
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
    viewBox: '',
    innerHTML: '',
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
    const elementProps = {
      id: 'field-icon',
      onFocus,
      'aria-describedby': 'field-icon-description',
    } as unknown as StringInputProps['elementProps']

    renderWithTheme(<IconPickerInput {...makeProps({ elementProps })} />)

    const trigger = screen.getByRole('button', { name: /Select icon/ })
    expect(trigger).toHaveAttribute('id', 'field-icon')
    expect(trigger).toHaveAttribute('aria-describedby', 'field-icon-description')

    fireEvent.focus(trigger)
    expect(onFocus).toHaveBeenCalled()
  })
})
