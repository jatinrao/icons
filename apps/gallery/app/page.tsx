import { getAllIcons } from '@/lib/icons'
import { GITHUB_URL, NPM_URL, NPM_URL_SANITY, SITE_NAME, SITE_URL, siteDescription } from '@/lib/site'
import { IconGrid } from '@/components/IconGrid'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

// Answer engines increasingly parse SoftwareApplication/offers schema for
// "best npm package for X" queries — both published packages get one, kept
// here since the homepage is the one page that represents the whole project.
function npmPackageJsonLd(name: string, description: string, npmUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    programmingLanguage: 'TypeScript',
    license: `${GITHUB_URL}/blob/main/LICENSE`,
    codeRepository: GITHUB_URL,
    url: npmUrl,
    downloadUrl: npmUrl,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const icons = getAllIcons()
  icons.sort((a, b) => a.name.localeCompare(b.name))

  const jsonLd = [
    {
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
    },
    npmPackageJsonLd(
      '@web-portfolio/icons',
      `React icon component backed by a bundled registry of ${icons.length} SVG icons — programming languages, frameworks, dev tools, social platforms, and UI icons.`,
      NPM_URL,
    ),
    npmPackageJsonLd(
      '@web-portfolio/icons-sanity',
      `Sanity Studio icon picker input, backed by the same ${icons.length}-icon registry as @web-portfolio/icons.`,
      NPM_URL_SANITY,
    ),
  ]

  return (
    <>
      <a href="#icon-results" className="skip-link">
        Skip to icon results
      </a>

      <Header />

      <div className="page">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

        <div className="home-hero">
          <h1>Free SVG icons for React, portfolios &amp; design</h1>
          <p className="category-hub-intro">{siteDescription()}</p>
        </div>

        <IconGrid icons={icons} initialQuery={q ?? ''} />
        <Footer />
      </div>
    </>
  )
}
