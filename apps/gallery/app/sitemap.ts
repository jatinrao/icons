import type { MetadataRoute } from 'next'
import { getAllIcons } from '@/lib/icons'
import { SITE_URL } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const iconEntries: MetadataRoute.Sitemap = getAllIcons().map((icon) => ({
    url: `${SITE_URL}/icons/${icon.name}`,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [
    {
      url: SITE_URL,
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...iconEntries,
  ]
}
