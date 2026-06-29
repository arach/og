import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { unlink } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

// Lazy-loaded modules (typed as any to avoid requiring types at build time)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let esbuild: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let React: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let ReactDOMServer: any = null

// Helper to dynamically import modules without TypeScript resolving them
async function dynamicImport(moduleName: string): Promise<any> {
  return import(moduleName)
}

async function loadDependencies() {
  if (!esbuild || !React || !ReactDOMServer) {
    try {
      esbuild = await dynamicImport('esbuild')
      React = await dynamicImport('react')
      ReactDOMServer = await dynamicImport('react-dom/server')
    } catch {
      throw new Error(
        'Custom TSX/JSX templates require additional dependencies.\n' +
        'Install them with: bun add esbuild react react-dom'
      )
    }
  }
  return { esbuild, React, ReactDOMServer }
}

/**
 * Compile and render a JSX/TSX template to HTML
 */
export async function compileAndRender(
  templatePath: string,
  vars: Record<string, unknown> = {}
): Promise<string> {
  const { esbuild, React, ReactDOMServer } = await loadDependencies()

  const outfile = join(tmpdir(), `og-template-${Date.now()}.mjs`)

  try {
    // Compile TSX/JSX to JS
    await esbuild.build({
      entryPoints: [templatePath],
      outfile,
      bundle: true,
      platform: 'node',
      format: 'esm',
      jsx: 'automatic',
      external: ['react', 'react-dom'],
      logLevel: 'silent',
    })

    // Import the compiled module
    const moduleUrl = pathToFileURL(outfile).href
    const module = await dynamicImport(moduleUrl)
    const Component = module.default

    if (!Component) {
      throw new Error(`Template ${templatePath} must export a default component`)
    }

    // Render to static HTML
    const element = React.createElement(Component, vars)
    const html = ReactDOMServer.renderToStaticMarkup(element)

    // Wrap in doctype if not present
    if (!html.toLowerCase().startsWith('<!doctype')) {
      return `<!DOCTYPE html>${html}`
    }
    return html
  } finally {
    // Clean up temp file
    await unlink(outfile).catch(() => {})
  }
}
