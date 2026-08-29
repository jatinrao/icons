import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { IconGrid } from '../IconGrid'
import type { GalleryIcon } from '@/lib/icons'

const icons: GalleryIcon[] = [
  { name: 'react', label: 'React', svg: '<svg><circle/></svg>', tags: ['framework'], category: 'original' },
  { name: 'docker', label: 'Docker', svg: '<svg><path/></svg>', tags: ['platform'], category: 'plain' },
  { name: 'python', label: 'Python', svg: '<svg><rect/></svg>', tags: ['language'], category: 'plain' },
]

const SEARCH_PLACEHOLDER = 'Search icons by name, category, or tag…'

describe('IconGrid', () => {
  it('renders all icons with no query', () => {
    render(<IconGrid icons={icons} />)
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('Docker')).toBeInTheDocument()
    expect(screen.getByText('Python')).toBeInTheDocument()
  })

  it('filters as the user types', () => {
    render(<IconGrid icons={icons} />)
    fireEvent.change(screen.getByPlaceholderText(SEARCH_PLACEHOLDER), { target: { value: 'docker' } })

    expect(screen.queryByText('React')).not.toBeInTheDocument()
    expect(screen.getByText('Docker')).toBeInTheDocument()
  })

  it('shows an empty state with a clear-search action when nothing matches', () => {
    render(<IconGrid icons={icons} />)
    fireEvent.change(screen.getByPlaceholderText(SEARCH_PLACEHOLDER), { target: { value: 'nonexistent' } })

    expect(screen.getByText('No icons found')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Clear search'))
    expect(screen.getByPlaceholderText(SEARCH_PLACEHOLDER)).toHaveValue('')
    expect(screen.getByText('React')).toBeInTheDocument()
  })

  it('links to a category page for each distinct category present', () => {
    render(<IconGrid icons={icons} />)
    expect(screen.getByRole('link', { name: 'Devicon' })).toHaveAttribute('href', '/icons/category/original')
    expect(screen.getByRole('link', { name: 'Plain' })).toHaveAttribute('href', '/icons/category/plain')
  })

  it('hides the category nav when every icon shares one category', () => {
    const single: GalleryIcon[] = icons.map((icon) => ({ ...icon, category: 'plain' }))
    render(<IconGrid icons={single} />)
    expect(screen.queryByRole('navigation', { name: 'Browse icons by category' })).not.toBeInTheDocument()
  })

  it('sorts by category when selected, grouping matching icons together', () => {
    render(<IconGrid icons={icons} />)
    fireEvent.change(screen.getByLabelText('Sort icons'), { target: { value: 'category' } })

    const names = screen.getAllByText(/^(React|Docker|Python)$/).map((el) => el.textContent)
    // 'original' sorts before 'plain' alphabetically; within 'plain', Docker before Python.
    expect(names).toEqual(['React', 'Docker', 'Python'])
  })

  it('shows a status line with the current range and total counts', () => {
    render(<IconGrid icons={icons} />)
    expect(screen.getByRole('status')).toHaveTextContent('Showing 1–3 of 3 icons')

    fireEvent.change(screen.getByPlaceholderText(SEARCH_PLACEHOLDER), { target: { value: 'plain-does-not-match' } })
    expect(screen.getByRole('status')).toHaveTextContent('Showing 0 of 0 icons')
  })

  it('pre-filters from an initialQuery, e.g. a shared /?q= link', () => {
    render(<IconGrid icons={icons} initialQuery="docker" />)
    expect(screen.queryByText('React')).not.toBeInTheDocument()
    expect(screen.getByText('Docker')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(SEARCH_PLACEHOLDER)).toHaveValue('docker')
  })

  it('does not show pagination controls when everything fits on one page', () => {
    render(<IconGrid icons={icons} />)
    expect(screen.queryByRole('navigation', { name: 'Icon results pages' })).not.toBeInTheDocument()
  })

  it('paginates: splits results across pages instead of rendering everything at once', () => {
    const many: GalleryIcon[] = Array.from({ length: 20 }, (_, i) => ({
      name: `icon-${i}`,
      label: `Icon ${i}`,
      svg: '<svg><path/></svg>',
      tags: [],
      category: 'plain',
    }))
    render(<IconGrid icons={many} />)

    expect(screen.getByRole('status')).toHaveTextContent('Showing 1–16 of 20 icons')
    expect(screen.getByText('Icon 0')).toBeInTheDocument()
    expect(screen.queryByText('Icon 16')).not.toBeInTheDocument()
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
    expect(screen.getByText('‹ Prev')).toBeDisabled()

    fireEvent.click(screen.getByText('Next ›'))

    expect(screen.getByRole('status')).toHaveTextContent('Showing 17–20 of 20 icons')
    expect(screen.getByText('Icon 16')).toBeInTheDocument()
    expect(screen.queryByText('Icon 0')).not.toBeInTheDocument()
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument()
    expect(screen.getByText('Next ›')).toBeDisabled()

    fireEvent.click(screen.getByText('‹ Prev'))
    expect(screen.getByRole('status')).toHaveTextContent('Showing 1–16 of 20 icons')
  })

  it('resets to page 1 when the search query changes', () => {
    const many: GalleryIcon[] = Array.from({ length: 20 }, (_, i) => ({
      name: `icon-${i}`,
      label: `Icon ${i}`,
      svg: '<svg><path/></svg>',
      tags: [],
      category: 'plain',
    }))
    render(<IconGrid icons={many} />)

    fireEvent.click(screen.getByText('Next ›'))
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText(SEARCH_PLACEHOLDER), { target: { value: 'icon-1' } })
    expect(screen.queryByText(/Page \d+ of \d+/)).not.toBeInTheDocument()
  })
})
