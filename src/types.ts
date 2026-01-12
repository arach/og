export type TemplateId = 'branded' | 'docs' | 'minimal' | 'editor-dark'

export interface OGConfig {
  /** Template to use */
  template?: TemplateId
  /** Primary title */
  title: string
  /** Subtitle or description */
  subtitle?: string
  /** Brand/accent color (hex) */
  accent?: string
  /** Secondary accent color (hex) */
  accentSecondary?: string
  /** Background color (hex) */
  background?: string
  /** Text color (hex) */
  textColor?: string
  /** Output file path */
  output: string
  /** Width in pixels (default: 1200) */
  width?: number
  /** Height in pixels (default: 630) */
  height?: number
  /** Device scale factor for retina (default: 2) */
  scale?: number
  /** Custom fonts to load from Google Fonts */
  fonts?: string[]
  /** Optional logo URL or base64 */
  logo?: string
  /** Optional tag/chip text */
  tag?: string
}

export interface TemplateContext {
  title: string
  subtitle?: string
  accent: string
  accentSecondary: string
  background: string
  textColor: string
  width: number
  height: number
  fonts: string[]
  logo?: string
  tag?: string
}

export type TemplateFunction = (ctx: TemplateContext) => string
