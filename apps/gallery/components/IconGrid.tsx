'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { categoryAccent, formatCategoryLabel, getCategories, matchesQuery, type GalleryIcon } from '@/lib/icons'

const PAGE_SIZE = 16
type SortBy = 'name' | 'category'

export function IconGrid({ icons, initialQuery = '' }: { icons: GalleryIcon[]; initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery)
  const [sortBy, setSortBy] = useState<SortBy>('name')
  const [currentPage, setCurrentPage] = useState(1)
  const [searchFocused, setSearchFocused] = useState(false)
  const resultsRef = useRef<HTMLElement | null>(null)

  const categories = useMemo(() => getCategories(icons), [icons])

  const filtered = useMemo(() => {
    const list = icons.filter((icon) => matchesQuery(icon, query))
    if (sortBy === 'category') {
      return [...list].sort(
        (a, b) => (a.category ?? '').localeCompare(b.category ?? '') || a.name.localeCompare(b.name),
      )
    }
    return list
  }, [icons, query, sortBy])

  // Reset to page 1 whenever the result set changes underneath it.
  useEffect(() => {
    setCurrentPage(1)
  }, [query, sortBy])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageStart = (currentPage - 1) * PAGE_SIZE
  const visible = filtered.slice(pageStart, pageStart + PAGE_SIZE)
  const hasResults = visible.length > 0

  function goToPage(page: number) {
    const clamped = Math.min(Math.max(page, 1), totalPages)
    setCurrentPage(clamped)
    resultsRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }

  function clearSearch() {
    setQuery('')
  }

  const statusText = hasResults
    ? `Showing ${pageStart + 1}–${pageStart + visible.length} of ${filtered.length} icon${filtered.length === 1 ? '' : 's'}` +
      (filtered.length !== icons.length ? ` (filtered from ${icons.length} total)` : '')
    : `Showing 0 of ${filtered.length} icons`

  return (
    <div>
      <section className="search-section">
        <div className={`search-field-wrap${searchFocused ? ' focused' : ''}`}>
          <input
            type="search"
            className="search"
            placeholder="Search icons by name, category, or tag…"
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>
      </section>

      {categories.length > 1 && (
        <nav className="category-nav" aria-label="Browse icons by category">
          {categories.map((category) => (
            <Link key={category} href={`/icons/category/${category}`} className="category-chip">
              {formatCategoryLabel(category)}
            </Link>
          ))}
        </nav>
      )}

      <main className="results-main">
        <div className="results-toolbar">
          <p aria-live="polite" role="status" className="status-text">
            {statusText}
          </p>
          <label className="sort-control">
            Sort by
            <select
              aria-label="Sort icons"
              value={sortBy}
              onChange={(event) => setSortBy(event.currentTarget.value as SortBy)}
            >
              <option value="name">Name (A–Z)</option>
              <option value="category">Category</option>
            </select>
          </label>
        </div>

        <section id="icon-results" ref={resultsRef} tabIndex={-1} aria-label="Icon results">
          {hasResults ? (
            <div className="icon-grid">
              {visible.map((icon) => {
                const accent = categoryAccent(icon.category)
                return (
                  <Link key={icon.name} href={`/icons/${icon.name}`} className="icon-tile">
                    <span className="glyph" style={{ color: accent }} dangerouslySetInnerHTML={{ __html: icon.svg }} />
                    <span className="name">{icon.label}</span>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-state-icon" aria-hidden="true">
                🔍
              </span>
              <h3>No icons found</h3>
              <p>Try a different search term.</p>
              <button type="button" className="button" onClick={clearSearch}>
                Clear search
              </button>
            </div>
          )}
        </section>

        {hasResults && totalPages > 1 && (
          <nav className="pagination" aria-label="Icon results pages">
            <button
              type="button"
              className="button"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ‹ Prev
            </button>
            <span className="pagination-status">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              className="button"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next ›
            </button>
          </nav>
        )}
      </main>
    </div>
  )
}
