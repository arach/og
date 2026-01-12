export interface ValidationResult {
  url: string
  score: number
  maxScore: number
  checks: ValidationCheck[]
}

export interface ValidationCheck {
  name: string
  status: 'pass' | 'warn' | 'fail'
  message: string
  value?: string | number
  recommendation?: string
}

interface OGTags {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: string
  siteName?: string
  twitterCard?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
}

const THRESHOLDS = {
  title: { min: 30, optimal: { min: 50, max: 60 }, max: 90 },
  description: { min: 70, optimal: { min: 110, max: 160 }, max: 200 },
  image: {
    width: 1200,
    height: 630,
    maxSizeKB: 600,
    formats: ['image/png', 'image/jpeg', 'image/webp']
  }
}

export async function validateOG(targetUrl: string): Promise<ValidationResult> {
  const checks: ValidationCheck[] = []

  // Fetch the page
  let html: string
  try {
    const response = await fetch(targetUrl, {
      headers: { 'User-Agent': 'og-validator/1.0' }
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    html = await response.text()
  } catch (error) {
    return {
      url: targetUrl,
      score: 0,
      maxScore: 100,
      checks: [{
        name: 'URL Accessible',
        status: 'fail',
        message: `Could not fetch URL: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]
    }
  }

  // Parse OG tags
  const tags = parseOGTags(html)

  // Check og:title
  checks.push(checkTitle(tags.title))

  // Check og:description
  checks.push(checkDescription(tags.description))

  // Check og:image
  const imageChecks = await checkImage(tags.image, targetUrl)
  checks.push(...imageChecks)

  // Check og:url
  checks.push(checkUrl(tags.url, targetUrl))

  // Check twitter:card
  checks.push(checkTwitterCard(tags.twitterCard))

  // Calculate score
  const score = calculateScore(checks)

  return {
    url: targetUrl,
    score,
    maxScore: 100,
    checks
  }
}

function parseOGTags(html: string): OGTags {
  const getMetaContent = (property: string): string | undefined => {
    // Match both property="" and name="" attributes
    const patterns = [
      new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i'),
      new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*property=["']${property}["']`, 'i'),
      new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i'),
      new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*name=["']${property}["']`, 'i'),
    ]

    for (const pattern of patterns) {
      const match = html.match(pattern)
      if (match) return match[1]
    }
    return undefined
  }

  return {
    title: getMetaContent('og:title'),
    description: getMetaContent('og:description'),
    image: getMetaContent('og:image'),
    url: getMetaContent('og:url'),
    type: getMetaContent('og:type'),
    siteName: getMetaContent('og:site_name'),
    twitterCard: getMetaContent('twitter:card'),
    twitterTitle: getMetaContent('twitter:title'),
    twitterDescription: getMetaContent('twitter:description'),
    twitterImage: getMetaContent('twitter:image'),
  }
}

function checkTitle(title?: string): ValidationCheck {
  if (!title) {
    return {
      name: 'og:title',
      status: 'fail',
      message: 'Missing og:title tag',
      recommendation: 'Add <meta property="og:title" content="Your Title"> to your page'
    }
  }

  const len = title.length
  const { min, optimal, max } = THRESHOLDS.title

  if (len < min) {
    return {
      name: 'og:title',
      status: 'warn',
      message: `Title too short (${len} chars)`,
      value: len,
      recommendation: `Aim for ${optimal.min}-${optimal.max} characters for best display`
    }
  }

  if (len > max) {
    return {
      name: 'og:title',
      status: 'warn',
      message: `Title too long (${len} chars) - may be truncated`,
      value: len,
      recommendation: `Keep under ${max} characters, ideally ${optimal.min}-${optimal.max}`
    }
  }

  if (len >= optimal.min && len <= optimal.max) {
    return {
      name: 'og:title',
      status: 'pass',
      message: `Title length is optimal (${len} chars)`,
      value: len
    }
  }

  return {
    name: 'og:title',
    status: 'pass',
    message: `Title length is acceptable (${len} chars)`,
    value: len,
    recommendation: `Optimal length is ${optimal.min}-${optimal.max} characters`
  }
}

function checkDescription(description?: string): ValidationCheck {
  if (!description) {
    return {
      name: 'og:description',
      status: 'fail',
      message: 'Missing og:description tag',
      recommendation: 'Add <meta property="og:description" content="Your description"> to your page'
    }
  }

  const len = description.length
  const { min, optimal, max } = THRESHOLDS.description

  if (len < min) {
    return {
      name: 'og:description',
      status: 'warn',
      message: `Description too short (${len} chars)`,
      value: len,
      recommendation: `Aim for ${optimal.min}-${optimal.max} characters for best display`
    }
  }

  if (len > max) {
    return {
      name: 'og:description',
      status: 'warn',
      message: `Description too long (${len} chars) - may be truncated`,
      value: len,
      recommendation: `Keep under ${max} characters, ideally ${optimal.min}-${optimal.max}`
    }
  }

  if (len >= optimal.min && len <= optimal.max) {
    return {
      name: 'og:description',
      status: 'pass',
      message: `Description length is optimal (${len} chars)`,
      value: len
    }
  }

  return {
    name: 'og:description',
    status: 'pass',
    message: `Description length is acceptable (${len} chars)`,
    value: len,
    recommendation: `Optimal length is ${optimal.min}-${optimal.max} characters`
  }
}

async function checkImage(imageUrl?: string, pageUrl?: string): Promise<ValidationCheck[]> {
  const checks: ValidationCheck[] = []

  if (!imageUrl) {
    checks.push({
      name: 'og:image',
      status: 'fail',
      message: 'Missing og:image tag',
      recommendation: 'Add <meta property="og:image" content="https://example.com/og.png"> to your page'
    })
    return checks
  }

  // Resolve relative URLs
  let absoluteUrl = imageUrl
  if (imageUrl.startsWith('/') && pageUrl) {
    const url = new URL(pageUrl)
    absoluteUrl = `${url.protocol}//${url.host}${imageUrl}`
  } else if (!imageUrl.startsWith('http') && pageUrl) {
    const url = new URL(pageUrl)
    absoluteUrl = `${url.protocol}//${url.host}/${imageUrl}`
  }

  // Check if URL is absolute
  if (!imageUrl.startsWith('http')) {
    checks.push({
      name: 'og:image URL',
      status: 'warn',
      message: 'Image URL should be absolute',
      value: imageUrl,
      recommendation: 'Use full URL like https://example.com/og.png for best compatibility'
    })
  } else {
    checks.push({
      name: 'og:image URL',
      status: 'pass',
      message: 'Image URL is absolute',
      value: imageUrl
    })
  }

  // Fetch image to check size and dimensions
  try {
    const response = await fetch(absoluteUrl, {
      headers: { 'User-Agent': 'og-validator/1.0' }
    })

    if (!response.ok) {
      checks.push({
        name: 'og:image accessible',
        status: 'fail',
        message: `Image not accessible (HTTP ${response.status})`,
        recommendation: 'Ensure the image URL is publicly accessible'
      })
      return checks
    }

    checks.push({
      name: 'og:image accessible',
      status: 'pass',
      message: 'Image is accessible'
    })

    // Check content type
    const contentType = response.headers.get('content-type') || ''
    if (THRESHOLDS.image.formats.some(f => contentType.includes(f.split('/')[1]))) {
      checks.push({
        name: 'og:image format',
        status: 'pass',
        message: `Valid format (${contentType})`
      })
    } else {
      checks.push({
        name: 'og:image format',
        status: 'warn',
        message: `Unusual format (${contentType})`,
        recommendation: 'Use PNG, JPEG, or WebP for best compatibility'
      })
    }

    // Check file size
    const buffer = await response.arrayBuffer()
    const sizeKB = Math.round(buffer.byteLength / 1024)

    if (sizeKB > THRESHOLDS.image.maxSizeKB) {
      checks.push({
        name: 'og:image size',
        status: 'fail',
        message: `Image too large (${sizeKB}KB)`,
        value: sizeKB,
        recommendation: `Keep under ${THRESHOLDS.image.maxSizeKB}KB for WhatsApp and other platforms`
      })
    } else if (sizeKB > THRESHOLDS.image.maxSizeKB * 0.8) {
      checks.push({
        name: 'og:image size',
        status: 'warn',
        message: `Image size is borderline (${sizeKB}KB)`,
        value: sizeKB,
        recommendation: `Aim for under ${Math.round(THRESHOLDS.image.maxSizeKB * 0.8)}KB for safety margin`
      })
    } else {
      checks.push({
        name: 'og:image size',
        status: 'pass',
        message: `Image size is good (${sizeKB}KB)`,
        value: sizeKB
      })
    }

    // Check dimensions (PNG only for now - would need image library for full support)
    const dimensions = getPNGDimensions(new Uint8Array(buffer))
    if (dimensions) {
      const { width, height } = dimensions
      const expectedWidth = THRESHOLDS.image.width
      const expectedHeight = THRESHOLDS.image.height

      if (width === expectedWidth && height === expectedHeight) {
        checks.push({
          name: 'og:image dimensions',
          status: 'pass',
          message: `Perfect dimensions (${width}x${height})`,
          value: `${width}x${height}`
        })
      } else if (width >= expectedWidth && height >= expectedHeight) {
        checks.push({
          name: 'og:image dimensions',
          status: 'warn',
          message: `Dimensions larger than needed (${width}x${height})`,
          value: `${width}x${height}`,
          recommendation: `Recommended: ${expectedWidth}x${expectedHeight}px`
        })
      } else {
        checks.push({
          name: 'og:image dimensions',
          status: 'warn',
          message: `Non-standard dimensions (${width}x${height})`,
          value: `${width}x${height}`,
          recommendation: `Recommended: ${expectedWidth}x${expectedHeight}px for best display`
        })
      }
    }

  } catch (error) {
    checks.push({
      name: 'og:image accessible',
      status: 'fail',
      message: `Could not fetch image: ${error instanceof Error ? error.message : 'Unknown error'}`,
      recommendation: 'Ensure the image URL is publicly accessible'
    })
  }

  return checks
}

function checkUrl(ogUrl?: string, pageUrl?: string): ValidationCheck {
  if (!ogUrl) {
    return {
      name: 'og:url',
      status: 'warn',
      message: 'Missing og:url tag',
      recommendation: 'Add <meta property="og:url" content="https://example.com/page"> for canonical URL'
    }
  }

  return {
    name: 'og:url',
    status: 'pass',
    message: 'og:url is present',
    value: ogUrl
  }
}

function checkTwitterCard(card?: string): ValidationCheck {
  if (!card) {
    return {
      name: 'twitter:card',
      status: 'warn',
      message: 'Missing twitter:card tag',
      recommendation: 'Add <meta name="twitter:card" content="summary_large_image"> for Twitter/X'
    }
  }

  const validCards = ['summary', 'summary_large_image', 'app', 'player']
  if (!validCards.includes(card)) {
    return {
      name: 'twitter:card',
      status: 'warn',
      message: `Unknown twitter:card type: ${card}`,
      value: card,
      recommendation: 'Use "summary_large_image" for best image display'
    }
  }

  if (card === 'summary') {
    return {
      name: 'twitter:card',
      status: 'pass',
      message: 'twitter:card is set to summary',
      value: card,
      recommendation: 'Consider "summary_large_image" for larger image display'
    }
  }

  return {
    name: 'twitter:card',
    status: 'pass',
    message: `twitter:card is set to ${card}`,
    value: card
  }
}

function getPNGDimensions(data: Uint8Array): { width: number; height: number } | null {
  // PNG signature: 137 80 78 71 13 10 26 10
  if (data[0] !== 137 || data[1] !== 80 || data[2] !== 78 || data[3] !== 71) {
    // Try JPEG
    if (data[0] === 0xFF && data[1] === 0xD8) {
      return getJPEGDimensions(data)
    }
    return null
  }

  // Width is at bytes 16-19, height at 20-23 (big endian)
  const width = (data[16] << 24) | (data[17] << 16) | (data[18] << 8) | data[19]
  const height = (data[20] << 24) | (data[21] << 16) | (data[22] << 8) | data[23]

  return { width, height }
}

function getJPEGDimensions(data: Uint8Array): { width: number; height: number } | null {
  let offset = 2 // Skip SOI marker

  while (offset < data.length) {
    if (data[offset] !== 0xFF) return null

    const marker = data[offset + 1]

    // SOF0, SOF1, SOF2 markers contain dimensions
    if (marker >= 0xC0 && marker <= 0xC3) {
      const height = (data[offset + 5] << 8) | data[offset + 6]
      const width = (data[offset + 7] << 8) | data[offset + 8]
      return { width, height }
    }

    // Skip to next marker
    const length = (data[offset + 2] << 8) | data[offset + 3]
    offset += 2 + length
  }

  return null
}

function calculateScore(checks: ValidationCheck[]): number {
  const weights: Record<string, number> = {
    'og:title': 15,
    'og:description': 15,
    'og:image': 20,
    'og:image URL': 5,
    'og:image accessible': 15,
    'og:image format': 5,
    'og:image size': 10,
    'og:image dimensions': 10,
    'og:url': 5,
    'twitter:card': 5
  }

  let score = 0
  let maxPossible = 0

  for (const check of checks) {
    const weight = weights[check.name] || 5
    maxPossible += weight

    if (check.status === 'pass') {
      score += weight
    } else if (check.status === 'warn') {
      score += weight * 0.5
    }
  }

  return Math.round((score / maxPossible) * 100)
}

export function formatValidationResult(result: ValidationResult): string {
  const lines: string[] = []

  lines.push('')
  lines.push(`  OG Validation: ${result.url}`)
  lines.push(`  ${'─'.repeat(50)}`)
  lines.push('')

  for (const check of result.checks) {
    const icon = check.status === 'pass' ? '✓' : check.status === 'warn' ? '!' : '✗'
    const color = check.status === 'pass' ? '\x1b[32m' : check.status === 'warn' ? '\x1b[33m' : '\x1b[31m'
    const reset = '\x1b[0m'

    lines.push(`  ${color}${icon}${reset} ${check.name}`)
    lines.push(`    ${check.message}`)
    if (check.recommendation) {
      lines.push(`    → ${check.recommendation}`)
    }
    lines.push('')
  }

  const scoreColor = result.score >= 80 ? '\x1b[32m' : result.score >= 50 ? '\x1b[33m' : '\x1b[31m'
  const reset = '\x1b[0m'
  lines.push(`  ${'─'.repeat(50)}`)
  lines.push(`  Score: ${scoreColor}${result.score}${reset}/100`)
  lines.push('')

  return lines.join('\n')
}
