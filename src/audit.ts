import { validateOG } from './validate.js'
import { createInterface } from 'node:readline'
import { writeFile } from 'node:fs/promises'

interface SitemapUrl {
  loc: string
  lastmod?: string
  priority?: string
}

export interface AuditResult {
  url: string
  path: string
  score: number
  title?: string
  titleLength?: number
  description?: string
  descriptionLength?: number
  image?: string
  imageSize?: number
  imageDimensions?: string
  issues: string[]
}

export interface OGInventory {
  baseUrl: string
  auditedAt: string
  totalPages: number
  averageScore: number
  pages: AuditResult[]
}

export async function auditSite(baseUrl: string): Promise<void> {
  // Normalize URL
  const url = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`
  const base = new URL(url)

  console.log(`\n  Auditing ${base.origin}...\n`)

  // Try to find sitemap
  const sitemapUrls = await findSitemap(base.origin)

  let paths: string[]

  if (sitemapUrls.length > 0) {
    console.log(`  ✓ Found sitemap with ${sitemapUrls.length} URLs\n`)
    paths = sitemapUrls.map(u => u.loc)
  } else {
    console.log(`  ! No sitemap found at ${base.origin}/sitemap.xml`)
    console.log(`    Consider adding one for better SEO!\n`)

    // Check for .og-paths file or ask user
    paths = await getPathsFromUser(base.origin)
  }

  if (paths.length === 0) {
    console.log(`  No paths to audit.\n`)
    return
  }

  console.log(`  Auditing ${paths.length} page${paths.length !== 1 ? 's' : ''}...\n`)
  console.log(`  ${'─'.repeat(60)}\n`)

  const results: AuditResult[] = []

  for (const path of paths) {
    const fullUrl = path.startsWith('http') ? path : `${base.origin}${path.startsWith('/') ? '' : '/'}${path}`
    const urlPath = new URL(fullUrl).pathname

    process.stdout.write(`  Checking ${truncate(fullUrl, 50)}...`)

    try {
      const validation = await validateOG(fullUrl)

      const titleCheck = validation.checks.find(c => c.name === 'og:title')
      const descCheck = validation.checks.find(c => c.name === 'og:description')
      const imageUrlCheck = validation.checks.find(c => c.name === 'og:image URL')
      const imageSizeCheck = validation.checks.find(c => c.name === 'og:image size')
      const imageDimsCheck = validation.checks.find(c => c.name === 'og:image dimensions')

      const issues = validation.checks
        .filter(c => c.status !== 'pass')
        .map(c => c.name)

      results.push({
        url: fullUrl,
        path: urlPath,
        score: validation.score,
        title: typeof titleCheck?.value === 'string' ? undefined : undefined,
        titleLength: typeof titleCheck?.value === 'number' ? titleCheck.value : undefined,
        description: typeof descCheck?.value === 'string' ? undefined : undefined,
        descriptionLength: typeof descCheck?.value === 'number' ? descCheck.value : undefined,
        image: typeof imageUrlCheck?.value === 'string' ? imageUrlCheck.value : undefined,
        imageSize: typeof imageSizeCheck?.value === 'number' ? imageSizeCheck.value : undefined,
        imageDimensions: typeof imageDimsCheck?.value === 'string' ? imageDimsCheck.value : undefined,
        issues
      })

      const scoreColor = validation.score >= 80 ? '\x1b[32m' :
                        validation.score >= 50 ? '\x1b[33m' : '\x1b[31m'
      const reset = '\x1b[0m'

      console.log(` ${scoreColor}${validation.score}${reset}/100`)

    } catch (error) {
      results.push({
        url: fullUrl,
        path: urlPath,
        score: 0,
        issues: ['Failed to fetch']
      })
      console.log(` \x1b[31mFailed\x1b[0m`)
    }
  }

  // Save inventory
  const inventory: OGInventory = {
    baseUrl: base.origin,
    auditedAt: new Date().toISOString(),
    totalPages: results.length,
    averageScore: Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length),
    pages: results
  }

  await writeFile('.og-inventory.json', JSON.stringify(inventory, null, 2))
  console.log(`\n  ✓ Saved inventory to .og-inventory.json`)

  // Summary
  console.log(`\n  ${'─'.repeat(60)}`)
  printSummary(results)

  console.log(`  Run \x1b[36mog viewer\x1b[0m to see the full report\n`)
}

async function findSitemap(origin: string): Promise<SitemapUrl[]> {
  const sitemapLocations = [
    '/sitemap.xml',
    '/sitemap_index.xml',
    '/sitemap-index.xml',
  ]

  // Also check robots.txt for Sitemap directive
  try {
    const robotsRes = await fetch(`${origin}/robots.txt`)
    if (robotsRes.ok) {
      const robotsTxt = await robotsRes.text()
      const sitemapMatch = robotsTxt.match(/Sitemap:\s*(.+)/i)
      if (sitemapMatch) {
        sitemapLocations.unshift(new URL(sitemapMatch[1].trim(), origin).pathname)
      }
    }
  } catch {
    // Ignore
  }

  for (const loc of sitemapLocations) {
    try {
      const res = await fetch(`${origin}${loc}`)
      if (res.ok) {
        const xml = await res.text()
        return parseSitemap(xml, origin)
      }
    } catch {
      // Try next location
    }
  }

  return []
}

function parseSitemap(xml: string, origin: string): SitemapUrl[] {
  const urls: SitemapUrl[] = []

  // Check if it's a sitemap index
  if (xml.includes('<sitemapindex')) {
    // Parse sitemap index to get child sitemaps
    const sitemapMatches = xml.matchAll(/<sitemap>[\s\S]*?<loc>(.+?)<\/loc>[\s\S]*?<\/sitemap>/gi)
    // For simplicity, just return empty - would need to recursively fetch
    // In a real implementation, we'd fetch each child sitemap
    console.log(`    (Sitemap index found - using root URLs only)`)
  }

  // Parse URL entries
  const urlMatches = xml.matchAll(/<url>[\s\S]*?<loc>(.+?)<\/loc>[\s\S]*?<\/url>/gi)

  for (const match of urlMatches) {
    const loc = match[1].trim()
    urls.push({ loc })
  }

  return urls
}

async function getPathsFromUser(origin: string): Promise<string[]> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise((resolve) => {
    console.log(`  Enter paths to audit (comma-separated), or press Enter for just the homepage:`)
    console.log(`  Example: /, /about, /docs, /pricing\n`)

    rl.question('  Paths: ', (answer) => {
      rl.close()

      if (!answer.trim()) {
        resolve(['/'])
      } else {
        const paths = answer.split(',').map(p => p.trim()).filter(Boolean)
        resolve(paths.length > 0 ? paths : ['/'])
      }
    })
  })
}

function printSummary(results: AuditResult[]): void {
  const total = results.length
  const perfect = results.filter(r => r.score >= 90).length
  const good = results.filter(r => r.score >= 70 && r.score < 90).length
  const needsWork = results.filter(r => r.score < 70).length
  const avgScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / total)

  console.log(`\n  Summary`)
  console.log(`  ${'─'.repeat(30)}`)
  console.log(`  Total pages:    ${total}`)
  console.log(`  Average score:  ${avgScore}/100`)
  console.log(``)
  console.log(`  \x1b[32m●\x1b[0m Perfect (90+):  ${perfect}`)
  console.log(`  \x1b[33m●\x1b[0m Good (70-89):   ${good}`)
  console.log(`  \x1b[31m●\x1b[0m Needs work:     ${needsWork}`)

  if (needsWork > 0) {
    console.log(`\n  Pages needing attention:`)
    for (const r of results.filter(r => r.score < 70)) {
      console.log(`    • ${truncate(r.url, 40)} (${r.score}/100)`)
      if (r.issues.length > 0) {
        console.log(`      Issues: ${r.issues.join(', ')}`)
      }
    }
  }

  console.log(``)
}

function truncate(str: string, len: number): string {
  if (str.length <= len) return str
  return str.slice(0, len - 3) + '...'
}
