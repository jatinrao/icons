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
}

const COMMUNICATION_ICONS: CuratedIcon[] = [
  { name: 'mail', label: 'Mail', tags: ['communication', 'email', 'contact'] },
  { name: 'call', label: 'Call', tags: ['communication', 'phone', 'contact'] },
  { name: 'chat', label: 'Chat', tags: ['communication', 'message', 'contact'] },
  { name: 'sms', label: 'SMS', tags: ['communication', 'message', 'contact'] },
  { name: 'video_call', label: 'Video Call', tags: ['communication', 'video', 'contact'] },
  { name: 'location_on', label: 'Location', tags: ['communication', 'map', 'contact'] },
  { name: 'alternate_email', label: 'Email', tags: ['communication', 'email', 'contact', 'at'] },
  { name: 'forum', label: 'Forum', tags: ['communication', 'discussion'] },
  { name: 'language', label: 'Website', tags: ['communication', 'website', 'globe', 'contact'] },
]

const NAVIGATION_ICONS: CuratedIcon[] = [
  { name: 'arrow_back', label: 'Arrow Back', tags: ['navigation', 'arrow', 'utility'] },
  { name: 'arrow_forward', label: 'Arrow Forward', tags: ['navigation', 'arrow', 'utility'] },
  { name: 'arrow_upward', label: 'Arrow Up', tags: ['navigation', 'arrow', 'utility'] },
  { name: 'arrow_downward', label: 'Arrow Down', tags: ['navigation', 'arrow', 'utility'] },
  { name: 'chevron_left', label: 'Chevron Left', tags: ['navigation', 'arrow', 'utility'] },
  { name: 'chevron_right', label: 'Chevron Right', tags: ['navigation', 'arrow', 'utility'] },
  {
    name: 'keyboard_arrow_up',
    label: 'Arrow Up (small)',
    tags: ['navigation', 'arrow', 'utility'],
  },
  {
    name: 'keyboard_arrow_down',
    label: 'Arrow Down (small)',
    tags: ['navigation', 'arrow', 'utility'],
  },
  { name: 'menu', label: 'Menu', tags: ['navigation', 'utility'] },
  { name: 'close', label: 'Close', tags: ['navigation', 'utility'] },
  { name: 'home', label: 'Home', tags: ['navigation', 'utility'] },
  { name: 'search', label: 'Search', tags: ['navigation', 'utility'] },
  { name: 'refresh', label: 'Refresh', tags: ['navigation', 'utility'] },
  { name: 'add', label: 'Add', tags: ['navigation', 'utility'] },
  { name: 'remove', label: 'Remove', tags: ['navigation', 'utility'] },
  { name: 'check', label: 'Check', tags: ['navigation', 'utility'] },
  { name: 'more_vert', label: 'More (vertical)', tags: ['navigation', 'utility'] },
  { name: 'more_horiz', label: 'More (horizontal)', tags: ['navigation', 'utility'] },
  { name: 'download', label: 'Download', tags: ['navigation', 'utility'] },
  { name: 'upload', label: 'Upload', tags: ['navigation', 'utility'] },
  {
    name: 'open_in_new',
    label: 'Open in New',
    tags: ['navigation', 'utility', 'external-link'],
  },
  { name: 'first_page', label: 'First Page', tags: ['navigation', 'utility'] },
  { name: 'last_page', label: 'Last Page', tags: ['navigation', 'utility'] },
]

export const MATERIAL_ICONS: CuratedIcon[] = [...COMMUNICATION_ICONS, ...NAVIGATION_ICONS]

async function main() {
  const packageJsonPath = require.resolve('@material-symbols/svg-400/package.json')
  const packageRoot = packageJsonPath.replace(/package\.json$/, '')

  const db = createDb()
  let imported = 0
  let skipped = 0

  for (const icon of MATERIAL_ICONS) {
    const svgPath = `${packageRoot}outlined/${icon.name}.svg`
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
      category: 'material',
    })
    imported++
  }

  console.log(`Seeded ${imported} icons from Material Symbols (${skipped} skipped: missing file).`)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
