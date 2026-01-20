import puppeteer from 'puppeteer'
import { mkdir, readFile } from 'node:fs/promises'
import { dirname, extname, resolve } from 'node:path'
import type { OGConfig, TemplateContext, TemplateId } from './types.js'
import { templates } from './templates/index.js'
import { compileAndRender } from './compile.js'

const DEFAULT_FONTS = ['Fraunces:wght@500;600', 'Space Grotesk:wght@400;500;600']
const DEFAULT_ACCENT = '#f07c4f'
const DEFAULT_ACCENT_SECONDARY = '#1f7a65'
const DEFAULT_BACKGROUND = '#f7f3ec'
const DEFAULT_TEXT_COLOR = '#101518'

/**
 * Check if a template value is a file path (has a supported extension)
 */
function isCustomTemplate(template: string): boolean {
  const ext = extname(template).toLowerCase()
  return ['.tsx', '.jsx', '.html', '.htm'].includes(ext)
}

/**
 * Render HTML from a custom template file
 */
async function renderCustomTemplate(
  templatePath: string,
  vars: Record<string, unknown> = {}
): Promise<string> {
  const ext = extname(templatePath).toLowerCase()
  const fullPath = resolve(process.cwd(), templatePath)

  if (ext === '.tsx' || ext === '.jsx') {
    // JSX/TSX template - compile and render
    return compileAndRender(fullPath, vars)
  } else if (ext === '.html' || ext === '.htm') {
    // Raw HTML template - simple var substitution
    let html = await readFile(fullPath, 'utf-8')
    for (const [key, value] of Object.entries(vars)) {
      html = html.replaceAll(`{{${key}}}`, String(value))
    }
    return html
  }

  throw new Error(`Unsupported template extension: ${ext}`)
}

/**
 * Generate an OG image from config
 */
export async function generateOG(config: OGConfig): Promise<void> {
  const {
    template = 'branded',
    title,
    subtitle,
    accent = DEFAULT_ACCENT,
    accentSecondary = DEFAULT_ACCENT_SECONDARY,
    background = DEFAULT_BACKGROUND,
    textColor = DEFAULT_TEXT_COLOR,
    output,
    width = 1200,
    height = 630,
    scale = 2,
    fonts = DEFAULT_FONTS,
    logo,
    tag,
    vars,
  } = config

  let html: string

  // Check if template is a custom file path
  if (isCustomTemplate(template)) {
    html = await renderCustomTemplate(template, vars)
  } else {
    // Built-in template
    if (!title) {
      throw new Error('title is required for built-in templates')
    }

    const templateFn = templates[template as TemplateId]
    if (!templateFn) {
      throw new Error(`Unknown template: ${template}. Available: ${Object.keys(templates).join(', ')}`)
    }

    const context: TemplateContext = {
      title,
      subtitle,
      accent,
      accentSecondary,
      background,
      textColor,
      width,
      height,
      fonts,
      logo,
      tag,
    }

    html = templateFn(context)
  }

  // Ensure output directory exists
  await mkdir(dirname(output), { recursive: true })

  // Launch browser and generate
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width, height, deviceScaleFactor: scale })
    await page.setContent(html, { waitUntil: 'networkidle0' })

    // Wait for fonts to load
    await page.evaluate('document.fonts.ready')

    // Extra buffer for font rendering
    await new Promise((resolve) => setTimeout(resolve, 500))

    await page.screenshot({
      path: output as `${string}.png`,
      type: output.endsWith('.png') ? 'png' : 'jpeg',
      ...(output.endsWith('.jpeg') || output.endsWith('.jpg') ? { quality: 90 } : {}),
    })

    console.log(`✓ Generated ${output}`)
  } finally {
    await browser.close()
  }
}

/**
 * Generate multiple OG images from configs
 */
export async function generateOGBatch(configs: OGConfig[]): Promise<void> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    for (const config of configs) {
      const {
        template = 'branded',
        title,
        subtitle,
        accent = DEFAULT_ACCENT,
        accentSecondary = DEFAULT_ACCENT_SECONDARY,
        background = DEFAULT_BACKGROUND,
        textColor = DEFAULT_TEXT_COLOR,
        output,
        width = 1200,
        height = 630,
        scale = 2,
        fonts = DEFAULT_FONTS,
        logo,
        tag,
        vars,
      } = config

      let html: string

      // Check if template is a custom file path
      if (isCustomTemplate(template)) {
        try {
          html = await renderCustomTemplate(template, vars)
        } catch (error) {
          console.error(`✗ Error rendering custom template ${template}:`, error instanceof Error ? error.message : error)
          continue
        }
      } else {
        // Built-in template
        if (!title) {
          console.error(`✗ title is required for built-in template: ${template}`)
          continue
        }

        const templateFn = templates[template as TemplateId]
        if (!templateFn) {
          console.error(`✗ Unknown template: ${template}`)
          continue
        }

        const context: TemplateContext = {
          title,
          subtitle,
          accent,
          accentSecondary,
          background,
          textColor,
          width,
          height,
          fonts,
          logo,
          tag,
        }

        html = templateFn(context)
      }

      await mkdir(dirname(output), { recursive: true })

      const page = await browser.newPage()
      await page.setViewport({ width, height, deviceScaleFactor: scale })
      await page.setContent(html, { waitUntil: 'networkidle0' })
      await page.evaluate('document.fonts.ready')
      await new Promise((resolve) => setTimeout(resolve, 500))

      await page.screenshot({
        path: output as `${string}.png`,
        type: output.endsWith('.png') ? 'png' : 'jpeg',
        ...(output.endsWith('.jpeg') || output.endsWith('.jpg') ? { quality: 90 } : {}),
      })

      await page.close()
      console.log(`✓ Generated ${output}`)
    }
  } finally {
    await browser.close()
  }
}
