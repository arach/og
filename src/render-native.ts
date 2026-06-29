import { spawn, spawnSync } from 'node:child_process'
import { access, readFile, writeFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'

const PACKAGE_ROOT = fileURLToPath(new URL('..', import.meta.url))
const OG_RENDER_DIR = join(PACKAGE_ROOT, 'native/og-render')

export interface OgRenderManifest {
  version: string
  builtAt: string
  swift: string | null
  targets: Record<string, string>
}

function darwinArch(): 'arm64' | 'x64' {
  return process.arch === 'x64' ? 'x64' : 'arm64'
}

export async function readOgRenderManifest(): Promise<OgRenderManifest | null> {
  try {
    const raw = await readFile(join(OG_RENDER_DIR, 'manifest.json'), 'utf-8')
    return JSON.parse(raw) as OgRenderManifest
  } catch {
    return null
  }
}

export async function getOgRenderInfo(): Promise<{
  manifest: OgRenderManifest | null
  binary: string | null
  source: 'bundled' | 'local-build' | 'path' | null
}> {
  const manifest = await readOgRenderManifest()
  const binary = await resolveOgRenderBinary()
  if (!binary) {
    return { manifest, binary: null, source: null }
  }

  if (binary.includes('/native/og-render/bin/')) {
    return { manifest, binary, source: 'bundled' }
  }
  if (binary.includes('/native/og-render/.build/')) {
    return { manifest, binary, source: 'local-build' }
  }
  return { manifest, binary, source: 'path' }
}

export interface RenderOptions {
  html: string
  output: string
  width?: number
  height?: number
  scale?: number
}

async function isExecutable(path: string): Promise<boolean> {
  try {
    await access(path, constants.X_OK)
    return true
  } catch {
    return false
  }
}

/** Resolve the og-render binary — bundled prebuild, local build, or PATH. */
export async function resolveOgRenderBinary(): Promise<string | null> {
  const arch = darwinArch()
  const candidates = [
    join(OG_RENDER_DIR, 'bin', `darwin-${arch}`, 'og-render'),
    join(OG_RENDER_DIR, '.build/release/og-render'),
    join(OG_RENDER_DIR, '.build/debug/og-render'),
    'og-render',
  ]

  for (const candidate of candidates) {
    if (await isExecutable(candidate)) return candidate
  }

  return null
}

/** Build og-render with Swift (macOS only). Returns path to the release binary. */
export async function buildOgRender(): Promise<string> {
  if (process.platform !== 'darwin') {
    throw new Error('og-render can only be built on macOS (requires system WebKit).')
  }

  const swift = spawnSync('swift', ['--version'], { encoding: 'utf-8' })
  if (swift.status !== 0) {
    throw new Error(
      'Swift toolchain not found. Install Xcode or run: xcode-select --install',
    )
  }

  const build = spawnSync('swift', ['build', '-c', 'release'], {
    cwd: OG_RENDER_DIR,
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  if (build.status !== 0) {
    const detail = (build.stderr || build.stdout || '').trim()
    throw new Error(detail || 'swift build failed')
  }

  const binary = await resolveOgRenderBinary()
  if (!binary) {
    throw new Error('og-render build finished but binary was not found')
  }

  return binary
}

/** Resolve og-render, optionally building it first on macOS. */
export async function ensureOgRender(options: { autoBuild?: boolean } = {}): Promise<string> {
  const existing = await resolveOgRenderBinary()
  if (existing) return existing

  if (process.platform !== 'darwin') {
    throw new Error(
      '@arach/og rendering requires macOS with og-render (system WebKit).',
    )
  }

  if (options.autoBuild) {
    console.log('Building og-render (native WebKit renderer)...')
    return buildOgRender()
  }

  throw new Error(
    'og-render not found. Build it with: og build',
  )
}

function runOgRender(
  binary: string,
  htmlPath: string,
  options: RenderOptions,
): Promise<void> {
  const { output, width = 1200, height = 630, scale = 2 } = options

  return new Promise((resolve, reject) => {
    const args = [
      htmlPath,
      '-o', output,
      '-w', String(width),
      '-h', String(height),
      '-s', String(scale),
    ]

    const child = spawn(binary, args, { stdio: ['ignore', 'pipe', 'pipe'] })
    let stderr = ''

    child.stderr?.on('data', (chunk) => {
      stderr += chunk.toString()
    })

    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(stderr.trim() || `og-render exited with code ${code}`))
    })
  })
}

export async function renderHtmlToImage(options: RenderOptions): Promise<void> {
  const binary = await ensureOgRender({ autoBuild: true })

  const dir = await mkdtemp(join(tmpdir(), 'og-render-'))
  const htmlPath = join(dir, 'page.html')
  await writeFile(htmlPath, options.html, 'utf-8')

  try {
    await runOgRender(binary, htmlPath, options)
  } finally {
    // Temp dir left for OS cleanup; og-render only needs the file during run
  }
}