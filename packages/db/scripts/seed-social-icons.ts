import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { createDb } from '../src/client'
import { upsertIconByName } from '../src/queries'
import { ensureCurrentColorFill } from './lib/svg-utils'

const require = createRequire(import.meta.url)

export interface CuratedIcon {
  name: string
  label: string
}

// devicon already covers facebook, twitter, linkedin, github, gitlab, slack,
// and behance — only seed the social platforms it's missing here, to avoid
// name collisions with (and silently overwriting) those existing rows.
export const SOCIAL_ICONS: CuratedIcon[] = [
  { name: 'instagram', label: 'Instagram' },
  { name: 'youtube', label: 'YouTube' },
  { name: 'whatsapp', label: 'WhatsApp' },
  { name: 'telegram', label: 'Telegram' },
  { name: 'tiktok', label: 'TikTok' },
  { name: 'pinterest', label: 'Pinterest' },
  { name: 'snapchat', label: 'Snapchat' },
  { name: 'reddit', label: 'Reddit' },
  { name: 'discord', label: 'Discord' },
  { name: 'twitch', label: 'Twitch' },
  { name: 'medium', label: 'Medium' },
  { name: 'dribbble', label: 'Dribbble' },
]

async function main() {
  const db = createDb()
  let imported = 0
  let skipped = 0

  for (const icon of SOCIAL_ICONS) {
    let svgPath: string
    try {
      svgPath = require.resolve(`simple-icons/icons/${icon.name}.svg`)
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
      tags: ['social', 'brand'],
      category: 'social',
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
