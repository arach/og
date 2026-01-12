import { defineConfig } from 'vite'

export default defineConfig({
  // Custom domain - use root base
  base: '/',
  publicDir: 'public',
  server: {
    open: true
  },
  build: {
    outDir: 'dist'
  }
})
