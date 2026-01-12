import type { TemplateFunction } from '../types.js'

/**
 * Editor Dark template - dark theme for product/editor pages
 */
export const editorDark: TemplateFunction = (ctx) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${ctx.fonts.map(f => f.replace(/ /g, '+')).join('&family=')}&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      width: ${ctx.width}px;
      height: ${ctx.height}px;
      background: #101518;
      font-family: '${ctx.fonts[1] || ctx.fonts[0]}', system-ui, sans-serif;
      color: #f0f4f7;
      position: relative;
      overflow: hidden;
    }
    .glow {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(circle at 20% 80%, ${ctx.accent}25, transparent 50%),
        radial-gradient(circle at 80% 20%, ${ctx.accentSecondary}20, transparent 50%);
      pointer-events: none;
    }
    .grid {
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
      background-size: 24px 24px;
    }
    .content {
      position: relative;
      z-index: 1;
      height: 100%;
      padding: 72px 80px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .editor-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      border-radius: 6px;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.12);
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      color: ${ctx.accent};
      margin-bottom: 28px;
      width: fit-content;
    }
    .title {
      font-family: '${ctx.fonts[0]}', serif;
      font-size: 64px;
      font-weight: 600;
      line-height: 1.15;
      max-width: 800px;
      margin-bottom: 20px;
    }
    .subtitle {
      font-size: 26px;
      color: rgba(240, 244, 247, 0.6);
      max-width: 600px;
      line-height: 1.5;
    }
    .window-controls {
      position: absolute;
      top: 40px;
      right: 60px;
      display: flex;
      gap: 8px;
    }
    .window-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: rgba(255,255,255,0.15);
    }
    .brand {
      position: absolute;
      bottom: 60px;
      left: 80px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand-dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: ${ctx.accent};
      box-shadow: 0 0 20px ${ctx.accent}60;
    }
    .brand-name {
      font-family: '${ctx.fonts[0]}', serif;
      font-size: 22px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="glow"></div>
  <div class="grid"></div>
  <div class="window-controls">
    <span class="window-dot"></span>
    <span class="window-dot"></span>
    <span class="window-dot"></span>
  </div>
  <div class="content">
    <div class="editor-badge">${ctx.tag || 'editor'}</div>
    <h1 class="title">${ctx.title}</h1>
    ${ctx.subtitle ? `<p class="subtitle">${ctx.subtitle}</p>` : ''}
  </div>
  <div class="brand">
    <span class="brand-dot"></span>
    <span class="brand-name">${ctx.title.split('|')[0]?.trim() || ''}</span>
  </div>
</body>
</html>
`
