// @ts-nocheck
'use client';

import { useOgHudson } from './Provider';

export function OgTerminal() {
  const { config, cliCommand } = useOgHudson();
  const rows: [string, string][] = [
    ['template', String(config.template ?? 'branded')],
    ['title', String(config.title ?? '')],
    ['output', String(config.output ?? '')],
    ['size', `${config.width ?? 1200}×${config.height ?? 630} @${config.scale ?? 2}x`],
    ['ports', 'config-json, preview-html'],
    ['generate', cliCommand],
  ];

  return (
    <div className="h-full overflow-auto p-3 font-mono text-[11px] text-slate-400">
      {rows.map(([key, value]) => (
        <div key={key} className="flex gap-4 border-b border-slate-900 py-1">
          <span className="w-20 shrink-0 text-slate-600">{key}</span>
          <span className="break-all text-slate-300">{value}</span>
        </div>
      ))}
    </div>
  );
}
