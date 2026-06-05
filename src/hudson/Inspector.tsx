// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import { useOgHudson } from './Provider';
import type { OGConfig } from '../types.js';

export function OgInspector() {
  const { config, configJson, setConfig } = useOgHudson();
  const [text, setText] = useState(configJson);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setText(configJson);
    setError(null);
  }, [configJson]);

  const apply = () => {
    try {
      const next = JSON.parse(text) as OGConfig;
      setConfig(next);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="flex h-full flex-col p-3 text-xs text-slate-400">
      <div className="mb-2">
        <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-slate-500">Config JSON</div>
        <div className="mt-1 text-[11px] text-slate-600">Output port: <span className="font-mono text-slate-400">config-json</span></div>
      </div>
      <textarea
        value={text}
        onChange={event => setText(event.target.value)}
        spellCheck={false}
        className="min-h-0 flex-1 resize-none rounded-lg border border-slate-800 bg-slate-950/80 p-3 font-mono text-[11px] leading-5 text-slate-300 outline-none focus:border-cyan-500/60"
      />
      {error && <div className="mt-2 rounded border border-red-500/30 bg-red-500/10 p-2 text-[11px] text-red-300">{error}</div>}
      <button onClick={apply} className="mt-3 rounded-lg bg-cyan-500 px-3 py-2 text-xs font-medium text-slate-950 transition hover:bg-cyan-400">
        Apply JSON
      </button>
    </div>
  );
}
