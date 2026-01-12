#!/usr/bin/env node

import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { generateOG, generateOGBatch } from './generate.js'
import type { OGConfig } from './types.js'

async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
@arach/og - Declarative OG image generation

Usage:
  og <config.json>     Generate OG images from a config file
  og --help            Show this help message

Config file format:
  Single image:
  {
    "template": "branded",
    "title": "My App",
    "subtitle": "Do amazing things",
    "accent": "#f07c4f",
    "output": "public/og-image.png"
  }

  Multiple images:
  [
    { "title": "Home", "output": "public/og-home.png" },
    { "title": "Docs", "template": "docs", "output": "public/og-docs.png" }
  ]

Templates: branded, docs, minimal, editor-dark
`)
    process.exit(0)
  }

  const configPath = resolve(process.cwd(), args[0])

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

main()
