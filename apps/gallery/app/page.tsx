import { getAllIcons } from '@/lib/icons'
import { SITE_NAME, SITE_URL, siteDescription } from '@/lib/site'
import { IconGrid } from '@/components/IconGrid'
import { Header } from '@/components/Header'
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
    <>
      <a href="#icon-results" className="skip-link">
        Skip to icon results
      </a>

      <Header isHomePage />

      <div className="page">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

        <IconGrid icons={icons} initialQuery={q ?? ''} />
        <Footer />
      </div>
    </>
  )
}
