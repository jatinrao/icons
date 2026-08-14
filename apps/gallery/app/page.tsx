import { getAllIcons } from '@/lib/icons'
import { SITE_NAME, SITE_URL, siteDescription } from '@/lib/site'
import { IconGrid } from '@/components/IconGrid'
import { DarkModeToggle } from '@/components/DarkModeToggle'
import { Footer } from '@/components/Footer'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const icons = getAllIcons()
  icons.sort((a, b) => a.name.localeCompare(b.name))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    description: siteDescription(),
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <div className="page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <a href="#icon-results" className="skip-link">
        Skip to icon results
      </a>

      <header className="topbar glass">
        <div className="brand">
          <h1>Icon Library</h1>
          <span className="count">{icons.length} icons</span>
        </div>
        <DarkModeToggle />
      </header>

      <IconGrid icons={icons} initialQuery={q ?? ''} />
      <Footer />
    </div>
  )
}
