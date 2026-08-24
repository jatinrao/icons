// Exercises the actual built tarball contents the way a real consumer would
// — not the source, not a mock. Run after `pnpm build`. Exits non-zero on
// any failure so it can gate CI.
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const require = createRequire(import.meta.url)
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

for (const file of ['dist/index.js', 'dist/index.cjs', 'dist/index.d.ts', 'dist/index.d.cts']) {
  check(existsSync(pkgUrl(file)), `${file} exists`)
}

// SECURITY: this package must be safe to import in a browser bundle — it
// should never reference our internal DB/build tooling or Node built-ins.
const esmSource = readFileSync(pkgUrl('dist/index.js'), 'utf-8')
const bannedStrings = ['drizzle-orm', 'libsql', '@libsql', "require('node:", 'require("node:']
for (const banned of bannedStrings) {
  check(!esmSource.includes(banned), `dist/index.js does not reference "${banned}"`)
}

// Icon rendering only ever reads viewBox/innerHTML — label/tags/category are
// search-only fields the Sanity picker needs, not this package. They live in
// icons-core's separate metadata.generated.ts, which nothing here imports; a
// `"tags"` key showing up would mean that split silently broke.
check(!/"?tags"?:/.test(esmSource), 'dist/index.js does not bundle icon search metadata (label/tags)')

// The registry is a tracked, pre-generated artifact — `prepublishOnly` no
// longer regenerates it, so nothing at publish time would otherwise notice a
// truncated or empty registry.generated.ts. Assert the icon set actually made
// it into the bundle. The floor is deliberately loose: it catches "empty" and
// "truncated", not "one icon was removed on purpose".
const MIN_EXPECTED_ICONS = 600
// Minification drops the quotes off object keys that are valid identifiers
// (`viewBox` is one), so match either quoted or bare form.
const bundledIconCount = (esmSource.match(/"?viewBox"?:/g) ?? []).length
check(
  bundledIconCount >= MIN_EXPECTED_ICONS,
  `dist/index.js bundles the icon registry (${bundledIconCount} icons, expected >= ${MIN_EXPECTED_ICONS})`,
)

const esm = await import(pkgUrl('dist/index.js'))
check(typeof esm.Icon === 'function', 'ESM build exports Icon')

const cjs = require(pkgUrl('dist/index.cjs').pathname)
check(typeof cjs.Icon === 'function', 'CJS build exports Icon')

// Real end-to-end render: a known icon produces real markup, an unknown one
// warns and renders nothing instead of throwing.
const knownHtml = renderToStaticMarkup(createElement(esm.Icon, { name: 'react', title: 'React' }))
check(knownHtml.includes('<svg') && knownHtml.includes('<title>React</title>'), 'renders a known icon end-to-end')
check(knownHtml.length > 100, 'the bundled registry has real content, not an empty stub')

let warned = false
const originalWarn = console.warn
console.warn = () => {
  warned = true
}
const unknownHtml = renderToStaticMarkup(createElement(esm.Icon, { name: 'totally-not-a-real-icon' }))
console.warn = originalWarn
check(unknownHtml === '', 'an unknown icon name renders nothing')
check(warned, 'an unknown icon name warns instead of throwing')

if (failed) {
  console.error('\npackages/react: package verification failed')
  process.exit(1)
}
console.log('\npackages/react: package verification passed')
