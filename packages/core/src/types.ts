// The render path (`@web-portfolio/icons`) and the search path
// (`@web-portfolio/icons-sanity`'s picker) need disjoint slices of the same
// generated data. Keeping them as separate types — and separate generated
// files, see registry.generated.ts / metadata.generated.ts — means each
// package's bundle only inlines the fields it actually reads.

export interface RegistryEntry {
  viewBox: string
  innerHTML: string
}

export type Registry = Record<string, RegistryEntry>

export interface IconMetadata {
  label: string
  tags: string[]
  category: string | null
}

export type Metadata = Record<string, IconMetadata>

/** The full shape produced during generation, before it's split into the
 * render-only Registry and the search-only Metadata above. */
export interface GeneratedEntry extends RegistryEntry, IconMetadata {}

export type GeneratedRegistry = Record<string, GeneratedEntry>
