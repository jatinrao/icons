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
  clean: true,
  external: ['react', 'sanity', '@sanity/ui', '@sanity/icons', 'styled-components'],
  // @web-portfolio/icons-core is an internal, unpublished workspace package —
  // it must be inlined into the published bundle.
  noExternal: ['@web-portfolio/icons-core'],
  esbuildOptions(options) {
    options.jsx = 'automatic'
  },
})
