import { mkdir, readFile } from 'node:fs/promises'
import { dirname, extname, resolve } from 'node:path'
import type { OGConfig, TemplateContext, TemplateId } from './types.js'
import { templates } from './templates/index.js'
import { compileAndRender } from './compile.js'
import { DEFAULT_FONTS } from './template-fonts.js'
import { renderHtmlToImage } from './render-native.js'

const DEFAULT_ACCENT = '#f07c4f'
const DEFAULT_ACCENT_SECONDARY = '#1f7a65'
const DEFAULT_BACKGROUND = '#f7f3ec'
const DEFAULT_TEXT_COLOR = '#101518'

function isCustomTemplate(template: string): boolean {
  const ext = extname(template).toLowerCase()
  return ['.tsx', '.jsx', '.html', '.htm'].includes(ext)
}

async function renderCustomTemplate(
  templatePath: string,
  vars: Record<string, unknown> = {},
): Promise<string> {
  const ext = extname(templatePath).toLowerCase()
  const fullPath = resolve(process.cwd(), templatePath)

  if (ext === '.tsx' || ext === '.jsx') {
    return compileAndRender(fullPath, vars)
  } else if (ext === '.html' || ext === '.htm') {
    let html = await readFile(fullPath, 'utf-8')
    for (const [key, value] of Object.entries(vars)) {
      html = html.replaceAll(`{{${key}}}`, String(value))
    }
    return html
  }

  throw new Error(`Unsupported template extension: ${ext}`)
}

async function resolveTemplateHtml(config: OGConfig): Promise<string> {
  const {
    template = 'branded',
    title,
    subtitle,
    accent = DEFAULT_ACCENT,
    accentSecondary = DEFAULT_ACCENT_SECONDARY,
    background = DEFAULT_BACKGROUND,
    textColor = DEFAULT_TEXT_COLOR,
    width = 1200,
    height = 630,
    fonts = [...DEFAULT_FONTS],
    logo,
    tag,
    vars,
  } = config

  if (isCustomTemplate(template)) {
    return renderCustomTemplate(template, vars)
  }

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

  return templateFn(context)
}

/**
 * Generate an OG image from config
 */
export async function generateOG(config: OGConfig): Promise<void> {
  const html = await resolveTemplateHtml(config)
  const { output, width = 1200, height = 630, scale = 2 } = config

  await mkdir(dirname(output), { recursive: true })
  await renderHtmlToImage({ html, output, width, height, scale })

  console.log(`✓ Generated ${output}`)
}

/**
 * Generate multiple OG images from configs
 */
export async function generateOGBatch(configs: OGConfig[]): Promise<void> {
  for (const config of configs) {
    try {
      await generateOG(config)
    } catch (error) {
      const label = config.output || config.template || 'unknown'
      console.error(`✗ ${label}:`, error instanceof Error ? error.message : error)
    }
  }
}