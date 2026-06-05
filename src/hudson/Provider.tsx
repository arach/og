// @ts-nocheck
'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { templates } from '../templates/index.js';
import type { OGConfig, TemplateId } from '../types.js';

export const OG_TEMPLATE_IDS = ['branded', 'docs', 'minimal', 'editor-dark'] as const satisfies readonly TemplateId[];

export type OgTemplateId = (typeof OG_TEMPLATE_IDS)[number];

type CopyState = 'idle' | 'copied-config' | 'copied-html' | 'downloaded' | 'error';

interface OgHudsonState {
  config: OGConfig;
  setConfig: (config: OGConfig) => void;
  patchConfig: (patch: Partial<OGConfig>) => void;
  setTemplate: (template: OgTemplateId) => void;
  previewHtml: string;
  configJson: string;
  cliCommand: string;
  copyState: CopyState;
  copyConfig: () => Promise<void>;
  copyPreviewHtml: () => Promise<void>;
  downloadConfig: () => void;
  resetConfig: () => void;
}

const DEFAULT_CONFIG: OGConfig = {
  template: 'branded',
  title: 'HudsonKit',
  subtitle: 'Multi-app creative workspaces built on a kit-only runtime',
  accent: '#0ea5e9',
  accentSecondary: '#10b981',
  background: '#071014',
  textColor: '#f8fafc',
  tag: 'Atelier',
  output: 'public/og.png',
  width: 1200,
  height: 630,
  scale: 2,
  fonts: ['Space Grotesk:wght@400;500;600', 'Inter:wght@400;500;600'],
};

const OgHudsonContext = createContext<OgHudsonState | null>(null);

export function useOgHudson() {
  const ctx = useContext(OgHudsonContext);
  if (!ctx) throw new Error('useOgHudson must be used inside OgProvider');
  return ctx;
}

function normalizeConfig(config: OGConfig): OGConfig {
  return {
    ...DEFAULT_CONFIG,
    ...config,
    template: OG_TEMPLATE_IDS.includes(config.template as OgTemplateId)
      ? (config.template as OgTemplateId)
      : DEFAULT_CONFIG.template,
    title: config.title || DEFAULT_CONFIG.title,
    output: config.output || DEFAULT_CONFIG.output,
  };
}

function renderPreview(config: OGConfig): string {
  const normalized = normalizeConfig(config);
  const templateId = normalized.template as OgTemplateId;
  const template = templates[templateId];
  if (!template) return '<!doctype html><html><body>Unknown template</body></html>';

  return template({
    title: normalized.title ?? 'Untitled',
    subtitle: normalized.subtitle,
    accent: normalized.accent ?? '#0ea5e9',
    accentSecondary: normalized.accentSecondary ?? '#10b981',
    background: normalized.background ?? '#071014',
    textColor: normalized.textColor ?? '#f8fafc',
    width: normalized.width ?? 1200,
    height: normalized.height ?? 630,
    fonts: normalized.fonts ?? ['Space Grotesk:wght@400;500;600', 'Inter:wght@400;500;600'],
    logo: normalized.logo,
    tag: normalized.tag,
  });
}

function toCliCommand(config: OGConfig): string {
  const output = config.output ?? DEFAULT_CONFIG.output;
  return `bunx @arach/og og.config.json # -> ${output}`;
}

async function copyText(text: string) {
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    throw new Error('Clipboard is not available in this host');
  }
  await navigator.clipboard.writeText(text);
}

export function OgProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<OGConfig>(DEFAULT_CONFIG);
  const [copyState, setCopyState] = useState<CopyState>('idle');

  const setConfig = useCallback((next: OGConfig) => {
    setConfigState(normalizeConfig(next));
    setCopyState('idle');
  }, []);

  const patchConfig = useCallback((patch: Partial<OGConfig>) => {
    setConfigState(prev => normalizeConfig({ ...prev, ...patch }));
    setCopyState('idle');
  }, []);

  const setTemplate = useCallback((template: OgTemplateId) => {
    patchConfig({ template });
  }, [patchConfig]);

  const previewHtml = useMemo(() => renderPreview(config), [config]);
  const configJson = useMemo(() => JSON.stringify(config, null, 2), [config]);
  const cliCommand = useMemo(() => toCliCommand(config), [config]);

  const copyConfig = useCallback(async () => {
    try {
      await copyText(configJson);
      setCopyState('copied-config');
    } catch {
      setCopyState('error');
    }
  }, [configJson]);

  const copyPreviewHtml = useCallback(async () => {
    try {
      await copyText(previewHtml);
      setCopyState('copied-html');
    } catch {
      setCopyState('error');
    }
  }, [previewHtml]);

  const downloadConfig = useCallback(() => {
    if (typeof document === 'undefined') return;
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'og.config.json';
    a.click();
    URL.revokeObjectURL(url);
    setCopyState('downloaded');
  }, [configJson]);

  const resetConfig = useCallback(() => setConfigState(DEFAULT_CONFIG), []);

  const value = useMemo<OgHudsonState>(() => ({
    config,
    setConfig,
    patchConfig,
    setTemplate,
    previewHtml,
    configJson,
    cliCommand,
    copyState,
    copyConfig,
    copyPreviewHtml,
    downloadConfig,
    resetConfig,
  }), [config, setConfig, patchConfig, setTemplate, previewHtml, configJson, cliCommand, copyState, copyConfig, copyPreviewHtml, downloadConfig, resetConfig]);

  return <OgHudsonContext.Provider value={value}>{children}</OgHudsonContext.Provider>;
}
