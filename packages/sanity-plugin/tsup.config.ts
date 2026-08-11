import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'sanity', '@sanity/ui', 'styled-components'],
  // @web-portfolio/icons-core is an internal, unpublished workspace package —
  // it must be inlined into the published bundle.
  noExternal: ['@web-portfolio/icons-core'],
  esbuildOptions(options) {
    options.jsx = 'automatic'
  },
})
