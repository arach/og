// @ts-nocheck
'use client';

import { OG_TEMPLATE_IDS, useOgHudson, type OgTemplateId } from './Provider';

const TEMPLATE_COPY: Record<OgTemplateId, { title: string; body: string }> = {
  branded: { title: 'Branded', body: 'Logo, tag chip, glow, product-page card.' },
  docs: { title: 'Docs', body: 'Documentation breadcrumb and calm editorial layout.' },
  minimal: { title: 'Minimal', body: 'Centered typography with a single accent line.' },
  'editor-dark': { title: 'Editor Dark', body: 'Developer-tool card with dark chrome.' },
};

export function OgLeftPanel() {
  const { config, setTemplate, patchConfig, resetConfig, cliCommand } = useOgHudson();

  return (
    <div className="h-full overflow-y-auto px-3 py-3 text-xs text-slate-400">
      <section className="space-y-2">
        <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-slate-500">Templates</div>
        {OG_TEMPLATE_IDS.map(id => {
          const selected = config.template === id;
          return (
            <button
              key={id}
              onClick={() => setTemplate(id)}
              className={`w-full rounded-lg border px-3 py-2 text-left transition ${selected ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-200' : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:text-slate-200'}`}
            >
              <div className="font-medium">{TEMPLATE_COPY[id].title}</div>
              <div className="mt-0.5 text-[11px] leading-4 opacity-70">{TEMPLATE_COPY[id].body}</div>
            </button>
          );
        })}
      </section>

      <section className="mt-5 space-y-2">
        <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-slate-500">Quick outputs</div>
        {['public/og.png', 'app/opengraph-image.png', 'site/out/og.png'].map(output => (
          <button key={output} onClick={() => patchConfig({ output })} className="block w-full truncate rounded-md border border-slate-800 px-2 py-1.5 text-left font-mono text-[11px] text-slate-500 hover:border-slate-700 hover:text-slate-200">
            {output}
          </button>
        ))}
      </section>

      <section className="mt-5 rounded-lg border border-slate-800 bg-slate-950/60 p-3">
        <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-slate-500">Generate</div>
        <code className="mt-2 block whitespace-pre-wrap break-all text-[11px] leading-5 text-slate-300">{cliCommand}</code>
      </section>

      <button onClick={resetConfig} className="mt-4 w-full rounded-lg border border-slate-800 px-3 py-2 text-[11px] text-slate-500 transition hover:border-slate-700 hover:text-slate-200">
        Reset config
      </button>
    </div>
  );
}
