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

const NAME_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

export class ValidationError extends Error {}

export function validateIconInput(input: { name: string; label: string; svg: string }): void {
  if (!NAME_PATTERN.test(input.name)) {
    throw new ValidationError(
      'Name must be lowercase letters, numbers, and hyphens only (e.g. "my-icon").',
    )
  }
  if (!input.label.trim()) {
    throw new ValidationError('Label is required.')
  }
  if (!input.svg.includes('<svg')) {
    throw new ValidationError('SVG markup must contain an <svg> element.')
  }
}

export async function listIcons(db: Db, query?: string): Promise<Icon[]> {
  const all = await dbListIcons(db)
  if (!query?.trim()) return all

  const q = query.trim().toLowerCase()
  return all.filter((icon) => {
    const tags = JSON.parse(icon.tags) as string[]
    return (
      icon.name.toLowerCase().includes(q) ||
      icon.label.toLowerCase().includes(q) ||
      tags.some((tag) => tag.toLowerCase().includes(q))
    )
  })
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
