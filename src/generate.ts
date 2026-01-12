import puppeteer from 'puppeteer'
import { mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import type { OGConfig, TemplateContext } from './types.js'
import { templates } from './templates/index.js'

const DEFAULT_FONTS = ['Fraunces:wght@500;600', 'Space Grotesk:wght@400;500;600']
const DEFAULT_ACCENT = '#f07c4f'
const DEFAULT_ACCENT_SECONDARY = '#1f7a65'
const DEFAULT_BACKGROUND = '#f7f3ec'
const DEFAULT_TEXT_COLOR = '#101518'

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
  } = config

  const templateFn = templates[template]
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

  const html = templateFn(context)

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
      } = config

      const templateFn = templates[template]
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

      const html = templateFn(context)

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
