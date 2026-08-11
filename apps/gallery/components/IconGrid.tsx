'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { matchesQuery, type GalleryIcon } from '@/lib/icons'

export function IconGrid({ icons }: { icons: GalleryIcon[] }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => icons.filter((icon) => matchesQuery(icon, query)), [icons, query])

  return (
    <div>
      <input
        type="search"
        className="search"
        placeholder="Search by name, label, or tag…"
        value={query}
        onChange={(event) => setQuery(event.currentTarget.value)}
      />

      {filtered.length === 0 ? (
        <p className="empty">No icons match &ldquo;{query}&rdquo;.</p>
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
