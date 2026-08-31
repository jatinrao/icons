import Link from 'next/link'
import { categoryAccent, getAllIcons, getIconsByCategory, type GalleryIcon } from '@/lib/icons'

const MAX_RELATED = 12

export function RelatedIcons({ icon }: { icon: GalleryIcon }) {
  if (!icon.category) return null

  const related = getIconsByCategory(getAllIcons(), icon.category)
    .filter((candidate) => candidate.name !== icon.name)
    .sort((a, b) => a.label.localeCompare(b.label))
    .slice(0, MAX_RELATED)

  if (related.length === 0) return null

  return (
    <section className="related-icons" aria-label="Related icons">
      <h2>More icons in this category</h2>
      <div className="icon-grid">
        {related.map((candidate) => {
          const accent = categoryAccent(candidate.category)
          return (
            <Link key={candidate.name} href={`/icons/${candidate.name}`} className="icon-tile">
              <span
                className="glyph"
                style={{ color: accent }}
                dangerouslySetInnerHTML={{ __html: candidate.svg }}
              />
              <span className="name">{candidate.label}</span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
