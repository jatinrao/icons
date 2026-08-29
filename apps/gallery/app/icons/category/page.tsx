import Link from 'next/link'
import type { Metadata } from 'next'
import { categoryAccent, categorySeoCopy, formatCategoryLabel, getAllIcons, getCategories } from '@/lib/icons'
import { SITE_NAME, SITE_URL, breadcrumbJsonLd } from '@/lib/site'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Icon categories',
  description:
    'Browse free SVG icons by category — programming languages, frameworks, Material Symbols, social platform logos, and developer tools.',
  alternates: { canonical: `${SITE_URL}/icons/category` },
}

export default function CategoryIndexPage() {
  const icons = getAllIcons()
  const categories = getCategories(icons)

  const jsonLd = breadcrumbJsonLd([
    { name: SITE_NAME, url: SITE_URL },
    { name: 'Categories', url: `${SITE_URL}/icons/category` },
  ])

  return (
    <>
      <Header />

      <div className="page">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

        <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Categories' }]} />

        <h1>Icon categories</h1>
        <p className="category-hub-intro">
          {icons.length}+ free SVG icons, organized into {categories.length} categories by style and source.
        </p>

        <div className="category-hub-grid">
          {categories.map((category) => {
            const count = icons.filter((icon) => icon.category === category).length
            return (
              <Link
                key={category}
                href={`/icons/category/${category}`}
                className="category-card"
                style={{ '--card-accent': categoryAccent(category) } as React.CSSProperties}
              >
                <h2>{formatCategoryLabel(category)}</h2>
                <p>{categorySeoCopy(category)}</p>
                <span className="category-card-count">{count} icons</span>
              </Link>
            )
          })}
        </div>

        <Footer />
      </div>
    </>
  )
}
