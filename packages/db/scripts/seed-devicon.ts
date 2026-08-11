import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { createDb } from '../src/client'
import { upsertIconByName } from '../src/queries'

const require = createRequire(import.meta.url)

interface DeviconEntry {
  name: string
  altnames: string[]
  tags: string[]
  versions: { svg: string[]; font: string[] }
  color: string
  aliases: { base: string; alias: string }[]
}

// Prefer the monochrome "plain" glyph (meant to be recolored via currentColor)
// over the multi-color "original" brand mark, which generate-registry leaves
// untouched so real brand colors aren't flattened.
const VARIANT_PRIORITY = ['plain', 'original', 'line']

export function pickVariant(versions: string[]): string | undefined {
  const glyphOnly = versions.filter((v) => !v.endsWith('-wordmark'))
  const pool = glyphOnly.length > 0 ? glyphOnly : versions
  for (const preferred of VARIANT_PRIORITY) {
    if (pool.includes(preferred)) return preferred
  }
  return pool[0]
}

export function toLabel(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim()
}

async function main() {
  const deviconManifestPath = require.resolve('devicon/devicon.json')
  const deviconRoot = path.dirname(deviconManifestPath)
  const manifest = JSON.parse(readFileSync(deviconManifestPath, 'utf-8')) as DeviconEntry[]

  const db = createDb()
  let imported = 0
  let skipped = 0

  for (const entry of manifest) {
    const variant = pickVariant(entry.versions.svg)
    if (!variant) {
      skipped++
      continue
    }

    const svgPath = path.join(deviconRoot, 'icons', entry.name, `${entry.name}-${variant}.svg`)
    if (!existsSync(svgPath)) {
      skipped++
      continue
    }

    const svg = readFileSync(svgPath, 'utf-8')
    await upsertIconByName(db, {
      name: entry.name,
      label: toLabel(entry.name),
      svg,
      tags: Array.from(new Set([...entry.tags, ...entry.altnames])),
      category: variant,
    })
    imported++
  }

  console.log(`Seeded ${imported} icons from devicon (${skipped} skipped: no usable SVG variant).`)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
