# @arach/og

Declarative OG (Open Graph) image generation with Puppeteer. Pre-built templates and a simple API for generating social sharing images.

## Installation

```bash
pnpm add @arach/og
# or
npm install @arach/og
```

## Usage

### Programmatic API

```typescript
import { generateOG } from '@arach/og'

await generateOG({
  template: 'branded',
  title: 'My App',
  subtitle: 'Build amazing things',
  accent: '#f07c4f',
  output: 'public/og.png'
})
```

### CLI

```bash
# Generate from a config file
npx og config.json
```

Config file format:

```json
[
  {
    "template": "branded",
    "title": "My App",
    "subtitle": "Build amazing things",
    "accent": "#f07c4f",
    "output": "public/og.png"
  }
]
```

## Templates

### `branded`
Full-featured template with logo, tag chip, and accent glow. Great for product landing pages.

![branded](examples/og-branded.png)

### `docs`
Clean template for documentation pages with breadcrumb-style layout.

![docs](examples/og-docs.png)

### `minimal`
Simple centered layout. Works well for blog posts and articles.

![minimal](examples/og-minimal.png)

### `editor-dark`
Dark theme template for developer tools and code editors.

![editor-dark](examples/og-editor.png)

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `template` | `string` | `'branded'` | Template ID |
| `title` | `string` | required | Primary title |
| `subtitle` | `string` | - | Subtitle or description |
| `accent` | `string` | `'#6366f1'` | Brand/accent color (hex) |
| `accentSecondary` | `string` | - | Secondary accent color |
| `background` | `string` | `'#0a0a0a'` | Background color |
| `textColor` | `string` | `'#ffffff'` | Text color |
| `output` | `string` | required | Output file path |
| `width` | `number` | `1200` | Width in pixels |
| `height` | `number` | `630` | Height in pixels |
| `scale` | `number` | `2` | Device scale factor (retina) |
| `fonts` | `string[]` | `['Inter']` | Google Fonts to load |
| `logo` | `string` | - | Logo URL or base64 |
| `tag` | `string` | - | Tag/chip text |

## Batch Generation

Generate multiple images at once:

```typescript
import { generateOGBatch } from '@arach/og'

await generateOGBatch([
  { template: 'branded', title: 'Home', output: 'og-home.png' },
  { template: 'docs', title: 'Docs', output: 'og-docs.png' },
])
```

## License

MIT
