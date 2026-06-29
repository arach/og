import { chmod, copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { constants } from 'node:fs'
import { access } from 'node:fs/promises'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const OG_RENDER_DIR = join(ROOT, 'native/og-render')
const BIN_DIR = join(OG_RENDER_DIR, 'bin')

function darwinTarget(): string {
  const arch = process.arch === 'x64' ? 'x64' : 'arm64'
  return `darwin-${arch}`
}

async function main() {
  const source = join(OG_RENDER_DIR, '.build/release/og-render')
  await access(source, constants.X_OK).catch(() => {
    throw new Error('Release binary missing — run: og build')
  })

  const target = darwinTarget()
  const destDir = join(BIN_DIR, target)
  const dest = join(destDir, 'og-render')

  await mkdir(destDir, { recursive: true })
  await copyFile(source, dest)
  await chmod(dest, 0o755)

  const pkg = JSON.parse(await readFile(join(ROOT, 'package.json'), 'utf-8'))
  const swift = spawnSync('swift', ['--version'], { encoding: 'utf-8' })
  const manifestPath = join(OG_RENDER_DIR, 'manifest.json')

  let manifest: Record<string, unknown> = { targets: {} }
  try {
    manifest = JSON.parse(await readFile(manifestPath, 'utf-8'))
  } catch {
    // fresh manifest
  }

  const targets = (manifest.targets ?? {}) as Record<string, string>
  targets[target] = `bin/${target}/og-render`

  const next = {
    version: pkg.version,
    builtAt: new Date().toISOString(),
    swift: (swift.stdout || swift.stderr || '').trim().split('\n')[0] || null,
    targets,
  }

  await writeFile(manifestPath, `${JSON.stringify(next, null, 2)}\n`)
  console.log(`✓ staged ${dest}`)
  console.log(`✓ manifest v${next.version} (${target})`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})