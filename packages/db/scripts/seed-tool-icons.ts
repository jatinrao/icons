import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { createDb } from '../src/client'
import { upsertIconByName } from '../src/queries'
import { ensureCurrentColorFill } from './lib/svg-utils'

const require = createRequire(import.meta.url)

export interface CuratedIcon {
  name: string
  label: string
  tags: string[]
  /** Simple Icons slug, if it differs from the registry `name`. */
  sourceFile?: string
}

// Developer-tool and product brand logos from Simple Icons — distinct from
// SOCIAL_ICONS (social platforms) and MATERIAL_ICONS (generic UI glyphs).
export const TOOL_ICONS: CuratedIcon[] = [
  { name: 'mcp', label: 'MCP', tags: ['ai', 'llm', 'protocol', 'brand'], sourceFile: 'modelcontextprotocol' },
  { name: 'googleanalytics', label: 'Google Analytics', tags: ['analytics', 'google', 'brand'] },
  { name: 'langchain', label: 'LangChain', tags: ['ai', 'llm', 'framework', 'brand'] },
  { name: 'ollama', label: 'Ollama', tags: ['ai', 'llm', 'brand'] },
  { name: 'pydantic', label: 'Pydantic', tags: ['python', 'validation', 'brand'] },
]

async function main() {
  const db = createDb()
  let imported = 0
  let skipped = 0

  for (const icon of TOOL_ICONS) {
    let svgPath: string
    try {
      svgPath = require.resolve(`simple-icons/icons/${icon.sourceFile ?? icon.name}.svg`)
    } catch {
      skipped++
      continue
    }
    if (!existsSync(svgPath)) {
      skipped++
      continue
    }

    const svg = ensureCurrentColorFill(readFileSync(svgPath, 'utf-8'))
    await upsertIconByName(db, {
      name: icon.name,
      label: icon.label,
      svg,
      tags: icon.tags,
      category: 'tools',
    })
    imported++
  }

  console.log(`Seeded ${imported} icons from Simple Icons (${skipped} skipped: missing file).`)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
