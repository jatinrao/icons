import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { IconGrid } from '../IconGrid'
import type { GalleryIcon } from '@/lib/icons'

const icons: GalleryIcon[] = [
  { name: 'react', label: 'React', svg: '<svg><circle/></svg>', tags: ['framework'], category: 'original' },
  { name: 'docker', label: 'Docker', svg: '<svg><path/></svg>', tags: ['platform'], category: 'plain' },
]

describe('IconGrid', () => {
  it('renders all icons with no query', () => {
    render(<IconGrid icons={icons} />)
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('Docker')).toBeInTheDocument()
  })

  it('filters as the user types', () => {
    render(<IconGrid icons={icons} />)
    fireEvent.change(screen.getByPlaceholderText('Search by name, label, or tag…'), {
      target: { value: 'docker' },
    })

    expect(screen.queryByText('React')).not.toBeInTheDocument()
    expect(screen.getByText('Docker')).toBeInTheDocument()
  })

  it('shows an empty state when nothing matches', () => {
    render(<IconGrid icons={icons} />)
    fireEvent.change(screen.getByPlaceholderText('Search by name, label, or tag…'), {
      target: { value: 'nonexistent' },
    })

    expect(screen.getByText(/No icons match/)).toBeInTheDocument()
  })

  it('lists each distinct category, title-cased, in the dropdown', () => {
    render(<IconGrid icons={icons} />)
    const select = screen.getByLabelText('Filter by category')
    const optionLabels = Array.from(select.querySelectorAll('option')).map((o) => o.textContent)
    expect(optionLabels).toEqual(['All categories', 'Original', 'Plain'])
  })

  it('filters by the selected category', () => {
    render(<IconGrid icons={icons} />)
    fireEvent.change(screen.getByLabelText('Filter by category'), { target: { value: 'plain' } })

    expect(screen.queryByText('React')).not.toBeInTheDocument()
    expect(screen.getByText('Docker')).toBeInTheDocument()
  })

  it('combines the search query and the category filter', () => {
    render(<IconGrid icons={icons} />)
    fireEvent.change(screen.getByLabelText('Filter by category'), { target: { value: 'plain' } })
    fireEvent.change(screen.getByPlaceholderText('Search by name, label, or tag…'), {
      target: { value: 'react' },
    })

    expect(screen.getByText(/No icons match/)).toBeInTheDocument()
  })
})
