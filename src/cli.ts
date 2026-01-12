#!/usr/bin/env node

import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { generateOG, generateOGBatch } from './generate.js'
import { validateOG, formatValidationResult } from './validate.js'
import { startViewer } from './viewer.js'
import { auditSite } from './audit.js'
import type { OGConfig } from './types.js'

async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printHelp()
    process.exit(0)
  }

  const command = args[0]

  // Validate command
  if (command === 'validate') {
    const url = args[1]
    if (!url) {
      console.error('Error: Please provide a URL to validate')
      console.error('Usage: og validate <url>')
      process.exit(1)
    }

    try {
      const targetUrl = url.startsWith('http') ? url : `https://${url}`
      console.log(`\nValidating ${targetUrl}...`)
      const result = await validateOG(targetUrl)
      console.log(formatValidationResult(result))
      process.exit(result.score >= 70 ? 0 : 1)
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
  }

  // Audit command
  if (command === 'audit') {
    const url = args[1]
    if (!url) {
      console.error('Error: Please provide a URL to audit')
      console.error('Usage: og audit <url>')
      process.exit(1)
    }
    await auditSite(url)
    return
  }

  // Init command - add paths manually for local dev
  if (command === 'init') {
    const paths = args.slice(1)
    if (paths.length === 0) {
      console.log(`
  Usage: og init <paths...>

  Add paths to your OG inventory for local development.

  Examples:
    og init / /about /pricing /docs
    og init /blog/post-1 /blog/post-2

  This creates .og-inventory.json which og viewer uses.
`)
      process.exit(0)
    }

    const { writeFile, readFile } = await import('node:fs/promises')
    let inventory: { baseUrl: string; auditedAt: string; totalPages: number; averageScore: number; pages: Array<{ url: string; path: string; score: number; issues: string[] }> }

    try {
      const existing = await readFile('.og-inventory.json', 'utf-8')
      inventory = JSON.parse(existing)
    } catch {
      inventory = {
        baseUrl: 'local',
        auditedAt: new Date().toISOString(),
        totalPages: 0,
        averageScore: 0,
        pages: []
      }
    }

    for (const path of paths) {
      const normalizedPath = path.startsWith('/') ? path : `/${path}`
      if (!inventory.pages.find(p => p.path === normalizedPath)) {
        inventory.pages.push({
          url: `local://${normalizedPath}`,
          path: normalizedPath,
          score: 0,
          issues: ['Not audited yet']
        })
      }
    }

    inventory.totalPages = inventory.pages.length
    inventory.auditedAt = new Date().toISOString()

    await writeFile('.og-inventory.json', JSON.stringify(inventory, null, 2))
    console.log(`\n  ✓ Added ${paths.length} path(s) to .og-inventory.json`)
    console.log(`  Total paths: ${inventory.pages.length}\n`)
    console.log(`  Run \x1b[36mog viewer\x1b[0m to see your inventory\n`)
    return
  }

  // Viewer command
  if (command === 'viewer') {
    const dir = args[1] ? resolve(process.cwd(), args[1]) : process.cwd()
    const port = args.includes('--port') ? parseInt(args[args.indexOf('--port') + 1]) : 3333
    await startViewer(dir, port)
    return
  }

  // Generate command (default)
  const configPath = resolve(process.cwd(), command)

  try {
    const content = await readFile(configPath, 'utf-8')
    const config = JSON.parse(content) as OGConfig | OGConfig[]

    if (Array.isArray(config)) {
      await generateOGBatch(config)
    } else {
      await generateOG(config)
    }

    console.log('\n✓ Done!')
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

function printHelp() {
  console.log(`
@arach/og - Declarative OG image generation

Usage:
  og <config.json>        Generate OG images from a config file
  og validate <url>       Validate OG tags on a single URL
  og audit <url>          Audit all pages on a site (uses sitemap)
  og init <paths...>      Add paths to inventory for local dev
  og viewer               Launch local viewer for OG inventory
  og --help               Show this help message

Workflow:
  1. Audit a live site:     og audit mysite.com
     Or init paths locally: og init / /about /docs /pricing

  2. View your inventory:   og viewer

  3. Generate images:       og config.json

Audit:
  Scan a website's sitemap and audit OG tags for each page.

  $ og audit https://mysite.com
  $ og audit mysite.com

  If no sitemap found, prompts for paths to audit.
  Saves results to .og-inventory.json

Init:
  Add paths manually for local development (no live site needed).

  $ og init / /about /pricing /docs
  $ og init /blog/post-1 /blog/post-2

  Creates/updates .og-inventory.json

Viewer:
  Launch local viewer to see your OG inventory.

  $ og viewer
  $ og viewer --port 4000

Validate:
  Quick check of a single URL's OG tags.

  $ og validate https://example.com/page

Generate:
  Create OG images from a JSON config file.

  {
    "template": "branded",
    "title": "My App",
    "subtitle": "Do amazing things",
    "output": "public/og.png"
  }

Templates: branded, docs, minimal, editor-dark
`)
}

main()
