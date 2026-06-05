// @ts-nocheck
'use client';

import { useOgHudson } from './Provider';

function Field({ label, value, onChange, placeholder, type = 'text' }: {
  label: string;
  value: string | number | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-slate-500">{label}</span>
      <input
        type={type}
        value={value ?? ''}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-500/60"
      />
    </label>
  );
}

export function OgContent() {
  const { config, patchConfig, previewHtml, copyConfig, copyPreviewHtml, downloadConfig, copyState } = useOgHudson();

  return (
    <div className="h-full overflow-hidden bg-slate-950 text-slate-100">
      <div className="grid h-full grid-cols-[minmax(320px,420px)_1fr]">
        <div className="overflow-y-auto border-r border-slate-800/80 p-5">
          <div className="mb-5">
            <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-cyan-400">OG config</div>
            <h2 className="mt-1 text-lg font-semibold text-slate-100">Compose a social image</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">Edit the declarative config. The app previews built-in templates in-browser; Puppeteer generation stays in the package CLI or a host route.</p>
          </div>

          <div className="space-y-4">
            <Field label="Title" value={config.title} onChange={title => patchConfig({ title })} />
            <Field label="Subtitle" value={config.subtitle} onChange={subtitle => patchConfig({ subtitle })} />
            <Field label="Tag" value={config.tag} onChange={tag => patchConfig({ tag })} />
            <Field label="Output" value={config.output} onChange={output => patchConfig({ output })} />

            <div className="grid grid-cols-2 gap-3">
              <Field label="Accent" value={config.accent} onChange={accent => patchConfig({ accent })} />
              <Field label="Secondary" value={config.accentSecondary} onChange={accentSecondary => patchConfig({ accentSecondary })} />
              <Field label="Background" value={config.background} onChange={background => patchConfig({ background })} />
              <Field label="Text" value={config.textColor} onChange={textColor => patchConfig({ textColor })} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Field label="Width" type="number" value={config.width} onChange={width => patchConfig({ width: Number(width) || 1200 })} />
              <Field label="Height" type="number" value={config.height} onChange={height => patchConfig({ height: Number(height) || 630 })} />
              <Field label="Scale" type="number" value={config.scale} onChange={scale => patchConfig({ scale: Number(scale) || 2 })} />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button onClick={copyConfig} className="rounded-lg bg-cyan-500 px-3 py-2 text-xs font-medium text-slate-950 transition hover:bg-cyan-400">Copy JSON</button>
            <button onClick={downloadConfig} className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 transition hover:border-slate-500 hover:text-white">Download config</button>
            <button onClick={copyPreviewHtml} className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 transition hover:border-slate-500 hover:text-white">Copy HTML</button>
          </div>
          {copyState !== 'idle' && (
            <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-[11px] text-emerald-300">
              {copyState === 'copied-config' ? 'Config copied.' : copyState === 'copied-html' ? 'Preview HTML copied.' : copyState === 'downloaded' ? 'Config downloaded.' : 'Clipboard unavailable in this host.'}
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col overflow-hidden p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">Live preview</div>
              <div className="text-sm text-slate-300">{config.template ?? 'branded'} · {config.width ?? 1200}×{config.height ?? 630}</div>
            </div>
            <div className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.14em] text-cyan-300">Hudson port ready</div>
          </div>
          <div className="flex flex-1 min-h-0 items-center justify-center rounded-2xl border border-slate-800 bg-[radial-gradient(circle_at_50%_20%,rgba(14,165,233,0.18),transparent_40%),#020617] p-6">
            <div className="aspect-[1200/630] w-full max-w-5xl overflow-hidden rounded-xl border border-slate-700/70 bg-black shadow-2xl shadow-cyan-950/30">
              <iframe title="OG preview" srcDoc={previewHtml} className="h-full w-full origin-top-left border-0" sandbox="allow-same-origin" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
