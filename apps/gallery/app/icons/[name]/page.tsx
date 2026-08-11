import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { getAllIcons, getIconByName } from '@/lib/icons'
import { CopyDownloadActions } from '@/components/CopyDownloadActions'
import { UsageSnippet } from '@/components/UsageSnippet'
import { DarkModeToggle } from '@/components/DarkModeToggle'
import { Footer } from '@/components/Footer'

export const revalidate = 3600

export async function generateStaticParams() {
  const icons = await getAllIcons(db)
  return icons.map((icon) => ({ name: icon.name }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>
}): Promise<Metadata> {
  const { name } = await params
  const icon = await getIconByName(db, name)
  if (!icon) return {}
  return {
    title: `${icon.label} icon — Icons Gallery`,
    description: `Copy or download the ${icon.label} icon as SVG or PNG.`,
  }
}

export default async function IconDetailPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const icon = await getIconByName(db, name)
  if (!icon) notFound()

  return (
    <div className="page">
      <div className="topbar">
        <Link href="/" className="button">
          ← All icons
        </Link>
        <DarkModeToggle />
      </div>

      <div className="detail-card">
        <div className="detail-glyph" dangerouslySetInnerHTML={{ __html: icon.svg }} />
        <div>
          <h1 style={{ margin: '0 0 0.35rem' }}>{icon.label}</h1>
          <p style={{ margin: 0, color: 'var(--muted)', fontFamily: 'ui-monospace, monospace' }}>
            {icon.name}
          </p>
        </div>

        {icon.tags.length > 0 && (
          <div className="detail-tags">
            {icon.tags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        <CopyDownloadActions name={icon.name} svg={icon.svg} />
        <UsageSnippet name={icon.name} />
      </div>

      <Footer />
    </div>
  )
}
