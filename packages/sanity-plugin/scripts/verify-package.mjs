// Exercises the actual built tarball contents the way a real consumer would
// — not the source, not a mock. Run after `pnpm build`. Exits non-zero on
// any failure so it can gate CI.
import { existsSync, readFileSync } from 'node:fs'

const pkgUrl = (path) => new URL(`../${path}`, import.meta.url)

let failed = false
function check(condition, message) {
  if (condition) {
    console.log(`OK   ${message}`)
  } else {
    console.error(`FAIL ${message}`)
    failed = true
  }
}

for (const file of ['dist/index.js', 'dist/index.d.ts']) {
  check(existsSync(pkgUrl(file)), `${file} exists`)
}

// ESM-only (@sanity/plugin-kit convention: Studio v5+ is pure ESM, and a
// parallel CJS build risks two copies of the plugin in the module tree) —
// a CJS artifact reappearing here would mean the build silently regressed.
for (const file of ['dist/index.cjs', 'dist/index.d.cts']) {
  check(!existsSync(pkgUrl(file)), `${file} does not exist (package is ESM-only)`)
}

// SECURITY: this package runs inside a consumer's Sanity Studio build — it
// should never reference our internal DB/build tooling or Node built-ins.
const esmSource = readFileSync(pkgUrl('dist/index.js'), 'utf-8')
const bannedStrings = ['drizzle-orm', 'libsql', '@libsql', "require('node:", 'require("node:']
for (const banned of bannedStrings) {
  check(!esmSource.includes(banned), `dist/index.js does not reference "${banned}"`)
}

// Every Studio library must stay an import, not an inlined copy — a second
// copy of @sanity/ui in a Studio bundle breaks theme context at runtime.
// @web-portfolio/icons belongs in this list for a different reason: it
// already ships (and inlines) the full render registry, so importing it
// instead of re-bundling icons-core's SVG data avoids duplicating ~1.3MB of
// icon markup across both published packages.
for (const peer of ['sanity', '@sanity/ui', '@sanity/icons', 'styled-components', '@web-portfolio/icons']) {
  check(
    new RegExp(`from\\s*["']${peer.replace('/', '\\/')}["']`).test(esmSource),
    `dist/index.js imports "${peer}" rather than bundling it`,
  )
}

// Same rule for the type declarations: icons-core is private and unpublished,
// so a surviving `from '@web-portfolio/icons-core'` in dist/*.d.ts would leave
// every consumer's editor unable to resolve this package's exported types.
for (const types of ['dist/index.d.ts']) {
  const source = readFileSync(pkgUrl(types), 'utf-8')
  check(
    !source.includes('@web-portfolio/icons-core'),
    `${types} does not import icons-core's types`,
  )
  // A relative specifier is the other way this breaks: tsup can rewrite the
  // icons-core import to something like './types', which points at a file that
  // was never emitted into dist/.
  const relativeImports = [...source.matchAll(/from\s*['"](\.[^'"]*)['"]/g)].map((m) => m[1])
  check(
    relativeImports.length === 0,
    `${types} has no dangling relative imports${relativeImports.length ? ` (found ${relativeImports.join(', ')})` : ''}`,
  )
}

// This package renders icons via @web-portfolio/icons's <Icon> (asserted
// above) rather than reading SVG data out of icons-core directly, so its own
// bundle should carry zero render markup — only the picker's search metadata
// (label/tags/category, from icons-core's separate metadata.generated.ts).
// A `viewBox`/`innerHTML` key showing up here would mean the two packages
// are back to shipping duplicate copies of the ~1.3MB icon registry.
check(
  !/"?viewBox"?:/.test(esmSource) && !/"?innerHTML"?:/.test(esmSource),
  'dist/index.js does not bundle icon render data (viewBox/innerHTML) — that lives in @web-portfolio/icons',
)

// The picker's search metadata is a tracked, pre-generated artifact —
// `prepublishOnly` no longer regenerates it, so nothing at publish time would
// otherwise notice a truncated or empty metadata.generated.ts. Assert the
// icon set actually made it into the bundle. The floor is deliberately
// loose: it catches "empty" and "truncated", not "one icon was removed on
// purpose".
const MIN_EXPECTED_ICONS = 600
const bundledIconCount = (esmSource.match(/"?category"?:/g) ?? []).length
check(
  bundledIconCount >= MIN_EXPECTED_ICONS,
  `dist/index.js bundles the icon search metadata (${bundledIconCount} icons, expected >= ${MIN_EXPECTED_ICONS})`,
)

const esm = await import(pkgUrl('dist/index.js'))
check(typeof esm.sanityIconPicker === 'function', 'ESM build exports sanityIconPicker')
check(typeof esm.iconRef === 'object', 'ESM build exports iconRef')
check(typeof esm.IconPickerInput === 'function', 'ESM build exports IconPickerInput')

// The plugin factory produces a well-formed Sanity plugin definition that
// actually registers our custom field type.
const plugin = esm.sanityIconPicker()
check(plugin.name === 'sanity-icon-picker', 'plugin declares its name')
check(Array.isArray(plugin.schema?.types) && plugin.schema.types.includes(esm.iconRef), 'plugin registers iconRef in schema.types')
check(esm.iconRef.name === 'iconRef' && esm.iconRef.type === 'string', 'iconRef is a string-backed schema type')
check(typeof esm.iconRef.components?.input === 'function', 'iconRef wires up IconPickerInput as its custom input')

if (failed) {
  console.error('\npackages/sanity-plugin: package verification failed')
  process.exit(1)
}
console.log('\npackages/sanity-plugin: package verification passed')
