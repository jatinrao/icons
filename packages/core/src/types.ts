export interface RegistryEntry {
  viewBox: string
  innerHTML: string
  label: string
  tags: string[]
}

export type Registry = Record<string, RegistryEntry>
