import { readFile, writeFile } from 'node:fs/promises'
import type { OGInventory } from './audit.js'

export interface SitemapOptions {
  baseUrl?: string
  paths?: string[]
  output?: string
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
}

export async function generateSitemap(options: SitemapOptions = {}): Promise<string> {
  const output = options.output ?? 'sitemap.xml'
  let baseUrl = options.baseUrl
  let paths = options.paths ?? []

  // If no paths provided, try to load from inventory
  if (paths.length === 0) {
    try {
      const inventoryJson = await readFile('.og-inventory.json', 'utf-8')
      const inventory: OGInventory = JSON.parse(inventoryJson)
      baseUrl = baseUrl ?? inventory.baseUrl
      paths = inventory.pages.map(p => p.path)
      console.log(`  ✓ Loaded ${paths.length} paths from .og-inventory.json\n`)
    } catch {
      // No inventory found
    }
  }

  if (paths.length === 0) {
    throw new Error('No paths provided and no .og-inventory.json found.\n\n  Usage:\n    og sitemap <baseUrl> [paths...]\n    og sitemap https://mysite.com / /about /docs\n\n  Or run `og audit <url>` or `og init <paths>` first to create an inventory.')
  }

  if (!baseUrl) {
    throw new Error('No base URL provided.\n\n  Usage: og sitemap <baseUrl> [paths...]\n  Example: og sitemap https://mysite.com / /about /docs')
  }

  // Normalize base URL
  const base = baseUrl.replace(/\/$/, '')

  // Generate XML
  const xml = buildSitemapXml(base, paths, options)

  // Write file
  await writeFile(output, xml)

  return output
}

function buildSitemapXml(baseUrl: string, paths: string[], options: SitemapOptions): string {
  const changefreq = options.changefreq ?? 'weekly'
  const priority = options.priority ?? 0.8
  const lastmod = new Date().toISOString().split('T')[0]

  const urls = paths.map(path => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    const fullUrl = `${baseUrl}${normalizedPath}`
    const isHome = normalizedPath === '/'

    return `  <url>
    <loc>${escapeXml(fullUrl)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${isHome ? '1.0' : priority.toFixed(1)}</priority>
  </url>`
  })

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function printSitemapHelp(): void {
  console.log(`
  ${'─'.repeat(60)}

  Next steps:

  1. Add to your robots.txt:
     Sitemap: https://yoursite.com/sitemap.xml

  2. Submit to search engines:
     • Google Search Console: https://search.google.com/search-console
     • Bing Webmaster Tools: https://www.bing.com/webmasters

  3. Verify it's accessible:
     curl https://yoursite.com/sitemap.xml

  ${'─'.repeat(60)}

  Learn more:

  Sitemap basics:
  • Sitemap protocol spec: https://www.sitemaps.org/protocol.html
  • Google sitemap guide: https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview

  SEO fundamentals:
  • Google SEO starter guide: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
  • Ahrefs SEO basics: https://ahrefs.com/seo

  Quick-start tools:

  # Next.js projects - auto-generates from pages
  npx next-sitemap

  # Crawl any site and generate sitemap
  npx sitemap-generator-cli https://yoursite.com

  # Validate your sitemap
  npx sitemap-validator sitemap.xml

  Open source repos:
  • next-sitemap: https://github.com/iamvishnusankar/next-sitemap
  • sitemap.js: https://github.com/ekalinin/sitemap.js

  ${'─'.repeat(60)}
`)
}
