import type { TemplateFunction } from '../types.js'

/**
 * Branded template - full featured with grid overlay, gradient glows, and tag
 */
export const branded: TemplateFunction = (ctx) => `
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
    .glow {
      position: absolute;
      inset: -10% -10% auto -10%;
      height: 520px;
      background:
        radial-gradient(circle at 15% 35%, ${ctx.accent}40, transparent 58%),
        radial-gradient(circle at 70% 0%, ${ctx.accentSecondary}38, transparent 65%),
        radial-gradient(circle at 85% 40%, ${ctx.accent}30, transparent 55%);
      pointer-events: none;
    }
    .grid {
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(${ctx.textColor}08 1px, transparent 1px),
        linear-gradient(90deg, ${ctx.textColor}08 1px, transparent 1px);
      background-size: 40px 40px;
      opacity: 0.5;
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
    .tag {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      border-radius: 999px;
      border: 1px solid ${ctx.textColor}20;
      background: ${ctx.background}cc;
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.18em;
      color: ${ctx.accentSecondary};
      margin-bottom: 28px;
      width: fit-content;
    }
    .title {
      font-family: '${ctx.fonts[0]}', serif;
      font-size: 72px;
      font-weight: 600;
      line-height: 1.1;
      max-width: 900px;
      margin-bottom: 20px;
    }
    .subtitle {
      font-size: 28px;
      color: ${ctx.textColor}99;
      max-width: 700px;
      line-height: 1.4;
    }
    .brand {
      position: absolute;
      bottom: 72px;
      left: 80px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-dot {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: ${ctx.accent};
      box-shadow: 0 0 0 6px ${ctx.accent}33;
    }
    .brand-name {
      font-family: '${ctx.fonts[0]}', serif;
      font-size: 24px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="glow"></div>
  <div class="grid"></div>
  <div class="content">
    ${ctx.tag ? `<div class="tag">${ctx.tag}</div>` : ''}
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
