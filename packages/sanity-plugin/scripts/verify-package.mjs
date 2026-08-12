// Exercises the actual built tarball contents the way a real consumer would
// — not the source, not a mock. Run after `pnpm build`. Exits non-zero on
// any failure so it can gate CI.
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

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

// SECURITY: this package runs inside a consumer's Sanity Studio build — it
// should never reference our internal DB/build tooling or Node built-ins.
const esmSource = readFileSync(pkgUrl('dist/index.js'), 'utf-8')
const bannedStrings = ['drizzle-orm', 'libsql', '@libsql', "require('node:", 'require("node:']
for (const banned of bannedStrings) {
  check(!esmSource.includes(banned), `dist/index.js does not reference "${banned}"`)
}

const esm = await import(pkgUrl('dist/index.js'))
check(typeof esm.sanityIconPicker === 'function', 'ESM build exports sanityIconPicker')
check(typeof esm.iconRef === 'object', 'ESM build exports iconRef')
check(typeof esm.IconPickerInput === 'function', 'ESM build exports IconPickerInput')

const cjs = require(pkgUrl('dist/index.cjs').pathname)
check(typeof cjs.sanityIconPicker === 'function', 'CJS build exports sanityIconPicker')

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
