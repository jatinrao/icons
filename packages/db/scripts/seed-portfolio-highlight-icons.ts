/**
 * Adds 4 generic Material Symbols icons to back the portfolio site's
 * feature-highlight row (Lighthouse score / CMS coverage / Languages
 * supported / Packages published), which previously used Apple SF Symbols
 * exported as local PNGs (bolt.shield, sparkle.text.clipboard,
 * globe.central.south.asia, gift) — not safe to trace/redistribute into
 * this openly published MIT icon package. These are semantically close
 * generic stand-ins from the same Apache-2.0 Material Symbols source
 * already used elsewhere in this registry (see seed-material-icons.ts),
 * not reproductions of Apple's proprietary glyphs.
 *
 * Usage:
 *   pnpm --filter @web-portfolio/icons-db seed-portfolio-highlight-icons
 * Also runs as part of `seed-all`.
 */
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { createDb } from '../src/client'
import { upsertIconByName } from '../src/queries'
import { ensureCurrentColorFill } from './lib/svg-utils'
import type { CuratedIcon } from './seed-material-icons'

const require = createRequire(import.meta.url)

const PORTFOLIO_HIGHLIGHT_ICONS: CuratedIcon[] = [
  { name: 'bolt', label: 'Bolt', tags: ['performance', 'speed', 'lightning', 'utility'] },
  { name: 'translate', label: 'Translate', tags: ['language', 'i18n', 'locale', 'globe', 'utility'] },
  { name: 'checklist', label: 'Checklist', tags: ['tasks', 'list', 'coverage', 'cms', 'utility'] },
  {
    name: 'gift',
    label: 'Gift',
    tags: ['gift', 'package', 'box', 'utility'],
    sourceFile: 'featured_seasonal_and_gifts',
  },
]

async function main() {
  const packageJsonPath = require.resolve('@material-symbols/svg-400/package.json')
  const packageRoot = packageJsonPath.replace(/package\.json$/, '')

  const db = createDb()
  let imported = 0
  let skipped = 0

  for (const icon of PORTFOLIO_HIGHLIGHT_ICONS) {
    const svgPath = `${packageRoot}outlined/${icon.sourceFile ?? icon.name}.svg`
    if (!existsSync(svgPath)) {
      console.warn(`  missing source file for "${icon.name}": ${svgPath}`)
      skipped++
      continue
    }

    const svg = ensureCurrentColorFill(readFileSync(svgPath, 'utf-8'))
    await upsertIconByName(db, {
      name: icon.name,
      label: icon.label,
      svg,
      tags: icon.tags,
      category: 'material',
    })
    console.log(`  upserted "${icon.name}"`)
    imported++
  }

  console.log(`\nSeeded ${imported} portfolio-highlight icons from Material Symbols (${skipped} skipped: missing file).`)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
