/**
 * Adds 2 custom gradient icons — a rounded-square check and cross, both
 * with the blue-badge outline + charcoal glyph gradient — for use as a
 * comparison-table row's representative icon (tableDataRow.icon in
 * portfolio/studio) when the whole spec is a plain yes/no fact. Supplied
 * directly as Apple-native-exported SVG source, not sourced from an npm
 * icon package like the other seed-*.ts scripts here.
 *
 * category: 'original' (not one of MONOCHROME_CATEGORIES in
 * generate-registry.ts) — these keep their own gradient fills; that
 * category set runs normalizeToCurrentColor, which would strip them.
 *
 * Named "verdict-check"/"verdict-cross", not "check"/"close" — this
 * registry already has plain "check"/"close" glyphs used elsewhere (e.g.
 * ComparisonTableModal's close button), and upsertIconByName would
 * overwrite those in place by name if reused here.
 *
 * Usage:
 *   pnpm --filter @web-portfolio/icons-db seed-portfolio-verdict-icons
 * Also runs as part of `seed-all`.
 */
import { createDb } from '../src/client'
import { upsertIconByName } from '../src/queries'

const VERDICT_CHECK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17.972 17.9906">
<defs>
<linearGradient id="gradient1" x1="5" y1="0.00824052" x2="5" y2="17.9906" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="#3f9bff" stop-opacity="1"/>
<stop offset="1" stop-color="#007aff" stop-opacity="1"/>
</linearGradient>
<linearGradient id="gradient2" x1="5" y1="0.00824052" x2="5" y2="17.9906" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="rgba(50,50,50,0.85)" stop-opacity="1"/>
<stop offset="1" stop-color="rgba(0,0,0,0.85)" stop-opacity="1"/>
</linearGradient>
</defs>
<g>
<rect height="17.9906" opacity="0" width="17.972" x="0" y="0"/>
<path d="M3.06359 17.9906L14.9084 17.9906C16.9548 17.9906 17.972 16.9692 17.972 14.9581L17.972 3.04078C17.972 1.02964 16.9548 0.00824052 14.9084 0.00824052L3.06359 0.00824052C1.02753 0.00824052 0 1.02542 0 3.04078L0 14.9581C0 16.9734 1.02753 17.9906 3.06359 17.9906ZM3.08851 16.4095C2.11324 16.4095 1.57069 15.8877 1.57069 14.8814L1.57069 3.11745C1.57069 2.10078 2.11324 1.58928 3.08851 1.58928L14.8835 1.58928C15.8503 1.58928 16.4013 2.10078 16.4013 3.11745L16.4013 14.8814C16.4013 15.8877 15.8503 16.4095 14.8835 16.4095Z" fill="url(#gradient1)"/>
<path d="M7.92586 13.6349C8.25327 13.6349 8.52259 13.4815 8.71121 13.1812L13.1708 6.15974C13.2889 5.96709 13.4049 5.74742 13.4049 5.53196C13.4049 5.09894 13.0236 4.80872 12.6113 4.80872C12.3584 4.80872 12.1159 4.96418 11.9398 5.25631L7.88235 11.7469L5.96016 9.26441C5.73225 8.95157 5.50433 8.86244 5.23903 8.86244C4.81636 8.86244 4.48474 9.21054 4.48474 9.64778C4.48474 9.85711 4.57387 10.0664 4.70652 10.2529L7.08876 13.1812C7.33949 13.494 7.59846 13.6349 7.92586 13.6349Z" fill="url(#gradient2)"/>
</g>
</svg>`

const VERDICT_CROSS_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17.972 17.9906">
<defs>
<linearGradient id="gradient1" x1="5" y1="0.00824052" x2="5" y2="17.9906" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="#3f9bff" stop-opacity="1"/>
<stop offset="1" stop-color="#007aff" stop-opacity="1"/>
</linearGradient>
<linearGradient id="gradient2" x1="5" y1="0.00824052" x2="5" y2="17.9906" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="rgba(50,50,50,0.85)" stop-opacity="1"/>
<stop offset="1" stop-color="rgba(0,0,0,0.85)" stop-opacity="1"/>
</linearGradient>
</defs>
<g>
<rect height="17.9906" opacity="0" width="17.972" x="0" y="0"/>
<path d="M3.06359 17.9906L14.9084 17.9906C16.9548 17.9906 17.972 16.9692 17.972 14.9581L17.972 3.04078C17.972 1.02964 16.9548 0.00824052 14.9084 0.00824052L3.06359 0.00824052C1.02753 0.00824052 0 1.02542 0 3.04078L0 14.9581C0 16.9734 1.02753 17.9906 3.06359 17.9906ZM3.08851 16.4095C2.11324 16.4095 1.57069 15.8877 1.57069 14.8814L1.57069 3.11745C1.57069 2.10078 2.11324 1.58928 3.08851 1.58928L14.8835 1.58928C15.8503 1.58928 16.4013 2.10078 16.4013 3.11745L16.4013 14.8814C16.4013 15.8877 15.8503 16.4095 14.8835 16.4095Z" fill="url(#gradient1)"/>
<path d="M6.07994 13.4664C6.3991 13.4664 6.5628 13.3648 6.81142 13.0167L8.92274 10.0173L8.96223 10.0173L11.0693 13.0167C11.3158 13.3648 11.492 13.4664 11.8008 13.4664C12.2381 13.4664 12.5634 13.17 12.5634 12.7638C12.5634 12.567 12.5074 12.4136 12.3893 12.2478L9.936 8.90837L12.406 5.54402C12.5344 5.36786 12.5904 5.20416 12.5904 5.03011C12.5904 4.64673 12.2651 4.35249 11.8568 4.35249C11.5501 4.35249 11.3532 4.45408 11.1357 4.77938L9.10714 7.7912L9.0573 7.7912L6.97301 4.76903C6.74509 4.45408 6.55858 4.35249 6.22907 4.35249C5.81253 4.35249 5.46653 4.66743 5.46653 5.06538C5.46653 5.28083 5.52251 5.42383 5.67375 5.63105L8.02142 8.85661L5.53286 12.2934C5.40232 12.4696 5.35669 12.6022 5.35669 12.7991C5.35669 13.17 5.67375 13.4664 6.07994 13.4664Z" fill="url(#gradient2)"/>
</g>
</svg>`

async function main() {
  const db = createDb()

  await upsertIconByName(db, {
    name: 'verdict-check',
    label: 'Verdict Check',
    svg: VERDICT_CHECK_SVG,
    tags: ['check', 'checkmark', 'yes', 'verdict', 'tick', 'comparison'],
    category: 'original',
  })
  console.log('  upserted "verdict-check"')

  await upsertIconByName(db, {
    name: 'verdict-cross',
    label: 'Verdict Cross',
    svg: VERDICT_CROSS_SVG,
    tags: ['cross', 'close', 'no', 'verdict', 'x', 'comparison'],
    category: 'original',
  })
  console.log('  upserted "verdict-cross"')

  console.log('\nSeeded 2 portfolio verdict icons.')
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
