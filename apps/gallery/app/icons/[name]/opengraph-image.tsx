import { ImageResponse } from 'next/og'
import { getIconByName } from '@/lib/icons'
import { SITE_NAME } from '@/lib/site'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// A white card behind the glyph, not the page's dark background, because
// most "plain" icons bake in a black/currentColor fill with no CSS context
// to resolve against here — see globals.css's --icon-tile-bg comment for
// the same constraint on the live gallery grid.
export default async function Image({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const icon = getIconByName(name)
  const label = icon?.label ?? 'Icon'
  const glyphSrc = icon ? `data:image/svg+xml;base64,${Buffer.from(icon.svg).toString('base64')}` : null

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 64,
          background: '#0b0f19',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            width: 280,
            height: 280,
            borderRadius: 48,
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {glyphSrc && <img src={glyphSrc} width={180} height={180} alt="" />}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', fontSize: 64, fontWeight: 700, color: '#ffffff' }}>{label} icon</div>
          <div style={{ display: 'flex', fontSize: 30, color: 'rgba(255,255,255,0.6)' }}>
            Free SVG &middot; {SITE_NAME}
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
