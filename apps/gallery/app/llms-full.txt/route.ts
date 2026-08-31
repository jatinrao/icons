import { formatCategoryLabel, getAllIcons, getCategories } from '@/lib/icons'
import { SITE_NAME, SITE_URL } from '@/lib/site'

// The full companion to /llms.txt (https://llmstxt.org) — every icon name,
// so an answer engine can check whether a specific icon exists (e.g. "does
// this library have a Kubernetes icon") from one fetch instead of crawling
// all /icons/[name] pages.
export async function GET() {
  const icons = getAllIcons()
  const categories = getCategories(icons)

  const sections = categories
    .map((category) => {
      const inCategory = icons
        .filter((icon) => icon.category === category)
        .sort((a, b) => a.name.localeCompare(b.name))

      const lines = inCategory
        .map((icon) => `- ${icon.name}: ${icon.label} — tags: ${icon.tags.join(', ')}`)
        .join('\n')

      return `## ${formatCategoryLabel(category)} (${inCategory.length})\n\n${lines}`
    })
    .join('\n\n')

  const body = `# ${SITE_NAME} — full icon index

> Every one of the ${icons.length} icon names in the registry, grouped by category, with
> their search tags. See ${SITE_URL}/llms.txt for the general site summary and npm package
> links; each name below is also a page at ${SITE_URL}/icons/<name>.

${sections}
`

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
