import { metadata, registry, type IconMetadata, type RegistryEntry } from '@web-portfolio/icons-core'

export interface GalleryIcon {
  name: string
  label: string
  svg: string
  tags: string[]
  category: string | null
}

/**
 * icons-core splits render data (viewBox/innerHTML) from search metadata
 * (label/tags/category) into separate generated files — that's what the
 * React component and Sanity picker each need in isolation. The gallery is
 * the one consumer that wants both at once, merged back together here; its
 * copy/download/customize flows all work on a raw `<svg>...</svg>` string
 * instead of the split representation.
 */
function toSvgString(entry: RegistryEntry): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${entry.viewBox}">${entry.innerHTML}</svg>`
}

function toGalleryIcon(name: string, entry: RegistryEntry, meta: IconMetadata): GalleryIcon {
  return {
    name,
    label: meta.label,
    svg: toSvgString(entry),
    tags: meta.tags,
    category: meta.category,
  }
}

export function getAllIcons(): GalleryIcon[] {
  return Object.entries(registry).map(([name, entry]) => toGalleryIcon(name, entry, metadata[name]))
}

export function getIconByName(name: string): GalleryIcon | undefined {
  const entry = registry[name]
  const meta = metadata[name]
  return entry && meta ? toGalleryIcon(name, entry, meta) : undefined
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

/** An empty selection (the sidebar's default, nothing checked) matches every icon. */
export function matchesCategory(icon: Pick<GalleryIcon, 'category'>, categories: string[]): boolean {
  return categories.length === 0 || (icon.category !== null && categories.includes(icon.category))
}

export function getCategories(icons: Pick<GalleryIcon, 'category'>[]): string[] {
  const set = new Set<string>()
  for (const icon of icons) {
    if (icon.category) set.add(icon.category)
  }
  return Array.from(set).sort()
}

export function getIconsByCategory(icons: GalleryIcon[], category: string): GalleryIcon[] {
  return icons.filter((icon) => icon.category === category)
}

// One SEO-oriented sentence per category, surfaced as visible intro copy on
// each /icons/category/[category] page — matches the query patterns people
// actually search (e.g. "material design icons", "social media icons svg")
// rather than just restating the category's internal slug name.
const CATEGORY_SEO_COPY: Record<string, string> = {
  plain: 'Flat, single-color icons for programming languages, frameworks, and dev tools — ideal for tech-stack sections, skill badges, and "built with" lists.',
  original: "Full-color, brand-accurate logos for programming languages, frameworks, and dev tools, matching each project's official brand colors.",
  material: "Google's Material Symbols — general-purpose UI icons for navigation, actions, and interface elements in web and app design.",
  social: 'Brand icons for social platforms and popular web services, from Simple Icons — for footers, share buttons, and contact sections.',
  tools: 'Icons for developer tools and editors used in everyday software work.',
  'original-wordmark': 'Full-color wordmark logos — the text-based brand mark for programming languages and frameworks.',
  'plain-wordmark': 'Flat, single-color wordmark logos for programming languages and frameworks.',
}

export function categorySeoCopy(category: string): string {
  return CATEGORY_SEO_COPY[category] ?? `Free SVG icons in the ${formatCategoryLabel(category)} category.`
}

// "original"/"original-wordmark" are devicon's own internal variant names —
// meaningless to someone browsing the gallery who doesn't know devicon's
// authoring conventions. Label them by source instead; every other category
// (plain, material, social, tools, ...) still gets the generic title-cased
// transform below.
const CATEGORY_LABEL_OVERRIDES: Record<string, string> = {
  original: 'Devicon',
  'original-wordmark': 'Devicon Wordmark',
}

export function formatCategoryLabel(category: string): string {
  if (CATEGORY_LABEL_OVERRIDES[category]) return CATEGORY_LABEL_OVERRIDES[category]
  return category
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ')
}

// Curated for the categories this project actually seeds today; any future
// category not in this map still gets a deterministic (not random) color via
// a simple string hash, so the UI never breaks — it just doesn't get a
// hand-picked color until this map is updated.
const CATEGORY_ACCENT: Record<string, string> = {
  original: 'var(--accent-blue)',
  plain: 'var(--accent-indigo)',
  'original-wordmark': 'var(--accent-purple)',
  'plain-wordmark': 'var(--accent-teal)',
  material: 'var(--accent-orange)',
  social: 'var(--accent-pink)',
  tools: 'var(--accent-green)',
}

const ACCENT_FALLBACK_PALETTE = [
  'var(--accent-blue)',
  'var(--accent-indigo)',
  'var(--accent-purple)',
  'var(--accent-teal)',
  'var(--accent-orange)',
  'var(--accent-pink)',
  'var(--accent-green)',
  'var(--accent-red)',
  'var(--accent-yellow)',
  'var(--accent-mint)',
  'var(--accent-cyan)',
  'var(--accent-brown)',
]

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

export function categoryAccent(category: string | null): string {
  if (!category) return 'var(--accent-blue)'
  return CATEGORY_ACCENT[category] ?? ACCENT_FALLBACK_PALETTE[hashString(category) % ACCENT_FALLBACK_PALETTE.length]
}
