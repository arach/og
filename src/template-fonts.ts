const GEIST_VERSION = '1.7.2'
const GEIST_CDN = `https://cdn.jsdelivr.net/npm/geist@${GEIST_VERSION}/dist/fonts`

export const DEFAULT_FONTS = ['Geist', 'Geist'] as const

function usesGeist(...specs: string[]): boolean {
  return specs.some((spec) => fontFamilyName(spec).toLowerCase() === 'geist')
}

/** Extract the CSS font-family name from a Google Fonts spec like "Inter:wght@400;500". */
export function fontFamilyName(spec: string): string {
  return spec.split(':')[0].trim()
}

/** Build a Google Fonts CSS2 href from an array of font specs. */
export function googleFontsHref(fonts: string[], extraFamilies: string[] = []): string {
  const families = [...fonts, ...extraFamilies]
    .filter((font) => fontFamilyName(font).toLowerCase() !== 'geist')
  if (families.length === 0) return ''

  const query = families
    .map((font) => `family=${font.replace(/ /g, '+')}`)
    .join('&')
  return `https://fonts.googleapis.com/css2?${query}&display=swap`
}

/** CSS font-family stack for a Google Fonts spec. */
export function fontStack(spec: string, fallback = 'system-ui, sans-serif'): string {
  return `'${fontFamilyName(spec)}', ${fallback}`
}

function geistFontFaceCss(includeMono = false): string {
  const faces = [
    `@font-face {
  font-family: 'Geist';
  src: url('${GEIST_CDN}/geist-sans/Geist-Variable.woff2') format('woff2');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}`,
    `@font-face {
  font-family: 'Geist';
  src: url('${GEIST_CDN}/geist-sans/Geist-Italic[wght].woff2') format('woff2');
  font-weight: 100 900;
  font-style: italic;
  font-display: swap;
}`,
  ]

  if (includeMono) {
    faces.push(`@font-face {
  font-family: 'Geist Mono';
  src: url('${GEIST_CDN}/geist-mono/GeistMono-Variable.woff2') format('woff2');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}`)
  }

  return faces.join('\n')
}

export interface TemplateFontSet {
  display: string
  body: string
  mono: string
  displayName: string
  bodyName: string
  head: string
}

export function templateFonts(
  ctx: { fonts: string[] },
  options: { mono?: boolean } = {},
): TemplateFontSet {
  const display = ctx.fonts[0]
  const body = ctx.fonts[1] || ctx.fonts[0]

  if (usesGeist(display, body)) {
    return {
      display: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      body: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      mono: "'Geist Mono', ui-monospace, 'SF Mono', monospace",
      displayName: 'Geist',
      bodyName: 'Geist',
      head: `<style>${geistFontFaceCss(options.mono)}</style>`,
    }
  }

  const href = googleFontsHref(ctx.fonts, options.mono ? ['JetBrains Mono:wght@400;500'] : [])
  const googleHead = href
    ? `<link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${href}" rel="stylesheet">`
    : ''

  return {
    display: fontStack(display),
    body: fontStack(body),
    mono: "'JetBrains Mono', monospace",
    displayName: fontFamilyName(display),
    bodyName: fontFamilyName(body),
    head: googleHead,
  }
}