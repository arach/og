import { mkdtemp, readFile, unlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { defineConfig } from 'vite'
import { renderHtmlToImage } from '../src/render-native.ts'
import { getCatalogJson, renderTemplateHtml } from '../scripts/template-catalog.ts'

function ogPreviewApi() {
  return {
    name: 'og-preview-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = (req.url ?? '').split('?')[0]

        if (path === '/api/catalog') {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(getCatalogJson()))
          return
        }

        const pngMatch = path.match(/^\/api\/preview\/([^/]+)\.png$/)
        if (pngMatch) {
          const html = renderTemplateHtml(pngMatch[1])
          if (!html) {
            res.statusCode = 404
            res.end('Template not found')
            return
          }

          const dir = await mkdtemp(join(tmpdir(), 'og-preview-'))
          const output = join(dir, 'preview.png')

          try {
            await renderHtmlToImage({ html, output, scale: 1 })
            const png = await readFile(output)
            res.setHeader('Content-Type', 'image/png')
            res.setHeader('Cache-Control', 'no-store')
            res.end(png)
          } catch (error) {
            res.statusCode = 500
            res.end(error instanceof Error ? error.message : 'Render failed')
          } finally {
            await unlink(output).catch(() => {})
          }
          return
        }

        const htmlMatch = path.match(/^\/api\/preview\/([^/]+)$/)
        if (htmlMatch) {
          const html = renderTemplateHtml(htmlMatch[1])
          if (!html) {
            res.statusCode = 404
            res.end('Template not found')
            return
          }

          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.end(html)
          return
        }

        next()
      })
    },
  }
}

export default defineConfig({
  base: '/',
  publicDir: 'public',
  server: {
    open: true,
  },
  build: {
    outDir: 'dist',
  },
  plugins: [ogPreviewApi()],
})