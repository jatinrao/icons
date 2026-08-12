import { describe, expect, it } from 'vitest'
import pkg from '../../package.json'

describe('package.json (public npm package correctness)', () => {
  it('is scoped, to prevent dependency confusion on the public registry', () => {
    expect(pkg.name).toMatch(/^@[a-z0-9-]+\/[a-z0-9-]+$/)
  })

  it('declares a license and repository, so npm/consumers can verify provenance', () => {
    expect(pkg.license).toBe('MIT')
    expect(pkg.repository?.url).toContain('github.com/jatinrao/icons')
  })

  it('is marked side-effect free, so bundlers can tree-shake unused exports', () => {
    expect(pkg.sideEffects).toBe(false)
  })

  it('only publishes dist/ — no source, tests, or config leak into the tarball', () => {
    expect(pkg.files).toEqual(['dist'])
  })

  it('has zero real runtime dependencies (everything is bundled or a peer)', () => {
    // The one entry here is an internal, unpublished workspace package that
    // tsup inlines at build time (see tsup.config.ts's `noExternal`) — it
    // never appears in what a consumer's package manager actually installs.
    // This is what keeps this package's dependency tree — and its exposure
    // to transitive supply-chain vulnerabilities — at zero.
    expect(Object.keys(pkg.dependencies ?? {})).toEqual(['@web-portfolio/icons-core'])
    expect(pkg.dependencies['@web-portfolio/icons-core']).toMatch(/^workspace:/)
  })

  it('declares react only as a peer dependency, never bundled or duplicated', () => {
    expect(pkg.peerDependencies?.react).toBeTruthy()
    expect(pkg.dependencies).not.toHaveProperty('react')
  })

  it('exports map covers ESM, CJS, and types, all pointing into dist/', () => {
    const exportsMap = pkg.exports['.']
    expect(exportsMap.import).toBe('./dist/index.js')
    expect(exportsMap.require).toBe('./dist/index.cjs')
    expect(exportsMap.types).toBe('./dist/index.d.ts')
  })

  it('publishConfig is public (scoped packages default to restricted otherwise)', () => {
    expect(pkg.publishConfig?.access).toBe('public')
  })
})
