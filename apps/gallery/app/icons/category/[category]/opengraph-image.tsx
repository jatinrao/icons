import { ImageResponse } from 'next/og'
import { formatCategoryLabel, getAllIcons, getIconsByCategory } from '@/lib/icons'
import { SITE_NAME } from '@/lib/site'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const label = formatCategoryLabel(category)
  const count = getIconsByCategory(getAllIcons(), category).length

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          background: '#0b0f19',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 30, color: '#0088ff', fontWeight: 600 }}>
          {count} free SVG icons
        </div>
        <div style={{ display: 'flex', fontSize: 72, fontWeight: 700, color: '#ffffff' }}>{label} icons</div>
        <div style={{ display: 'flex', fontSize: 28, color: 'rgba(255,255,255,0.6)' }}>{SITE_NAME}</div>
      </div>
    ),
    { ...size },
  )
}
