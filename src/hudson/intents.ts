import type { AppIntent } from 'hudsonkit';

export const ogIntents: AppIntent[] = [
  {
    commandId: 'og:template:branded',
    title: 'Use Branded OG Template',
    description: 'Switch the preview to the branded Open Graph image template.',
    category: 'view',
    keywords: ['branded', 'template', 'og', 'social image'],
  },
  {
    commandId: 'og:template:docs',
    title: 'Use Docs OG Template',
    description: 'Switch the preview to the documentation Open Graph image template.',
    category: 'view',
    keywords: ['docs', 'documentation', 'template', 'og'],
  },
  {
    commandId: 'og:template:minimal',
    title: 'Use Minimal OG Template',
    description: 'Switch the preview to the minimal typography-led Open Graph image template.',
    category: 'view',
    keywords: ['minimal', 'clean', 'template', 'og'],
  },
  {
    commandId: 'og:template:editor-dark',
    title: 'Use Editor Dark OG Template',
    description: 'Switch the preview to the dark developer-tool Open Graph image template.',
    category: 'view',
    keywords: ['editor', 'dark', 'developer', 'template', 'og'],
  },
  {
    commandId: 'og:copy-config',
    title: 'Copy OG Config JSON',
    description: 'Copy the current declarative OG image config to the clipboard.',
    category: 'file',
    keywords: ['copy', 'json', 'config', 'clipboard', 'og'],
    shortcut: 'Cmd+S',
  },
  {
    commandId: 'og:download-config',
    title: 'Download OG Config',
    description: 'Download the current OG config as og.config.json.',
    category: 'file',
    keywords: ['download', 'save', 'json', 'config'],
  },
  {
    commandId: 'og:copy-preview-html',
    title: 'Copy Preview HTML',
    description: 'Copy the rendered built-in template HTML used for the live preview.',
    category: 'file',
    keywords: ['copy', 'html', 'preview', 'template'],
  },
  {
    commandId: 'og:reset-config',
    title: 'Reset OG Config',
    description: 'Reset the OG config to the Atelier/Hudson starter values.',
    category: 'edit',
    keywords: ['reset', 'defaults', 'clear', 'start over'],
    dangerous: true,
  },
];
