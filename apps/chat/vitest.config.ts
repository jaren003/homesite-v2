import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import path from 'path'

export default defineConfig({
  plugins: [svelte()],
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
  },
  resolve: {
    conditions: ['browser'],
    alias: {
      '$lib': path.resolve(__dirname, './src/lib'),
      '$lib/routing.ts': path.resolve(__dirname, './src/lib/routing.ts'),
      '$lib/ollama.ts': path.resolve(__dirname, './src/lib/ollama.ts'),
      '$lib/claude.ts': path.resolve(__dirname, './src/lib/claude.ts'),
      '$lib/dispatch.ts': path.resolve(__dirname, './src/lib/dispatch.ts'),
      '$lib/history.ts': path.resolve(__dirname, './src/lib/history.ts'),
    },
  },
})
