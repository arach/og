#!/usr/bin/env node

import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { generateOG, generateOGBatch } from './generate.js'
import { validateOG, formatValidationResult } from './validate.js'
import { startViewer } from './viewer.js'
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
  og validate <url>       Validate OG tags on a website
  og viewer [dir]         Launch local viewer for OG images
  og --help               Show this help message

Validate:
  Check a website's Open Graph tags and image for best practices.

  $ og validate https://example.com
  $ og validate example.com

  Checks:
    • og:title length (optimal: 50-60 chars)
    • og:description length (optimal: 110-160 chars)
    • og:image accessible, dimensions (1200x630), size (<600KB)
    • og:url and twitter:card presence

Viewer:
  Open a local viewer to preview OG images in your project.

  $ og viewer              # Scan current directory
  $ og viewer ./public     # Scan specific directory
  $ og viewer --port 4000  # Use custom port

Generate:
  Create OG images from a JSON config file.

  Single image:
  {
    "template": "branded",
    "title": "My App",
    "subtitle": "Do amazing things",
    "accent": "#f07c4f",
    "output": "public/og.png"
  }

  Multiple images:
  [
    { "title": "Home", "output": "public/og-home.png" },
    { "title": "Docs", "template": "docs", "output": "public/og-docs.png" }
  ]

Templates: branded, docs, minimal, editor-dark
`)
}

main()
