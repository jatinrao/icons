import { getAllIcons } from './icons'

// Vercel sets VERCEL_URL automatically on every deployment (no config
// needed to get a working absolute URL); SITE_URL overrides it once a
// custom domain is attached.
export const SITE_URL =
  process.env.SITE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

export const SITE_NAME = '@web-portfolio/icons'

export const GITHUB_URL = 'https://github.com/jatinrao/icons'
export const NPM_URL = 'https://www.npmjs.com/package/@web-portfolio/icons'
export const REQUEST_ICON_URL = `${GITHUB_URL}/issues/new?title=Icon+request%3A+&labels=icon-request`

// Computed from the live registry rather than hardcoded, so this never goes
// stale as icons are added.
export function siteDescription(): string {
  const count = getAllIcons().length
  return `Browse and copy ${count}+ free SVG icons — programming languages, frameworks, dev tools, social platforms, and UI icons. Search, customize colors and stroke, then copy or download as SVG or PNG. Companion gallery for the @web-portfolio/icons React package and @web-portfolio/icons-sanity Sanity Studio plugin.`
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
