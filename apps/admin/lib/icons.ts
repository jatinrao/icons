import {
  createIcon as dbCreateIcon,
  deleteIcon as dbDeleteIcon,
  DuplicateIconNameError,
  getIconById,
  listIcons as dbListIcons,
  updateIcon as dbUpdateIcon,
  type Db,
  type Icon,
  type IconInput,
} from '@web-portfolio/icons-db'

// Allows hyphens (our own convention) and underscores (Material Symbols'
// canonical names, e.g. "arrow_back") as word separators.
const NAME_PATTERN = /^[a-z0-9]+([-_][a-z0-9]+)*$/

export class ValidationError extends Error {}

export function validateIconInput(input: { name: string; label: string; svg: string }): void {
  if (!NAME_PATTERN.test(input.name)) {
    throw new ValidationError(
      'Name must be lowercase letters, numbers, hyphens, or underscores (e.g. "my-icon" or "arrow_back").',
    )
  }
  if (!input.label.trim()) {
    throw new ValidationError('Label is required.')
  }
  if (!input.svg.includes('<svg')) {
    throw new ValidationError('SVG markup must contain an <svg> element.')
  }
}

export async function listIcons(db: Db, query?: string, category?: string): Promise<Icon[]> {
  const all = await dbListIcons(db)
  return all.filter((icon) => {
    if (category && category !== 'all' && icon.category !== category) return false
    if (!query?.trim()) return true

    const q = query.trim().toLowerCase()
    const tags = JSON.parse(icon.tags) as string[]
    return (
      icon.name.toLowerCase().includes(q) ||
      icon.label.toLowerCase().includes(q) ||
      tags.some((tag) => tag.toLowerCase().includes(q))
    )
  })
}

export function getCategories(icons: Pick<Icon, 'category'>[]): string[] {
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

export async function createIcon(db: Db, input: IconInput): Promise<Icon> {
  validateIconInput(input)
  return dbCreateIcon(db, input)
}

export async function updateIcon(db: Db, id: string, input: Partial<IconInput>): Promise<void> {
  const existing = await getIconById(db, id)
  if (!existing) {
    throw new ValidationError('Icon not found.')
  }

  validateIconInput({
    name: input.name ?? existing.name,
    label: input.label ?? existing.label,
    svg: input.svg ?? existing.svg,
  })

  await dbUpdateIcon(db, id, input)
}

export async function deleteIcon(db: Db, id: string): Promise<void> {
  await dbDeleteIcon(db, id)
}

export { getIconById, DuplicateIconNameError }
