import { spawnSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateOG } from '../src/generate.ts'
import { renderTemplateHtml } from './template-catalog.ts'
import { renderHtmlToImage, resolveOgRenderBinary } from '../src/render-native.ts'
import type { OGConfig } from '../src/types.ts'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const OUT = join(ROOT, '.review')

const USER_CONFIG: OGConfig = {
  template: 'editor-dark',
  title: '@arach/og',
  subtitle: 'Visual OG preview with social platform mockups.',
  tag: 'v0.3.0',
  accent: '#f07c4f',
  fonts: ['Sora:wght@400;500;600;700', 'DM Sans:wght@400;500'],
  output: join(OUT, 'cli-editor-dark.png'),
  scale: 1,
}

const TEMPLATES = ['branded', 'minimal', 'docs', 'editor-dark'] as const

type Issue = { level: 'error' | 'warn'; message: string }

function pngSize(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 24 || buf.toString('ascii', 1, 4) !== 'PNG') return null
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
}

function inspectPng(path: string, template: string): Issue | null {
  const script = join(ROOT, 'scripts/png-inspect.py')
  const result = spawnSync('python3', [script, path, template], { encoding: 'utf-8' })
  if (result.status === 0) return null
  return {
    level: 'error',
    message: `${template}: ${result.stdout.trim() || result.stderr.trim() || 'inspect failed'}`,
  }
}

async function fetchViewerPng(id: string): Promise<Buffer | null> {
  try {
    const res = await fetch(`http://localhost:5173/api/preview/${id}.png`)
    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.toString('ascii', 1, 4) !== 'PNG') return null
    return buf
  } catch {
    return null
  }
}

const issues: Issue[] = []

const ogRender = await resolveOgRenderBinary()
if (!ogRender) {
  issues.push({ level: 'error', message: 'og-render binary missing — run og build' })
}

await import('node:fs/promises').then((fs) => fs.mkdir(OUT, { recursive: true }))

// 1. CLI path (user config)
try {
  await generateOG(USER_CONFIG)
  const cli = await readFile(USER_CONFIG.output)
  const size = pngSize(cli)
  if (!size || size.width !== 1200 || size.height !== 630) {
    issues.push({ level: 'error', message: `CLI output wrong size: ${size?.width}x${size?.height}` })
  } else {
    console.log(`✓ CLI ${USER_CONFIG.output} (${cli.length} bytes, ${size.width}x${size.height})`)
    const clip = inspectPng(USER_CONFIG.output, 'editor-dark')
    if (clip) issues.push(clip)
    else console.log('  glyph inspect: ok')
  }
} catch (error) {
  issues.push({ level: 'error', message: `CLI generate failed: ${error instanceof Error ? error.message : error}` })
}

// 2. Direct render path (catalog HTML)
for (const id of TEMPLATES) {
  const html = renderTemplateHtml(id)
  if (!html) {
    issues.push({ level: 'error', message: `missing catalog HTML for ${id}` })
    continue
  }

  const out = join(OUT, `catalog-${id}.png`)
  try {
    await renderHtmlToImage({ html, output: out, scale: 1 })
    const buf = await readFile(out)
    const size = pngSize(buf)
    if (!size || size.width !== 1200 || size.height !== 630) {
      issues.push({ level: 'error', message: `${id}: wrong size ${size?.width}x${size.height}` })
      continue
    }
    console.log(`✓ catalog ${id} (${buf.length} bytes)`)
    if (id === 'editor-dark') {
      const clip = inspectPng(out, id)
      if (clip) issues.push(clip)
    }
  } catch (error) {
    issues.push({ level: 'error', message: `${id} render failed: ${error instanceof Error ? error.message : error}` })
  }
}

// 3. Committed public examples (must match fresh catalog renders)
for (const id of TEMPLATES) {
  const path = join(ROOT, 'www/public/examples', `og-${id === 'editor-dark' ? 'editor' : id}.png`)
  const fresh = join(OUT, `catalog-${id}.png`)
  try {
    const [buf, freshBuf] = await Promise.all([readFile(path), readFile(fresh).catch(() => null)])
    const size = pngSize(buf)
    if (!size || size.width !== 1200 || size.height !== 630) {
      issues.push({ level: 'error', message: `stale example ${path}: ${size?.width}x${size?.height}` })
    } else if (buf.length < 10_000) {
      issues.push({ level: 'error', message: `example ${path} too small (${buf.length} bytes) — likely broken` })
    } else if (freshBuf && !buf.equals(freshBuf)) {
      issues.push({ level: 'error', message: `example ${path} differs from fresh render — run bun run export-previews` })
    } else {
      console.log(`✓ example ${path}${freshBuf ? ' (matches catalog)' : ''}`)
    }
  } catch {
    issues.push({ level: 'error', message: `missing example ${path}` })
  }
}

// 4. Viewer API (dev server)
const viewer = await fetchViewerPng('editor-dark')
if (!viewer) {
  issues.push({ level: 'warn', message: 'viewer API /api/preview/editor-dark.png unavailable (dev server off?)' })
} else {
  const size = pngSize(viewer)
  if (!size || size.width !== 1200 || size.height !== 630) {
    issues.push({ level: 'error', message: `viewer API returned non-PNG or wrong size` })
  } else if (viewer.length < 50_000) {
    issues.push({ level: 'error', message: `viewer API PNG too small (${viewer.length} bytes) — likely HTML error page` })
  } else {
    console.log(`✓ viewer API editor-dark (${viewer.length} bytes)`)
    const viewerPath = join(OUT, 'viewer-editor-dark.png')
    await import('node:fs/promises').then((fs) => fs.writeFile(viewerPath, viewer))
    const clip = inspectPng(viewerPath, 'editor-dark')
    if (clip) issues.push(clip)

    const cli = await readFile(USER_CONFIG.output).catch(() => null)
    if (cli && Math.abs(viewer.length - cli.length) > cli.length * 0.15) {
      issues.push({
        level: 'warn',
        message: `viewer PNG size differs from CLI by >15% (viewer ${viewer.length}, cli ${cli.length})`,
      })
    }
  }
}

console.log('\n--- review ---')
if (issues.length === 0) {
  console.log('PASS — all PNG checks OK')
  process.exit(0)
}

for (const issue of issues) {
  console.log(`${issue.level === 'error' ? '✗' : '⚠'} ${issue.message}`)
}

process.exit(issues.some((i) => i.level === 'error') ? 1 : 0)