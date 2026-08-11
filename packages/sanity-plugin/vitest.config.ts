import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    // Needed for Testing Library's automatic afterEach(cleanup) registration.
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
})
