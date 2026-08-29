import type { SVGProps } from 'react'
import { registry } from '@web-portfolio/icons-core'

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name' | 'color'> {
  /** The icon's registry name, e.g. "react", "docker". */
  name: string
  /** Width/height in px (or any CSS size value). */
  size?: number | string
  /**
   * Fill color. Only takes effect for monochrome icons (seeded from
   * devicon's "plain"/"line" variants, or Material Symbols/Simple Icons) —
   * multi-color brand marks keep their original colors regardless of this
   * prop.
   */
  color?: string
  /**
   * Stroke color. Rewrites any stroke this icon's markup already declares
   * (most devicon/Material/Simple Icons glyphs are fill-only and have none,
   * so this is a no-op for them) and sets it on the root <svg> so elements
   * without their own stroke can still inherit it.
   */
  stroke?: string
  /** Stroke width, applied the same way as `stroke`. */
  strokeWidth?: number | string
  /** Accessible name. Omit for a purely decorative icon. */
  title?: string
}

/**
 * Codepoints Sanity/Vercel's "stega" content-source-map encoding hides
 * inside string field values (zero-width joiners, word-joiner, BOM, and a
 * higher-plane legacy variant) so the Presentation Tool's overlay can map
 * rendered text back to a document field. Invisible in the DOM, but they
 * break `===`/object-key equality — a `name` fetched in draft/preview mode
 * (e.g. through Sanity's Presentation Tool) silently fails the registry
 * lookup below unless stripped first.
 */
const STEGA_CHARS = [
  8203, 8204, 8205, 8288, 8289, 8290, 8291, 65279, 119155, 119156, 119157, 119158, 119159, 119160,
  119161, 119162,
]
const STEGA_PATTERN = new RegExp(`[${STEGA_CHARS.map((c) => `\\u{${c.toString(16)}}`).join('')}]`, 'gu')

function stripStega(value: string): string {
  return value.replace(STEGA_PATTERN, '')
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * An element with its own explicit stroke/stroke-width ignores whatever the
 * root <svg> declares, so `stroke`/`strokeWidth` props need to rewrite those
 * in place for the customization to actually take effect everywhere.
 */
function applyStroke(
  innerHTML: string,
  stroke: string | undefined,
  strokeWidth: number | string | undefined,
): string {
  let result = innerHTML
  if (stroke !== undefined) {
    result = result.replace(/(\sstroke=")(?!none")[^"]*(")/gi, `$1${stroke}$2`)
  }
  if (strokeWidth !== undefined) {
    result = result.replace(/(\sstroke-width=")[^"]*(")/gi, `$1${strokeWidth}$2`)
  }
  return result
}

export function Icon({
  name,
  size = 24,
  color = 'currentColor',
  stroke,
  strokeWidth,
  title,
  style,
  ...rest
}: IconProps) {
  const cleanName = stripStega(name)
  const entry = registry[cleanName]

  if (!entry) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[@web-portfolio/icons] Unknown icon name: "${cleanName}"`)
    }
    return null
  }

  const innerHTML = applyStroke(entry.innerHTML, stroke, strokeWidth)
  const markup = title ? `<title>${escapeHtml(title)}</title>${innerHTML}` : innerHTML

  return (
    <svg
      viewBox={entry.viewBox}
      width={size}
      height={size}
      fill={color}
      stroke={stroke}
      strokeWidth={strokeWidth}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
      // Monochrome icons' inner elements are `fill="currentColor"`, which
      // resolves against the CSS `color` property — not the `fill`
      // attribute set above. Without this, an explicit `color` prop would
      // recolor only the (invisible) root <svg> element and silently do
      // nothing to what's actually drawn.
      style={{ ...style, color }}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  )
}
