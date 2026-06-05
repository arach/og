// @ts-nocheck
'use client';

import { createElement, useCallback, useMemo } from 'react';
import type { CommandOption, SearchConfig, StatusColor } from 'hudsonkit';
import { OG_TEMPLATE_IDS, useOgHudson, type OgTemplateId } from './Provider';

const TEMPLATE_LABELS: Record<OgTemplateId, string> = {
  branded: 'Branded',
  docs: 'Docs',
  minimal: 'Minimal',
  'editor-dark': 'Editor Dark',
};

export function useOgCommands(): CommandOption[] {
  const { setTemplate, copyConfig, copyPreviewHtml, downloadConfig, resetConfig } = useOgHudson();

  return useMemo(() => [
    ...OG_TEMPLATE_IDS.map(template => ({
      id: `og:template:${template}`,
      label: `Template: ${TEMPLATE_LABELS[template]}`,
      action: () => setTemplate(template),
      section: 'OG Templates',
    })),
    { id: 'og:copy-config', label: 'Copy OG Config JSON', action: copyConfig, shortcut: 'Cmd+S', section: 'OG' },
    { id: 'og:download-config', label: 'Download OG Config', action: downloadConfig, section: 'OG' },
    { id: 'og:copy-preview-html', label: 'Copy Preview HTML', action: copyPreviewHtml, section: 'OG' },
    { id: 'og:reset-config', label: 'Reset OG Config', action: resetConfig, section: 'OG' },
  ], [setTemplate, copyConfig, copyPreviewHtml, downloadConfig, resetConfig]);
}

export function useOgStatus(): { label: string; color: StatusColor } {
  const { config } = useOgHudson();
  if (!config.title) return { label: 'NEEDS TITLE', color: 'amber' };
  return { label: String(config.template ?? 'BRANDED').toUpperCase(), color: 'emerald' };
}

export function useOgSearch(): SearchConfig {
  const { config, patchConfig } = useOgHudson();
  return useMemo(() => ({
    value: config.title ?? '',
    onChange: title => patchConfig({ title }),
    placeholder: 'OG title...',
  }), [config.title, patchConfig]);
}

export function useOgNavCenter() {
  const { config, setTemplate } = useOgHudson();
  return createElement('div', { className: 'flex items-center gap-1' },
    ...OG_TEMPLATE_IDS.map(template => createElement('button', {
      key: template,
      onClick: () => setTemplate(template),
      className: `px-2.5 py-1 rounded-md text-[11px] transition ${config.template === template ? 'bg-cyan-500 text-slate-950' : 'text-slate-500 hover:text-slate-200'}`,
    }, TEMPLATE_LABELS[template])),
  );
}

export function useOgNavActions() {
  const { copyConfig, downloadConfig } = useOgHudson();
  return createElement('div', { className: 'flex items-center gap-2' },
    createElement('button', {
      key: 'copy',
      onClick: copyConfig,
      className: 'px-2.5 py-1 rounded-md bg-cyan-500 text-slate-950 text-[11px] hover:bg-cyan-400 transition',
    }, 'Copy JSON'),
    createElement('button', {
      key: 'download',
      onClick: downloadConfig,
      className: 'px-2.5 py-1 rounded-md border border-slate-700 text-slate-400 text-[11px] hover:text-slate-100 transition',
    }, 'Download'),
  );
}

export function useOgLayoutMode(): 'panel' {
  return 'panel';
}

export function useOgPortOutput() {
  const { configJson, previewHtml } = useOgHudson();
  return useCallback((portId: string): unknown | null => {
    if (portId === 'config-json') return configJson;
    if (portId === 'preview-html') return previewHtml;
    return null;
  }, [configJson, previewHtml]);
}

export function useOgPortInput() {
  const { setConfig } = useOgHudson();
  return useCallback((portId: string, data: unknown) => {
    if (portId !== 'config-json') return;
    if (typeof data === 'string') setConfig(JSON.parse(data));
    else if (data && typeof data === 'object') setConfig(data as never);
  }, [setConfig]);
}
