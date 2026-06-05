# Custom HTML Templates

## Overview

Add support for custom HTML templates, allowing projects to define their own OG image layouts while still benefiting from `@arach/og`'s rendering pipeline (puppeteer, font loading, retina output).

## Problem

Currently, `@arach/og` only supports 4 built-in templates (`branded`, `docs`, `minimal`, `editor-dark`). Projects with custom branding or unique layouts (like HUD's wireframe UI preview) must:

1. Write their own puppeteer script
2. Manage font loading, viewport setup, and rendering manually
3. Lose the convenience of `npx @arach/og`

## Proposed Solution

### 1. HTML File Support in CLI

```bash
# Direct HTML file
npx @arach/og my-template.html -o public/og.png

# With options
npx @arach/og my-template.html -o public/og.png --width 1200 --height 630 --scale 2
```

### 2. HTML Reference in Config

```json
{
  "html": "og-template.html",
  "output": "public/og.png",
  "width": 1200,
  "height": 630,
  "scale": 2
}
```

When `html` is present, ignore `template` and use the custom HTML file instead.

### 3. Template Variables (Optional Enhancement)

Allow passing variables into custom templates via simple string replacement:

```json
{
  "html": "og-template.html",
  "output": "public/og.png",
  "vars": {
    "title": "HUD",
    "tagline": "Spatial Canvas for Developers",
    "accent": "#10b981"
  }
}
```

In the HTML template:
```html
<h1>{{title}}</h1>
<p>{{tagline}}</p>
<style>
  .accent { color: {{accent}}; }
</style>
```

Simple `{{varName}}` replacement - no complex templating engine needed.

### 4. Remote HTML Support (Nice to Have)

```json
{
  "html": "https://example.com/og-template.html",
  "output": "public/og.png"
}
```

Fetch and render remote templates.

---

## Implementation Notes

### Changes to `generate.ts`

```typescript
export async function generateOG(config: OGConfig): Promise<void> {
  let html: string

  if (config.html) {
    // Custom template path
    const templatePath = resolve(process.cwd(), config.html)
    html = await readFile(templatePath, 'utf-8')

    // Apply variable substitution if vars provided
    if (config.vars) {
      for (const [key, value] of Object.entries(config.vars)) {
        html = html.replaceAll(`{{${key}}}`, String(value))
      }
    }
  } else {
    // Existing template logic
    const templateFn = templates[config.template || 'branded']
    html = templateFn(context)
  }

  // Rest of rendering pipeline unchanged...
}
```

### Changes to `types.ts`

```typescript
export interface OGConfig {
  // Existing fields...

  /** Path to custom HTML template (relative to cwd) */
  html?: string

  /** Variables to substitute in custom template */
  vars?: Record<string, string | number | boolean>
}
```

### CLI Changes in `cli.ts`

```typescript
// Detect if first arg is an HTML file
if (command.endsWith('.html') || command.endsWith('.htm')) {
  const outputIdx = args.indexOf('-o') !== -1 ? args.indexOf('-o') : args.indexOf('--output')
  const output = outputIdx !== -1 ? args[outputIdx + 1] : 'og.png'

  await generateOG({
    html: command,
    output,
    width: getArgInt(args, '--width', 1200),
    height: getArgInt(args, '--height', 630),
    scale: getArgInt(args, '--scale', 2),
  })
  return
}
```

---

## Examples

### Example 1: Simple Custom Template

```bash
npx @arach/og landing.html -o public/og-landing.png
```

### Example 2: Config with Variables

`og-config.json`:
```json
{
  "html": "templates/product-og.html",
  "output": "public/og.png",
  "vars": {
    "productName": "Acme Pro",
    "price": "$99/mo",
    "accent": "#6366f1"
  }
}
```

### Example 3: Batch with Mixed Templates

```json
[
  {
    "template": "branded",
    "title": "Home",
    "output": "public/og-home.png"
  },
  {
    "html": "og-custom.html",
    "output": "public/og-product.png",
    "vars": { "title": "Product" }
  }
]
```

---

## Migration

- Fully backward compatible
- Existing configs work unchanged
- `html` field is optional and takes precedence over `template` when present

---

## Acceptance Criteria

- [ ] `npx @arach/og template.html` renders custom HTML
- [ ] `-o` / `--output` flag works with HTML files
- [ ] `--width`, `--height`, `--scale` flags work with HTML files
- [ ] Config files support `html` field
- [ ] Config files support `vars` field for substitution
- [ ] `{{varName}}` syntax replaced in HTML
- [ ] Fonts still load correctly (networkidle0 + fonts.ready)
- [ ] Error handling for missing template files
- [ ] Help text updated with custom template examples
- [ ] Skill docs updated
