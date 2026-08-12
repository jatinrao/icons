export interface SvgCustomization {
  size: number
  color: string
  strokeColor: string
  strokeWidth: number
}

interface SvgParts {
  attrs: string
  body: string
  selfClosing: boolean
}

function extractParts(svg: string): SvgParts | null {
  const match = svg.match(/<svg\b([^>]*?)(\/)?>/i)
  if (!match || match.index === undefined) return null

  const [openTag, attrs, selfClosing] = match
  if (selfClosing) {
    return { attrs, body: '', selfClosing: true }
  }

  const closeIndex = svg.lastIndexOf('</svg>')
  if (closeIndex === -1) return null

  return {
    attrs,
    body: svg.slice(match.index + openTag.length, closeIndex),
    selfClosing: false,
  }
}

function setAttr(attrs: string, name: string, value: string): string {
  const withoutExisting = attrs.replace(new RegExp(`\\s${name}="[^"]*"`, 'i'), '')
  return `${withoutExisting} ${name}="${value}"`
}

/**
 * Applies size/color/stroke customization to raw SVG markup for live preview
 * and export. Any inner element's own explicit fill (aside from "none") is
 * rewritten to currentColor so it defers to the new root fill — otherwise a
 * multi-color icon's hardcoded colors would simply ignore the root override.
 * Stroke customization only touches elements that already declare a stroke,
 * so it's a no-op (as intended) on icons that don't use one.
 */
export function applyCustomization(svg: string, options: SvgCustomization): string {
  const parts = extractParts(svg)
  if (!parts) return svg

  let attrs = parts.attrs
  attrs = setAttr(attrs, 'width', String(options.size))
  attrs = setAttr(attrs, 'height', String(options.size))
  attrs = setAttr(attrs, 'fill', options.color)

  let body = parts.body
  body = body.replace(/(\sfill=")(?!none")[^"]*(")/gi, '$1currentColor$2')
  body = body.replace(/(\sstroke=")(?!none")[^"]*(")/gi, `$1${options.strokeColor}$2`)
  body = body.replace(/(\sstroke-width=")[^"]*(")/gi, `$1${options.strokeWidth}$2`)

  return parts.selfClosing ? `<svg${attrs}/>` : `<svg${attrs}>${body}</svg>`
}
