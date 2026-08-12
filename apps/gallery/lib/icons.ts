import { getIconByName as dbGetIconByName, listIcons as dbListIcons, type Db, type Icon } from '@web-portfolio/icons-db'

export interface GalleryIcon {
  name: string
  label: string
  svg: string
  tags: string[]
  category: string | null
}

function toGalleryIcon(icon: Icon): GalleryIcon {
  return {
    name: icon.name,
    label: icon.label,
    svg: icon.svg,
    tags: JSON.parse(icon.tags) as string[],
    category: icon.category,
  }
}

export async function getAllIcons(db: Db): Promise<GalleryIcon[]> {
  const icons = await dbListIcons(db)
  return icons.map(toGalleryIcon)
}

export async function getIconByName(db: Db, name: string): Promise<GalleryIcon | undefined> {
  const icon = await dbGetIconByName(db, name)
  return icon ? toGalleryIcon(icon) : undefined
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
