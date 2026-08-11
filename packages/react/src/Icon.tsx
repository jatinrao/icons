import type { SVGProps } from 'react'
import { registry } from '@web-portfolio/icons-core'

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name' | 'color'> {
  /** The icon's registry name, e.g. "react", "docker". */
  name: string
  /** Width/height in px (or any CSS size value). */
  size?: number | string
  /**
   * Fill color. Only takes effect for monochrome icons (seeded from
   * devicon's "plain"/"line" variants) — multi-color brand marks keep
   * their original colors regardless of this prop.
   */
  color?: string
  /** Accessible name. Omit for a purely decorative icon. */
  title?: string
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function Icon({ name, size = 24, color = 'currentColor', title, ...rest }: IconProps) {
  const entry = registry[name]

  if (!entry) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[@web-portfolio/icons] Unknown icon name: "${name}"`)
    }
    return null
  }

  const markup = title ? `<title>${escapeHtml(title)}</title>${entry.innerHTML}` : entry.innerHTML

  return (
    <svg
      viewBox={entry.viewBox}
      width={size}
      height={size}
      fill={color}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  )
}
