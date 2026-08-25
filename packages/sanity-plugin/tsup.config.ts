import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  // Not published: the maps were larger than the code itself (>50% of the
  // tarball) and nobody steps through a bundled icon registry. Leaving them
  // off here — rather than filtering them out of `files` — also avoids
  // shipping a //# sourceMappingURL that points at a file we don't include.
  sourcemap: false,
  // Deliberately not minified: Socket flagged this package's minified
  // output as a "Minified code" quality/supply-chain alert (it hides what's
  // actually running from anyone auditing the package), and the size win
  // was marginal (~3% raw, <1% gzip) next to the 97% cut from no longer
  // bundling the icon registry. Not worth the trade.
  clean: true,
  // @web-portfolio/icons already ships (and inlines) the full render
  // registry — importing it here instead of re-bundling icons-core's SVG
  // data would duplicate ~1.3MB of icon markup across both packages.
  external: [
    'react',
    'sanity',
    '@sanity/ui',
    '@sanity/icons',
    'styled-components',
    '@web-portfolio/icons',
  ],
  // @web-portfolio/icons-core is an internal, unpublished workspace package —
  // it must be inlined into the published bundle. Only its lightweight
  // metadata.generated.ts (label/tags/category, no SVG) ends up referenced
  // here; the render registry lives in @web-portfolio/icons instead.
  noExternal: ['@web-portfolio/icons-core'],
  esbuildOptions(options) {
    options.jsx = 'automatic'
  },
})
