import { getAllIcons, getCategories, formatCategoryLabel } from '@/lib/icons'
import { SITE_URL } from '@/lib/site'

// The llms.txt convention (https://llmstxt.org) — a curated, plain-text
// summary of a site for AI agents/answer engines to consume directly,
// instead of having to crawl and parse HTML across hundreds of pages.
export async function GET() {
  const icons = getAllIcons()
  const categories = getCategories(icons)

  const categoryLines = categories
    .map((category) => {
      const count = icons.filter((icon) => icon.category === category).length
      return `- ${formatCategoryLabel(category)}: ${count} icons`
    })
    .join('\n')

  const body = `# Icons Gallery

> A free, searchable gallery of ${icons.length} SVG icons — programming languages, frameworks, dev tools, social platforms, and UI icons. Companion site for two npm packages.

## What this is

This site lets developers and designers search, preview, customize (color/stroke/size), and copy or download SVG/PNG icons for use in portfolios, apps, and design work. Every icon shown here is also available as a React component and a Sanity Studio CMS field via two published npm packages.

## npm packages

- @web-portfolio/icons — React component: \`<Icon name="react" />\`. https://www.npmjs.com/package/@web-portfolio/icons
- @web-portfolio/icons-sanity — Sanity Studio icon picker field. https://www.npmjs.com/package/@web-portfolio/icons-sanity

## Usage

\`\`\`tsx
import { Icon } from '@web-portfolio/icons'
<Icon name="react" size={24} color="currentColor" />
\`\`\`

## Icon categories

${categoryLines}

## Pages

- Browse all icons: ${SITE_URL}/
- Each icon has its own page at ${SITE_URL}/icons/<name> (e.g. ${SITE_URL}/icons/react)
- Full list of icon pages: ${SITE_URL}/sitemap.xml

## Source and license

Source: https://github.com/jatinrao/icons (MIT). Icon sets keep their original licenses: devicon (MIT), Material Symbols (Apache-2.0), Simple Icons (CC0-1.0).
`

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
