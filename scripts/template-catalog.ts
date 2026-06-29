import { templates } from '../src/templates/index.ts'
import type { TemplateContext, TemplateId } from '../src/types.ts'

const FONTS = ['Geist', 'Geist']
const EDITOR_DARK_FONTS = ['Sora:wght@400;500;600;700', 'DM Sans:wght@400;500']

export const templateCatalog = [
  {
    id: 'branded' as TemplateId,
    png: '/examples/og-branded.png',
    description: 'Grid overlay, corner accents, and tag chip',
    socialTitle: '@arach/og — OG images from HTML and real fonts',
    title: '@arach/og',
    subtitle: 'Declarative templates. Native WebKit rendering.',
    tag: 'Open Source',
    accent: '#f07c4f',
    accentSecondary: '#d4a574',
    background: '#faf8f5',
    textColor: '#1a1a1a',
    config: {
      template: 'branded',
      title: '@arach/og',
      subtitle: 'Declarative templates. Native WebKit rendering.',
      tag: 'Open Source',
      accent: '#f07c4f',
      accentSecondary: '#d4a574',
      background: '#faf8f5',
      textColor: '#1a1a1a',
      fonts: FONTS,
      output: 'public/og.png',
    },
  },
  {
    id: 'minimal' as TemplateId,
    png: '/examples/og-minimal.png',
    description: 'Clean and centered, perfect for simple projects',
    socialTitle: '@arach/og — Declarative templates for social cards',
    title: '@arach/og',
    subtitle: 'Declarative templates. Native WebKit rendering.',
    accent: '#f07c4f',
    accentSecondary: '#d4a574',
    background: '#faf8f5',
    textColor: '#1a1a1a',
    config: {
      template: 'minimal',
      title: '@arach/og',
      subtitle: 'Declarative templates. Native WebKit rendering.',
      accent: '#f07c4f',
      output: 'public/og.png',
    },
  },
  {
    id: 'docs' as TemplateId,
    png: '/examples/og-docs.png',
    description: 'Designed for documentation pages',
    socialTitle: 'Quickstart Guide — @arach/og',
    title: 'Quickstart Guide',
    subtitle: 'Generate stunning social cards in seconds.',
    tag: 'Documentation',
    accent: '#f07c4f',
    accentSecondary: '#1f7a65',
    background: '#faf8f5',
    textColor: '#1a1a1a',
    config: {
      template: 'docs',
      title: 'Quickstart Guide',
      subtitle: 'Generate stunning social cards in seconds.',
      tag: 'Documentation',
      accent: '#f07c4f',
      output: 'public/og.png',
    },
  },
  {
    id: 'editor-dark' as TemplateId,
    png: '/examples/og-editor.png',
    description: 'Dark theme with radial glows for products and apps',
    socialTitle: '@arach/og — Dark theme for dev tools and apps',
    title: '@arach/og',
    subtitle: 'Visual OG preview with social platform mockups.',
    tag: 'v0.3.0',
    accent: '#f07c4f',
    accentSecondary: '#1f7a65',
    config: {
      template: 'editor-dark',
      title: '@arach/og',
      subtitle: 'Visual OG preview with social platform mockups.',
      tag: 'v0.3.0',
      accent: '#f07c4f',
      fonts: EDITOR_DARK_FONTS,
      output: 'public/og.png',
    },
  },
]

function buildContext(entry: (typeof templateCatalog)[number]): TemplateContext {
  return {
    title: entry.title,
    subtitle: entry.subtitle,
    accent: entry.accent,
    accentSecondary: entry.accentSecondary,
    background: entry.background ?? '#faf8f5',
    textColor: entry.textColor ?? '#1a1a1a',
    width: 1200,
    height: 630,
    fonts: entry.id === 'editor-dark' ? EDITOR_DARK_FONTS : FONTS,
    tag: entry.tag,
  }
}

export function renderTemplateHtml(id: string): string | null {
  const entry = templateCatalog.find((item) => item.id === id)
  if (!entry) return null

  const template = templates[entry.id]
  if (!template) return null

  return template(buildContext(entry))
}

export function getCatalogJson() {
  return templateCatalog.map(({ id, png, description, socialTitle, config }) => ({
    id,
    png,
    description,
    socialTitle,
    config,
  }))
}