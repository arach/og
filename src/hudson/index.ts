// @ts-nocheck
'use client';

import { createElement } from 'react';
import type { HudsonApp, AppManifest } from 'hudsonkit';
import { OgProvider } from './Provider';
import { OgContent } from './Content';
import { OgLeftPanel } from './LeftPanel';
import { OgInspector } from './Inspector';
import { OgTerminal } from './Terminal';
import {
  useOgCommands,
  useOgStatus,
  useOgSearch,
  useOgNavCenter,
  useOgNavActions,
  useOgLayoutMode,
  useOgPortOutput,
  useOgPortInput,
} from './hooks';
import { ogIntents } from './intents';

const ogManifest: AppManifest = {
  id: 'og',
  name: 'OG',
  description: 'Declarative Open Graph image generation workspace',
  mode: 'panel',
  commands: [
    { id: 'og:template:branded', label: 'Template: Branded' },
    { id: 'og:template:docs', label: 'Template: Docs' },
    { id: 'og:template:minimal', label: 'Template: Minimal' },
    { id: 'og:template:editor-dark', label: 'Template: Editor Dark' },
    { id: 'og:copy-config', label: 'Copy OG Config JSON', shortcut: 'Cmd+S' },
    { id: 'og:download-config', label: 'Download OG Config' },
    { id: 'og:copy-preview-html', label: 'Copy Preview HTML' },
    { id: 'og:reset-config', label: 'Reset OG Config' },
  ],
};

export const ogApp: HudsonApp = {
  id: 'og',
  name: 'OG',
  description: 'Declarative OG-image generation with Puppeteer',
  mode: 'panel',
  icon: createElement('span', { className: 'text-cyan-300 font-mono text-[10px]' }, 'OG'),
  manifest: ogManifest,
  intents: ogIntents,

  ports: {
    outputs: [
      { id: 'config-json', name: 'OG Config JSON', dataType: 'json', description: 'Current @arach/og config as formatted JSON' },
      { id: 'preview-html', name: 'Preview HTML', dataType: 'html', description: 'Rendered HTML for the selected built-in template' },
    ],
    inputs: [
      { id: 'config-json', name: 'OG Config JSON', dataType: 'json', description: 'Replace the current config from JSON' },
    ],
  },

  leftPanel: {
    title: 'Templates',
    icon: createElement('span', { className: 'text-cyan-400' }, '◧'),
  },
  rightPanel: {
    title: 'Config',
    icon: createElement('span', { className: 'text-emerald-400' }, '{}'),
  },

  Provider: OgProvider,

  slots: {
    Content: OgContent,
    LeftPanel: OgLeftPanel,
    Inspector: OgInspector,
    Terminal: OgTerminal,
  },

  hooks: {
    useCommands: useOgCommands,
    useStatus: useOgStatus,
    useSearch: useOgSearch,
    useNavCenter: useOgNavCenter,
    useNavActions: useOgNavActions,
    useLayoutMode: useOgLayoutMode,
    usePortOutput: useOgPortOutput,
    usePortInput: useOgPortInput,
  },
};
