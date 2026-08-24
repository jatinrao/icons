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
  minify: true,
  clean: true,
  external: ['react'],
  // @web-portfolio/icons-core is an internal, unpublished workspace package —
  // it must be inlined into the published bundle, not left as an import
  // consumers can't resolve.
  noExternal: ['@web-portfolio/icons-core'],
  esbuildOptions(options) {
    options.jsx = 'automatic'
  },
})
