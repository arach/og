<p align="center">
  <img src="https://raw.githubusercontent.com/arach/og/master/examples/og-editor.png" alt="OG image generated with @arach/og" width="720">
</p>

<h3 align="center">OG images from HTML and <em>real</em> fonts.</h3>

<p align="center">
  Declarative templates snapshotted by <code>og-render</code> — a tiny native WebKit renderer.<br>
  Full CSS, Google Fonts at render time. No Puppeteer, no Chromium in npm.
</p>

<p align="center">
  <a href="https://og.arach.dev"><strong>og.arach.dev</strong></a>
  ·
  <a href="https://www.npmjs.com/package/@arach/og">npm</a>
  ·
  <a href="https://github.com/arach/og/releases">og-render releases</a>
</p>

---

## Try it

```bash
bunx @arach/og viewer
```

Opens a local preview of every template with live renders. The package ships a prebuilt `og-render` binary for macOS — run `og version` to check versions, `og build` to rebuild from source.

## Why not Puppeteer?

Most OG tools pull in a headless browser — Puppeteer, Playwright, or bundled Chromium — plus font files as npm dependencies to get typography right.

`@arach/og` takes a different path: templates are plain HTML, fonts load from Google Fonts or CDN at render time, and `og-render` snapshots them through macOS WebKit. No browser download in npm — just a small native CLI that uses the WebKit already on your Mac.

| | Puppeteer / Playwright | `@arach/og` |
|---|---|---|
| npm browser dep | Bundled Chromium (~300MB) | None |
| Renderer | Downloaded Chromium | `og-render` → system WebKit |
| Fonts | npm packages or manual embed | Google Fonts / CDN at render |
| CSS | Full | Full |
| PNG export | macOS, Linux, CI | macOS (`og-render` required) |

## Installation

```bash
bun add @arach/og
og version   # @arach/og + bundled og-render versions
og build     # rebuild og-render from Swift source (optional)
```

`og-render` ships as a **prebuilt binary** for your Mac arch (`native/og-render/bin/darwin-arm64/` or `darwin-x64/`), with Swift source if you need to rebuild. It's a headless WKWebView snapshotter — not a Chromium download.

**Signed releases** (Developer ID + Apple notarization) are on GitHub:

```bash
# https://github.com/arach/og/releases — e.g. og-render-v0.3.0
# og-render-v0.3.0-darwin-arm64.zip
# og-render-v0.3.0-darwin-x64.zip
```

To cut a release locally or in CI:

```bash
bun run release:native          # build, sign, notarize (macOS + certs)
# CI: push tag og-render-v0.3.0 (see .github/workflows/release-og-render.yml)
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
bunx @arach/og config.json          # generate from JSON (single or batch)
bunx @arach/og validate <url>       # check OG tags, image size, dimensions
bunx @arach/og audit <url>          # audit a site via sitemap
bunx @arach/og viewer               # local template preview
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

Four templates out of the box. [Preview them all →](https://og.arach.dev/viewer.html)

<p align="center">
  <img src="https://raw.githubusercontent.com/arach/og/master/examples/og-branded.png" alt="branded template" width="360">
  <img src="https://raw.githubusercontent.com/arach/og/master/examples/og-docs.png" alt="docs template" width="360">
</p>
<p align="center">
  <img src="https://raw.githubusercontent.com/arach/og/master/examples/og-minimal.png" alt="minimal template" width="360">
  <img src="https://raw.githubusercontent.com/arach/og/master/examples/og-editor.png" alt="editor-dark template" width="360">
</p>

| Template | Best for |
|---|---|
| `branded` | Product landing pages — logo, tag chip, accent glow |
| `docs` | Documentation — breadcrumb-style layout |
| `minimal` | Blog posts and articles — clean, centered |
| `editor-dark` | Developer tools and code editors — dark theme |

## Configuration

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
| `fonts` | `string[]` | `['Geist', 'Geist']` | Google Fonts or Geist (CDN) — loaded at render |
| `logo` | `string` | - | Logo URL or base64 |
| `tag` | `string` | - | Tag/chip text |

## Batch generation

```typescript
import { generateOGBatch } from '@arach/og'

await generateOGBatch([
  { template: 'branded', title: 'Home', output: 'og-home.png' },
  { template: 'docs', title: 'Docs', output: 'og-docs.png' },
])
```

## Hudson / Atelier bundle

`@arach/og` exports a Hudson app bundle from `./catalog`:

```ts
import { ogBundle, ogWorkspaceEntry, ogApp } from '@arach/og/catalog'
```

The Preframe-style alias `catalogApp` is also exported, so a host can resolve it with `mod.catalogApp ?? mod.ogApp ?? mod.default`. The bundle includes the `HudsonApp`, intents, config/HTML ports, a workspace registration entry, and a note describing assets/toolsets.

## License

MIT