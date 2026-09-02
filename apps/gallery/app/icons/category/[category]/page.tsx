import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { categorySeoCopy, formatCategoryLabel, getAllIcons, getCategories, getIconsByCategory } from '@/lib/icons'
import { SITE_NAME, SITE_URL, breadcrumbJsonLd } from '@/lib/site'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { IconGrid } from '@/components/IconGrid'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export function generateStaticParams() {
  return getCategories(getAllIcons()).map((category) => ({ category }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>
}): Promise<Metadata> {
  const { category } = await params
  const icons = getIconsByCategory(getAllIcons(), category)
  if (icons.length === 0) return {}

  const label = formatCategoryLabel(category)
  return {
    title: `${label} SVG icons`,
    description: `${icons.length} free ${label} SVG icons. ${categorySeoCopy(category)} Copy or download as SVG/PNG, or use them in React via @web-portfolio/icons.`,
    alternates: { canonical: `${SITE_URL}/icons/category/${category}` },
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const allIcons = getAllIcons()
  const icons = getIconsByCategory(allIcons, category)
  if (icons.length === 0) notFound()

  const label = formatCategoryLabel(category)

  const jsonLd = [
    breadcrumbJsonLd([
      { name: SITE_NAME, url: SITE_URL },
      { name: 'Categories', url: `${SITE_URL}/icons/category` },
      { name: label, url: `${SITE_URL}/icons/category/${category}` },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${label} icons`,
      description: categorySeoCopy(category),
      url: `${SITE_URL}/icons/category/${category}`,
      isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: icons.length,
        itemListElement: icons.map((icon, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: `${SITE_URL}/icons/${icon.name}`,
          name: `${icon.label} icon`,
        })),
      },
    },
  ]

  return (
    <>
      <Header />

      <div className="page">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

        <Breadcrumbs
          items={[{ name: 'Home', href: '/' }, { name: 'Categories', href: '/icons/category' }, { name: label }]}
        />

        <h1>{label} icons</h1>
        <p className="category-hub-intro">
          {icons.length} free {label} SVG icons. {categorySeoCopy(category)}
        </p>

        <IconGrid icons={icons} />

        <Footer />
      </div>
    </>
  )
}
