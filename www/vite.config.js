import { defineConfig } from 'vite'

export default defineConfig({
  // Set base to repo name for GitHub Pages (e.g., /og/)
  // Or use custom domain with base: '/'
  base: '/og/',
  publicDir: 'public',
  server: {
    open: true
  },
  build: {
    outDir: 'dist'
  }
})
