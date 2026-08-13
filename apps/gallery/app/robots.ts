import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

// Explicitly named, not just a wildcard allow — a clear, unambiguous signal
// that AI crawlers/answer engines are welcome here, since this gallery
// exists specifically to be discoverable before someone installs the npm
// package.
const AI_CRAWLERS = [
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'anthropic-ai',
  'PerplexityBot',
  'Google-Extended',
  'CCBot',
  'Amazonbot',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: '/' })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
