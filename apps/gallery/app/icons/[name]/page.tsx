import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAllIcons, getIconByName } from '@/lib/icons'
import { SITE_NAME, SITE_URL } from '@/lib/site'
import { IconDetailPanel } from '@/components/IconDetailPanel'
import { DarkModeToggle } from '@/components/DarkModeToggle'
import { Footer } from '@/components/Footer'

export function generateStaticParams() {
  return getAllIcons().map((icon) => ({ name: icon.name }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>
}): Promise<Metadata> {
  const { name } = await params
  const icon = getIconByName(name)
  if (!icon) return {}
  return {
    // The root layout's title.template already appends " — @web-portfolio/icons".
    title: `${icon.label} icon (free SVG)`,
    description: `Free ${icon.label} SVG icon for your React app, portfolio, or design. Copy or download as SVG/PNG, or install @web-portfolio/icons and use <Icon name="${icon.name}" />.`,
    alternates: { canonical: `${SITE_URL}/icons/${icon.name}` },
  }
}

export default async function IconDetailPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const icon = getIconByName(name)
  if (!icon) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    name: `${icon.label} icon`,
    description: `${icon.label} SVG icon, free to use, from ${SITE_NAME}.`,
    contentUrl: `${SITE_URL}/icons/${icon.name}`,
    url: `${SITE_URL}/icons/${icon.name}`,
    encodingFormat: 'image/svg+xml',
    keywords: icon.tags.join(', '),
    isPartOf: {
      '@type': 'Collection',
      name: SITE_NAME,
      url: SITE_URL,
    },
  }

  return (
    <div className="page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="topbar">
        <Link href="/" className="button plain">
          ‹ {SITE_NAME}
        </Link>
        <DarkModeToggle />
      </div>

      <div className="detail-card glass">
        <IconDetailPanel icon={icon} />
      </div>

      <Footer />
    </div>
  )
}
