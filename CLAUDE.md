# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

**@arach/og** is a declarative OG (Open Graph) image generation library using Puppeteer. It provides pre-built templates and a simple API for generating social sharing images.

## Tech Stack

- **TypeScript** - Type-safe code
- **Puppeteer** - Headless browser for rendering
- **Node.js ESM** - ES modules

## Build Commands

```bash
pnpm install     # Install dependencies
pnpm build       # Compile TypeScript to dist/
pnpm dev         # Watch mode compilation
```

## Architecture

### Project Structure

```
src/
├── index.ts           # Public exports
├── types.ts           # TypeScript types
├── generate.ts        # Puppeteer orchestration
├── cli.ts             # CLI entry point
└── templates/
    ├── index.ts       # Template registry
    ├── branded.ts     # Full-featured template
    ├── docs.ts        # Documentation pages
    ├── minimal.ts     # Clean, centered
    └── editor-dark.ts # Dark theme for products
```

### Templates

Each template is a function that takes a `TemplateContext` and returns an HTML string. Templates use:
- Google Fonts (loaded via CDN)
- CSS Grid overlays for texture
- Radial gradients for accent glows
- Consistent 1200x630 dimensions (OG standard)

### Usage

```typescript
import { generateOG } from '@arach/og'

await generateOG({
  template: 'branded',
  title: 'My App',
  subtitle: 'Amazing things',
  accent: '#f07c4f',
  output: 'public/og.png'
})
```

### CLI

```bash
og config.json  # Generate from config file
```

## Adding New Templates

1. Create `src/templates/my-template.ts`
2. Export a `TemplateFunction` that returns HTML
3. Add to `src/templates/index.ts`
4. Add template ID to `TemplateId` type in `types.ts`
