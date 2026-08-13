import type { ReactElement } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { StringInputProps } from 'sanity'
import { studioTheme, ThemeProvider } from '@sanity/ui'
import { IconPickerInput, matchesQuery } from '../IconPickerInput'

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
  },
}))

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

  it('shows the selected icon label when a value is set', () => {
    renderWithTheme(<IconPickerInput {...makeProps({ value: 'react' })} />)
    expect(screen.getByText('React')).toBeInTheDocument()
  })

  it('opens the picker, filters by query, and selects an icon', () => {
    const onChange = vi.fn()
    renderWithTheme(<IconPickerInput {...makeProps({ onChange })} />)

    fireEvent.click(screen.getByText('Change'))
    expect(screen.getByPlaceholderText('Search by name or tag…')).toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText('Search by name or tag…'), {
      target: { value: 'docker' },
    })

    expect(screen.queryByText('React')).not.toBeInTheDocument()
    fireEvent.click(screen.getByText('Docker'))

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ type: 'set', value: 'docker' }))
  })

  it('clears the value via the Clear button', () => {
    const onChange = vi.fn()
    renderWithTheme(<IconPickerInput {...makeProps({ value: 'react', onChange })} />)

    fireEvent.click(screen.getByText('Clear'))
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ type: 'unset' }))
  })
})
