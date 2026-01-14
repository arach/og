#!/usr/bin/env node

import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { generateOG, generateOGBatch } from './generate.js'
import { validateOG, formatValidationResult } from './validate.js'
import { startViewer } from './viewer.js'
import { auditSite } from './audit.js'
import { generateSitemap, printSitemapHelp } from './sitemap.js'
import { runSetup } from './setup.js'
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

  // Generate command with smart defaults
  if (command === 'generate') {
    const configArg = args[1]

    // If a config file is provided, use it
    if (configArg && !configArg.startsWith('--')) {
      const configPath = resolve(process.cwd(), configArg)
      try {
        const content = await readFile(configPath, 'utf-8')
        const config = JSON.parse(content) as OGConfig | OGConfig[]
        if (Array.isArray(config)) {
          await generateOGBatch(config)
        } else {
          await generateOG(config)
        }
        console.log('\n✓ Done!')
        return
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : error)
        process.exit(1)
      }
    }

    // Smart defaults - look for config files or package.json
    const config = await resolveDefaultConfig()

    console.log(`\n  Generating OG image...\n`)
    console.log(`  Title:    ${config.title}`)
    if (config.subtitle) console.log(`  Subtitle: ${config.subtitle}`)
    console.log(`  Template: ${config.template}`)
    console.log(`  Output:   ${config.output}\n`)

    try {
      await generateOG(config)
      console.log(`  ✓ Created ${config.output}\n`)
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
    return
  }

  // Setup command - uses Claude Code for smart project analysis
  if (command === 'setup') {
    const ogPath = args[1] || 'og.png'
    await runSetup(ogPath)
    return
  }

  // Sitemap command
  if (command === 'sitemap') {
    const outputIdx = args.indexOf('--output')
    const outputFlag = outputIdx !== -1 ? args[outputIdx + 1] : undefined

    // Filter out --output and its value from args
    const restArgs = args.slice(1).filter((a, i) => {
      if (a.startsWith('--')) return false
      // Skip the value after --output
      if (outputIdx !== -1 && args.indexOf(a) === outputIdx + 1) return false
      return true
    })

    // Check if first arg looks like a URL (base URL)
    let baseUrl: string | undefined
    let paths: string[] = []

    if (restArgs.length > 0) {
      const first = restArgs[0]
      if (first.includes('.') && !first.startsWith('/')) {
        baseUrl = first.startsWith('http') ? first : `https://${first}`
        paths = restArgs.slice(1)
      } else {
        // All args are paths, will need inventory for baseUrl
        paths = restArgs
      }
    }

    try {
      console.log(`\n  Generating sitemap...\n`)
      const output = await generateSitemap({
        baseUrl,
        paths: paths.length > 0 ? paths : undefined,
        output: outputFlag ?? 'sitemap.xml'
      })
      console.log(`  ✓ Created ${output}`)
      printSitemapHelp()
    } catch (error) {
      console.error('\n  Error:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
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
    const port = args.includes('--port') ? parseInt(args[args.indexOf('--port') + 1]) : 3333
    // Get directory, filtering out flags
    const dirArg = args.slice(1).find(a => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--port')
    const dir = dirArg ? resolve(process.cwd(), dirArg) : process.cwd()
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
  og generate             Generate OG image with smart defaults
  og generate <config>    Generate from a config file
  og setup [og.png]       Set up meta tags (uses Claude Code)
  og validate <url>       Validate OG tags on a single URL
  og audit <url>          Audit all pages on a site (uses sitemap)
  og sitemap [url] [paths]  Generate a sitemap.xml
  og init <paths...>      Add paths to inventory for local dev
  og viewer               Launch local viewer for OG inventory
  og --help               Show this help message

Workflow:
  1. Audit a live site:     og audit mysite.com
     Or init paths locally: og init / /about /docs /pricing

  2. View your inventory:   og viewer

  3. Generate images:       og generate
     Generate sitemap:      og sitemap

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

Sitemap:
  Generate a starter sitemap.xml for your site.

  $ og sitemap                              # Uses .og-inventory.json
  $ og sitemap mysite.com / /about /docs    # From paths
  $ og sitemap --output public/sitemap.xml  # Custom output

Viewer:
  Launch local viewer to see your OG inventory.

  $ og viewer
  $ og viewer --port 4000

Validate:
  Quick check of a single URL's OG tags.

  $ og validate https://example.com/page

Generate:
  Create OG images. Runs with smart defaults or from a config file.

  $ og generate                    # Smart defaults from package.json
  $ og generate og.config.json     # From config file

  Config file format:
  {
    "template": "branded",
    "title": "My App",
    "subtitle": "Do amazing things",
    "output": "public/og.png"
  }

  Smart defaults:
  • Reads title/description from package.json
  • Falls back to directory name
  • Uses 'branded' template
  • Outputs to og.png

Setup:
  Analyze your project and get tailored meta tag instructions.
  Uses Claude Code CLI for smart project detection.

  $ og setup                # After generating og.png
  $ og setup public/og.png  # Custom image path

  Detects: React, Next.js, Vite, existing helmet, etc.
  Provides: Copy-pasteable code + step-by-step instructions

Templates: branded, docs, minimal, editor-dark
`)
}

async function resolveDefaultConfig(): Promise<OGConfig> {
  // 1. Check for existing OG config files
  const configFiles = ['og.config.json', '.og.json', 'og.json']
  for (const file of configFiles) {
    try {
      const content = await readFile(file, 'utf-8')
      const config = JSON.parse(content)
      if (!Array.isArray(config)) {
        console.log(`  ✓ Found ${file}\n`)
        return config as OGConfig
      }
    } catch {
      // Try next
    }
  }

  // 2. Try to read package.json for project info
  let title = 'My Project'
  let subtitle: string | undefined

  try {
    const pkgContent = await readFile('package.json', 'utf-8')
    const pkg = JSON.parse(pkgContent)
    if (pkg.name) {
      // Clean up package name (remove scope, convert dashes)
      title = pkg.name
        .replace(/^@[\w-]+\//, '') // Remove scope
        .split('-')
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    }
    if (pkg.description) {
      subtitle = pkg.description
    }
    console.log(`  ✓ Using info from package.json\n`)
  } catch {
    // Use directory name as fallback
    const dirName = process.cwd().split('/').pop() || 'project'
    title = dirName
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
    console.log(`  ℹ No package.json found, using directory name\n`)
  }

  return {
    template: 'branded',
    title,
    subtitle,
    output: 'og.png'
  }
}

main()
