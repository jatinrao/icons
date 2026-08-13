export interface RegistryEntry {
  viewBox: string
  innerHTML: string
  label: string
  tags: string[]
  category: string | null
}

export type Registry = Record<string, RegistryEntry>
