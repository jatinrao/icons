import { registry, type RegistryEntry } from '@web-portfolio/icons-core'

export interface GalleryIcon {
  name: string
  label: string
  svg: string
  tags: string[]
  category: string | null
}

/**
 * The registry stores viewBox/innerHTML split apart (that's what the React
 * component and Sanity picker need); the gallery's copy/download/customize
 * flows all work on a raw `<svg>...</svg>` string instead, so this
 * reassembles one.
 */
function toSvgString(entry: RegistryEntry): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${entry.viewBox}">${entry.innerHTML}</svg>`
}

function toGalleryIcon(name: string, entry: RegistryEntry): GalleryIcon {
  return {
    name,
    label: entry.label,
    svg: toSvgString(entry),
    tags: entry.tags,
    category: entry.category,
  }
}

export function getAllIcons(): GalleryIcon[] {
  return Object.entries(registry).map(([name, entry]) => toGalleryIcon(name, entry))
}

export function getIconByName(name: string): GalleryIcon | undefined {
  const entry = registry[name]
  return entry ? toGalleryIcon(name, entry) : undefined
}

export function matchesQuery(icon: Pick<GalleryIcon, 'name' | 'label' | 'tags'>, query: string): boolean {
  if (!query.trim()) return true
  const q = query.trim().toLowerCase()
  return (
    icon.name.toLowerCase().includes(q) ||
    icon.label.toLowerCase().includes(q) ||
    icon.tags.some((tag) => tag.toLowerCase().includes(q))
  )
}

/** `category` of "all" (the dropdown's default) matches every icon. */
export function matchesCategory(icon: Pick<GalleryIcon, 'category'>, category: string): boolean {
  return category === 'all' || icon.category === category
}

export function getCategories(icons: Pick<GalleryIcon, 'category'>[]): string[] {
  const set = new Set<string>()
  for (const icon of icons) {
    if (icon.category) set.add(icon.category)
  }
  return Array.from(set).sort()
}

export function formatCategoryLabel(category: string): string {
  return category
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ')
}
