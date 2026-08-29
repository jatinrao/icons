import type { MetadataRoute } from 'next'
import { getAllIcons, getCategories } from '@/lib/icons'
import { SITE_URL } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const icons = getAllIcons()

  const iconEntries: MetadataRoute.Sitemap = icons.map((icon) => ({
    url: `${SITE_URL}/icons/${icon.name}`,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  // Category pages target broader head-term searches (e.g. "material design
  // icons") that no single icon page can rank for, so they sit above icon
  // pages but below the homepage in priority.
  const categoryEntries: MetadataRoute.Sitemap = getCategories(icons).map((category) => ({
    url: `${SITE_URL}/icons/category/${category}`,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [
    {
      url: SITE_URL,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/icons/category`,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...categoryEntries,
    ...iconEntries,
  ]
}
