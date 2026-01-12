import type { TemplateFunction } from '../types.js'

/**
 * Docs template - clean layout for documentation pages
 */
export const docs: TemplateFunction = (ctx) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${ctx.fonts.map(f => f.replace(/ /g, '+')).join('&family=')}&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      width: ${ctx.width}px;
      height: ${ctx.height}px;
      background: ${ctx.background};
      font-family: '${ctx.fonts[1] || ctx.fonts[0]}', system-ui, sans-serif;
      color: ${ctx.textColor};
      position: relative;
      overflow: hidden;
    }
    .accent-bar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 6px;
      background: linear-gradient(90deg, ${ctx.accent}, ${ctx.accentSecondary});
    }
    .grid {
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(${ctx.textColor}06 1px, transparent 1px),
        linear-gradient(90deg, ${ctx.textColor}06 1px, transparent 1px);
      background-size: 32px 32px;
    }
    .content {
      position: relative;
      z-index: 1;
      height: 100%;
      padding: 80px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 8px;
      background: ${ctx.accent}15;
      border: 1px solid ${ctx.accent}30;
      font-size: 14px;
      font-weight: 600;
      color: ${ctx.accent};
      margin-bottom: 24px;
      width: fit-content;
    }
    .title {
      font-family: '${ctx.fonts[0]}', serif;
      font-size: 64px;
      font-weight: 600;
      line-height: 1.15;
      max-width: 850px;
      margin-bottom: 20px;
    }
    .subtitle {
      font-size: 26px;
      color: ${ctx.textColor}80;
      max-width: 650px;
      line-height: 1.5;
    }
    .footer {
      position: absolute;
      bottom: 60px;
      left: 80px;
      right: 80px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: ${ctx.accent};
    }
    .brand-name {
      font-family: '${ctx.fonts[0]}', serif;
      font-size: 20px;
      font-weight: 600;
    }
    .docs-label {
      font-size: 16px;
      color: ${ctx.textColor}60;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="accent-bar"></div>
  <div class="grid"></div>
  <div class="content">
    ${ctx.tag ? `<div class="badge">${ctx.tag}</div>` : '<div class="badge">Documentation</div>'}
    <h1 class="title">${ctx.title}</h1>
    ${ctx.subtitle ? `<p class="subtitle">${ctx.subtitle}</p>` : ''}
  </div>
  <div class="footer">
    <div class="brand">
      <span class="brand-dot"></span>
      <span class="brand-name">${ctx.title.split('|')[0]?.trim() || 'Docs'}</span>
    </div>
    <span class="docs-label">docs</span>
  </div>
</body>
</html>
`
