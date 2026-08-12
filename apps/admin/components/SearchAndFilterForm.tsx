'use client'

import { formatCategoryLabel } from '@/lib/icons'

interface SearchAndFilterFormProps {
  query?: string
  category?: string
  categories: string[]
}

export function SearchAndFilterForm({ query, category, categories }: SearchAndFilterFormProps) {
  return (
    <form className="filters">
      <input
        type="search"
        name="q"
        defaultValue={query ?? ''}
        placeholder="Search by name, label, or tag…"
        className="search"
      />
      <select
        name="category"
        defaultValue={category ?? 'all'}
        className="category-select"
        aria-label="Filter by category"
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
      >
        <option value="all">All categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {formatCategoryLabel(c)}
          </option>
        ))}
      </select>
    </form>
  )
}
