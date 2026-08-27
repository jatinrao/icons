import { defineConfig } from '@sanity/pkg-utils'

export default defineConfig({
  dist: 'dist',
  tsconfig: 'tsconfig.dist.json',
  // Matches tsup.config.ts's prior reasoning: maps were larger than the code
  // itself and nobody steps through a bundled icon registry.
  sourcemap: false,
  // This is a Studio-only UI package — never consumed from a Node runtime.
  runtime: 'browser',
  // The component uses styled-components; let pkg-utils apply its native
  // (displayName/componentId) transform instead of leaving it untouched.
  styledComponents: true,
  deps: {
    // Every Studio library must stay an import, not an inlined copy — a
    // second copy of @sanity/ui in a Studio bundle breaks theme context at
    // runtime. @web-portfolio/icons already ships (and inlines) the full
    // render registry, so importing it here instead of re-bundling
    // icons-core's SVG data avoids duplicating ~1.3MB of icon markup across
    // both published packages.
    neverBundle: [
      'react',
      'sanity',
      '@sanity/ui',
      '@sanity/icons',
      'styled-components',
      '@web-portfolio/icons',
    ],
    // @web-portfolio/icons-core is an internal, unpublished workspace
    // package — it must be inlined into the published bundle.
    alwaysBundle: ['@web-portfolio/icons-core'],
  },
  // The source comments here are plain explanatory JSDoc, not TSDoc
  // release-tag annotations — these rules would otherwise flag every one of
  // them as a missing @public/@internal tag.
  tsdoc: {
    rules: {
      'ae-incompatible-release-tags': 'off',
      'ae-internal-missing-underscore': 'off',
      'ae-missing-release-tag': 'off',
    },
  },
  strictOptions: {
    // pkg-utils' default opinion is that @sanity/ui and @sanity/icons
    // should be regular deps, not peers. This package deliberately keeps
    // them as peers instead (matching sanity/react/styled-components):
    // a duplicate @sanity/ui copy in a Studio bundle breaks theme context
    // at runtime, so consumers must resolve a single shared instance.
    noSanityUiPeerDependency: 'off',
    noSanityIconsPeerDependency: 'off',
  },
})
