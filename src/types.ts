export type TemplateId = 'branded' | 'docs' | 'minimal' | 'editor-dark'

export interface OGConfig {
  /**
   * Template to use.
   * Can be a built-in template ID or a path to a custom template file.
   * Supports: .tsx, .jsx, .html, .htm
   * For TSX/JSX: export default React component, receives vars as props
   * For HTML: simple {{varName}} substitution
   */
  template?: TemplateId | string
  /** Primary title (required for built-in templates) */
  title?: string
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
  /** Variables passed to custom template (as props for TSX/JSX, substitution for HTML) */
  vars?: Record<string, string | number | boolean>
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
