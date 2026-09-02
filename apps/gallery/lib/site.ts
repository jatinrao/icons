import { getAllIcons } from './icons'

// Vercel sets VERCEL_URL automatically on every deployment (no config
// needed to get a working absolute URL); SITE_URL overrides it once a
// custom domain is attached.
export const SITE_URL =
  process.env.SITE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

export const SITE_NAME = '@web-portfolio/icons'

export const GITHUB_URL = 'https://github.com/jatinrao/icons'
export const NPM_URL = 'https://www.npmjs.com/package/@web-portfolio/icons'
export const NPM_URL_SANITY = 'https://www.npmjs.com/package/@web-portfolio/icons-sanity'
export const REQUEST_ICON_URL = `${GITHUB_URL}/issues/new?title=Icon+request%3A+&labels=icon-request`

// Computed from the live registry rather than hardcoded, so this never goes
// stale as icons are added. "Portfolio icons" is front-loaded deliberately —
// it's the word order that wasn't ranking (unlike "SVG icon...portfolio",
// covered by the <title> tag), and anything past ~160 chars here gets cut
// in search snippets, so it needs to land before the truncation point.
export function siteDescription(): string {
  const count = getAllIcons().length
  return `Browse and copy ${count}+ free SVG icons — portfolio icons, tech-stack badges, and social icons for React apps and personal sites. Customize colors and stroke, then copy or download as SVG or PNG. Also published as the @web-portfolio/icons React component and @web-portfolio/icons-sanity Sanity plugin.`
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

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }
}
