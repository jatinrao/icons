'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  categoryAccent,
  formatCategoryLabel,
  getCategories,
  matchesCategory,
  matchesQuery,
  type GalleryIcon,
} from '@/lib/icons'

const PAGE_SIZE = 60
type SortBy = 'name' | 'category'

export function IconGrid({ icons, initialQuery = '' }: { icons: GalleryIcon[]; initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery)
  const [categoryFilters, setCategoryFilters] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<SortBy>('name')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [searchFocused, setSearchFocused] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const categories = useMemo(() => getCategories(icons), [icons])

  const filtered = useMemo(() => {
    const list = icons.filter((icon) => matchesQuery(icon, query) && matchesCategory(icon, categoryFilters))
    if (sortBy === 'category') {
      return [...list].sort(
        (a, b) => (a.category ?? '').localeCompare(b.category ?? '') || a.name.localeCompare(b.name),
      )
    }
    return list
  }, [icons, query, categoryFilters, sortBy])

  // Reset pagination whenever the result set changes underneath it.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [query, categoryFilters, sortBy])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length
  const hasResults = visible.length > 0

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMore) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setVisibleCount((count) => count + PAGE_SIZE)
      },
      { rootMargin: '400px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore])

  function toggleCategory(category: string) {
    setCategoryFilters((current) =>
      current.includes(category) ? current.filter((c) => c !== category) : [...current, category],
    )
  }

  function clearAllFilters() {
    setQuery('')
    setCategoryFilters([])
  }

  const hasActiveFilters = query.trim().length > 0 || categoryFilters.length > 0
  const statusText =
    `Showing ${visible.length} of ${filtered.length} icon${filtered.length === 1 ? '' : 's'}` +
    (filtered.length !== icons.length ? ` (filtered from ${icons.length} total)` : '')

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

      <div className="gallery-body">
        {categories.length > 1 && (
          <aside className="filters-sidebar" aria-label="Filters">
            <div className="filters-sidebar-head">
              <h3>Filters</h3>
              {hasActiveFilters && (
                <button type="button" className="clear-filters-link" onClick={clearAllFilters}>
                  Clear all
                </button>
              )}
            </div>
            {categoryFilters.length > 0 && (
              <p className="filters-count">{categoryFilters.length} filter(s) applied</p>
            )}

            <div className="filter-group">
              <h4>Category</h4>
              <div className="filter-checkboxes">
                {categories.map((category) => (
                  <label key={category} htmlFor={`cat-${category}`}>
                    <input
                      id={`cat-${category}`}
                      type="checkbox"
                      checked={categoryFilters.includes(category)}
                      onChange={() => toggleCategory(category)}
                      style={{ accentColor: categoryAccent(category) }}
                    />
                    {formatCategoryLabel(category)}
                  </label>
                ))}
              </div>
            </div>
          </aside>
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

          <section id="icon-results" tabIndex={-1} aria-label="Icon results">
            {hasResults ? (
              <div className="icon-grid">
                {visible.map((icon) => {
                  const accent = categoryAccent(icon.category)
                  return (
                    <Link key={icon.name} href={`/icons/${icon.name}`} className="icon-tile">
                      <span
                        className="glyph"
                        style={{ '--tile-accent': accent, color: accent } as React.CSSProperties}
                        dangerouslySetInnerHTML={{ __html: icon.svg }}
                      />
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
                <p>Try a different search term or category filter.</p>
                <button type="button" className="button" onClick={clearAllFilters}>
                  Clear filters
                </button>
              </div>
            )}
          </section>

          {hasResults && (
            <div className="load-more-area">
              <div ref={sentinelRef} style={{ height: 1, width: '100%' }} />
              {hasMore ? (
                <button type="button" className="button" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
                  Load more icons
                </button>
              ) : (
                <p className="all-loaded-text">
                  You&rsquo;ve reached the end — {filtered.length} of {filtered.length} icons.
                </p>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
