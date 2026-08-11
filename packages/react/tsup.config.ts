import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
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
