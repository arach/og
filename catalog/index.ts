import type { HudsonApp, HudsonWorkspace, WorkspaceAppConfig } from 'hudsonkit';
import { ogApp } from '../src/hudson';

export interface OgHudsonBundle {
  id: 'og';
  app: HudsonApp;
  apps: HudsonApp[];
  workspaceEntry: WorkspaceAppConfig;
  workspaces: HudsonWorkspace[];
  intents: NonNullable<HudsonApp['intents']>;
  ports: NonNullable<HudsonApp['ports']>;
  toolsets: Record<string, never>;
  assets: {
    paths: string[];
    note: string;
  };
  note: string;
}

export const ogWorkspaceEntry: WorkspaceAppConfig = {
  app: ogApp,
  canvasMode: 'windowed',
  defaultWindowBounds: { x: 120, y: -260, w: 1040, h: 720 },
};

export const ogWorkspace: HudsonWorkspace = {
  id: 'og-studio',
  name: 'OG Studio',
  description: 'Compose, inspect, and export declarative Open Graph image configs.',
  mode: 'canvas',
  apps: [ogWorkspaceEntry],
  defaultFocusedAppId: ogApp.id,
  defaultActivatedAppIds: [ogApp.id],
};

export const ogBundle: OgHudsonBundle = {
  id: 'og',
  app: ogApp,
  apps: [ogApp],
  workspaceEntry: ogWorkspaceEntry,
  workspaces: [ogWorkspace],
  intents: ogApp.intents ?? [],
  ports: ogApp.ports ?? {},
  toolsets: {},
  assets: {
    paths: ['src/templates', 'examples', 'example.json'],
    note: 'Built-in templates are source assets; generated images are user/project outputs and are not bundled by default.',
  },
  note:
    'OG slots: Content edits declarative config and previews built-in templates, LeftPanel switches templates and output presets, Inspector edits raw JSON, Terminal summarizes generation/ports. Intents cover template switches, config copy/download, HTML copy, and reset. Ports expose config-json and preview-html, with config-json accepted as an input. No AI toolset is bundled yet; PNG generation runs via og-render in the @arach/og CLI.',
};

// Preframe-compatible app aliases for hosts that read `catalogApp` first.
export const catalogApp = ogApp;
export { ogApp };
export default ogApp;
