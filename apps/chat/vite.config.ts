import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    port: parseInt(process.env.PORT ?? '3001'),
    host: process.env.HOST ?? '0.0.0.0',
  },
  preview: {
    port: parseInt(process.env.PORT ?? '3001'),
    host: process.env.HOST ?? '0.0.0.0',
  },
})
