import { defineConfig } from 'vitest/config'

// Kept separate from vite.config.js so tests don't load the PWA plugin.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['{lib,api,src}/**/*.test.js', 'test/**/*.test.js'],
    setupFiles: ['test/setup.js'],
  },
})
