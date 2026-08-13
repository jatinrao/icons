'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  formatCategoryLabel,
  getCategories,
  matchesCategory,
  matchesQuery,
  type GalleryIcon,
} from '@/lib/icons'

export function IconGrid({ icons, initialQuery = '' }: { icons: GalleryIcon[]; initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState('all')

  const categories = useMemo(() => getCategories(icons), [icons])

  const filtered = useMemo(
    () => icons.filter((icon) => matchesQuery(icon, query) && matchesCategory(icon, category)),
    [icons, query, category],
  )

  return (
    <div>
      <div className="filters">
        <input
          type="search"
          className="search"
          placeholder="Search by name, label, or tag…"
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
        />
        <select
          className="category-select"
          value={category}
          onChange={(event) => setCategory(event.currentTarget.value)}
          aria-label="Filter by category"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {formatCategoryLabel(c)}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="empty">No icons match your filters.</p>
      ) : (
        <div className="icon-grid">
          {filtered.map((icon) => (
            <Link key={icon.name} href={`/icons/${icon.name}`} className="icon-tile">
              <span className="glyph" dangerouslySetInnerHTML={{ __html: icon.svg }} />
              <span className="name">{icon.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
