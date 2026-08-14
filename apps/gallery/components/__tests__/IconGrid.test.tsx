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

  it('shows an empty state with a clear-filters action when nothing matches', () => {
    render(<IconGrid icons={icons} />)
    fireEvent.change(screen.getByPlaceholderText(SEARCH_PLACEHOLDER), { target: { value: 'nonexistent' } })

    expect(screen.getByText('No icons found')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Clear filters'))
    expect(screen.getByPlaceholderText(SEARCH_PLACEHOLDER)).toHaveValue('')
    expect(screen.getByText('React')).toBeInTheDocument()
  })

  it('lists each distinct category, formatted for display, as a checkbox', () => {
    render(<IconGrid icons={icons} />)
    expect(screen.getByLabelText('Devicon')).toBeInTheDocument()
    expect(screen.getByLabelText('Plain')).toBeInTheDocument()
  })

  it('filters by one selected category', () => {
    render(<IconGrid icons={icons} />)
    fireEvent.click(screen.getByLabelText('Plain'))

    expect(screen.queryByText('React')).not.toBeInTheDocument()
    expect(screen.getByText('Docker')).toBeInTheDocument()
    expect(screen.getByText('Python')).toBeInTheDocument()
  })

  it('matches ANY of several selected categories, not all', () => {
    render(<IconGrid icons={icons} />)
    fireEvent.click(screen.getByLabelText('Plain'))
    fireEvent.click(screen.getByLabelText('Devicon'))

    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('Docker')).toBeInTheDocument()
    expect(screen.getByText('Python')).toBeInTheDocument()
  })

  it('combines the search query and the category filter', () => {
    render(<IconGrid icons={icons} />)
    fireEvent.click(screen.getByLabelText('Plain'))
    fireEvent.change(screen.getByPlaceholderText(SEARCH_PLACEHOLDER), { target: { value: 'react' } })

    expect(screen.getByText('No icons found')).toBeInTheDocument()
  })

  it('shows a "Clear all" filters link only once a filter is active', () => {
    render(<IconGrid icons={icons} />)
    expect(screen.queryByText('Clear all')).not.toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Plain'))
    expect(screen.getByText('Clear all')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Clear all'))
    expect(screen.queryByText('Clear all')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Plain')).not.toBeChecked()
  })

  it('sorts by category when selected, grouping matching icons together', () => {
    render(<IconGrid icons={icons} />)
    fireEvent.change(screen.getByLabelText('Sort icons'), { target: { value: 'category' } })

    const names = screen.getAllByText(/^(React|Docker|Python)$/).map((el) => el.textContent)
    // 'original' sorts before 'plain' alphabetically; within 'plain', Docker before Python.
    expect(names).toEqual(['React', 'Docker', 'Python'])
  })

  it('shows a status line with the current and total counts', () => {
    render(<IconGrid icons={icons} />)
    expect(screen.getByRole('status')).toHaveTextContent('Showing 3 of 3 icons')

    fireEvent.click(screen.getByLabelText('Plain'))
    expect(screen.getByRole('status')).toHaveTextContent('Showing 2 of 2 icons (filtered from 3 total)')
  })

  it('pre-filters from an initialQuery, e.g. a shared /?q= link', () => {
    render(<IconGrid icons={icons} initialQuery="docker" />)
    expect(screen.queryByText('React')).not.toBeInTheDocument()
    expect(screen.getByText('Docker')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(SEARCH_PLACEHOLDER)).toHaveValue('docker')
  })

  it('paginates: shows a "Load more" button when there are more icons than one page', () => {
    const many: GalleryIcon[] = Array.from({ length: 65 }, (_, i) => ({
      name: `icon-${i}`,
      label: `Icon ${i}`,
      svg: '<svg><path/></svg>',
      tags: [],
      category: 'plain',
    }))
    render(<IconGrid icons={many} />)

    expect(screen.getByRole('status')).toHaveTextContent('Showing 60 of 65 icons')
    expect(screen.getByText('Load more icons')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Load more icons'))
    expect(screen.getByRole('status')).toHaveTextContent('Showing 65 of 65 icons')
    expect(screen.getByText(/reached the end/)).toBeInTheDocument()
  })
})
