---
name: og
description: Generate Open Graph images for projects using @arach/og. Use when setting up OG images, creating social preview images, or when user mentions "og", "open graph", or "social images".
---

# @arach/og - OG Image Generator

Generate beautiful Open Graph images with zero design effort using declarative JSON configs or custom HTML templates.

## Quick Setup (Preset Templates)

1. Create `og-config.json` in project root:

```json
{
  "template": "editor-dark",
  "title": "Project Name",
  "subtitle": "A short description of the project.",
  "tag": "Category",
  "accent": "#10b981",
  "accentSecondary": "#3b82f6",
  "output": "public/og.png"
}
```

2. Add script to `package.json`:

```json
{
  "scripts": {
    "og": "npx @arach/og og-config.json"
  }
}
```

3. Run: `pnpm og` (or `npm run og`)

## Custom HTML Templates (v0.3.0+)

For fully custom designs, create an HTML template and render it directly:

### CLI Usage

```bash
npx @arach/og my-template.html -o public/og.png
```

### Package.json Script

```json
{
  "scripts": {
    "og": "npx @arach/og og-template.html -o public/og.png"
  }
}
```

### Config with Custom HTML

```json
{
  "html": "og-template.html",
  "output": "public/og.png",
  "width": 1200,
  "height": 630,
  "scale": 2
}
```

### Template Variables

Pass variables into custom templates:

```json
{
  "html": "og-template.html",
  "output": "public/og.png",
  "vars": {
    "title": "My Product",
    "tagline": "The best thing ever",
    "accent": "#6366f1"
  }
}
```

Use `{{varName}}` in your HTML:

```html
<h1>{{title}}</h1>
<p>{{tagline}}</p>
<style>.accent { color: {{accent}}; }</style>
```

## Preset Templates

| Template | Style | Best For |
|----------|-------|----------|
| `branded` | Light, editorial, grid overlay | Landing pages, marketing |
| `editor-dark` | Dark, dev aesthetic, glow effects | Developer tools, editors |
| `docs` | Clean, minimal | Documentation sites |
| `minimal` | Simple, text-focused | Blog posts, articles |

## Config Options

```typescript
{
  // Required (one of these)
  "title": string,           // Main heading (for preset templates)
  "html": string,            // Path to custom HTML template

  // Required
  "output": string,          // Output path (e.g., "public/og.png")

  // Optional
  "template": "branded" | "docs" | "minimal" | "editor-dark",
  "subtitle": string,        // Secondary text
  "tag": string,             // Badge/chip text
  "accent": string,          // Primary brand color (hex)
  "accentSecondary": string, // Secondary color (hex)
  "background": string,      // Background color (hex)
  "textColor": string,       // Text color (hex)
  "fonts": string[],         // Google Fonts (e.g., ["Inter:wght@400;500"])
  "width": number,           // Default: 1200
  "height": number,          // Default: 630
  "scale": number,           // Device scale for retina (default: 2)
  "logo": string,            // Logo URL or base64
  "vars": object             // Variables for custom HTML templates
}
```

## Color Presets by Project Type

**Developer Tools** (dark):
```json
{
  "template": "editor-dark",
  "accent": "#10b981",
  "accentSecondary": "#3b82f6",
  "background": "#09090b"
}
```

**Marketing/Landing** (light):
```json
{
  "template": "branded",
  "accent": "#f07c4f",
  "accentSecondary": "#1f7a65",
  "background": "#f7f3ec"
}
```

**Documentation** (clean):
```json
{
  "template": "docs",
  "accent": "#2563eb",
  "background": "#ffffff"
}
```

## Batch Generation

Mix preset and custom templates:

```json
[
  { "title": "Home", "output": "public/og-home.png", "template": "branded" },
  { "title": "Docs", "output": "public/og-docs.png", "template": "docs" },
  { "html": "og-custom.html", "output": "public/og-product.png" }
]
```

## Example Workflow

When user asks to set up OG images:

1. Determine if they need preset template or custom design
2. **Preset**: Create `og-config.json` with appropriate template and colors
3. **Custom**: Create `og-template.html` with their custom layout
4. Add script to package.json:
   - Preset: `"og": "npx @arach/og og-config.json"`
   - Custom: `"og": "npx @arach/og og-template.html -o public/og.png"`
5. Run `pnpm og` to generate
6. Remind user to add `<meta property="og:image" content="/og.png">` to their HTML

## Installation

To install this skill for Claude Code:

```bash
# Copy to your skills directory
cp -r skill ~/.claude/skills/og

# Or symlink from the repo
ln -s /path/to/og/skill ~/.claude/skills/og
```

## Source

- **npm**: [@arach/og](https://www.npmjs.com/package/@arach/og)
- **GitHub**: [github.com/arach/og](https://github.com/arach/og)
