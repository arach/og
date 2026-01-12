import type { TemplateFunction } from '../types.js'

/**
 * Branded template - full featured with grid overlay, corner crosses, and refined typography
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
    .grid {
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(${ctx.textColor}06 1px, transparent 1px),
        linear-gradient(90deg, ${ctx.textColor}06 1px, transparent 1px);
      background-size: 60px 60px;
    }
    .grid-small {
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(${ctx.textColor}03 1px, transparent 1px),
        linear-gradient(90deg, ${ctx.textColor}03 1px, transparent 1px);
      background-size: 20px 20px;
    }
    .corner-cross {
      position: absolute;
      stroke: ${ctx.accent};
      stroke-width: 1;
      stroke-dasharray: 6 4;
      opacity: 0.7;
    }
    .corner-tl {
      top: 0;
      left: 0;
    }
    .corner-br {
      bottom: 0;
      right: 0;
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
    .tag {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 6px;
      border: 1px solid ${ctx.accent}30;
      background: ${ctx.accent}10;
      font-family: '${ctx.fonts[1] || ctx.fonts[0]}', system-ui, sans-serif;
      font-size: 13px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: ${ctx.accent};
      margin-bottom: 32px;
      width: fit-content;
    }
    .title {
      font-family: '${ctx.fonts[0]}', serif;
      font-size: 80px;
      font-weight: 400;
      font-style: italic;
      line-height: 1.05;
      max-width: 900px;
      margin-bottom: 24px;
      letter-spacing: -0.02em;
    }
    .subtitle {
      font-family: '${ctx.fonts[1] || ctx.fonts[0]}', system-ui, sans-serif;
      font-size: 26px;
      font-weight: 400;
      color: ${ctx.textColor}80;
      max-width: 650px;
      line-height: 1.5;
    }
    .brand {
      position: absolute;
      bottom: 80px;
      left: 80px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: ${ctx.accent};
    }
    .brand-name {
      font-family: '${ctx.fonts[1] || ctx.fonts[0]}', system-ui, sans-serif;
      font-size: 18px;
      font-weight: 500;
      color: ${ctx.textColor}90;
    }
    .bottom-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 6px;
      background: linear-gradient(90deg, ${ctx.accent}, ${ctx.accentSecondary || ctx.accent}80);
      opacity: 0.6;
    }
  </style>
</head>
<body>
  <div class="grid"></div>
  <div class="grid-small"></div>

  <!-- Corner crosses -->
  <svg class="corner-cross corner-tl" width="200" height="200" viewBox="0 0 200 200">
    <path d="M 20 60 L 140 60" fill="none"/>
    <path d="M 60 20 L 60 140" fill="none"/>
  </svg>
  <svg class="corner-cross corner-br" width="200" height="200" viewBox="0 0 200 200">
    <path d="M 60 140 L 180 140" fill="none"/>
    <path d="M 140 60 L 140 180" fill="none"/>
  </svg>

  <div class="content">
    ${ctx.tag ? `<div class="tag">${ctx.tag}</div>` : ''}
    <h1 class="title">${ctx.title}</h1>
    ${ctx.subtitle ? `<p class="subtitle">${ctx.subtitle}</p>` : ''}
  </div>
  <div class="brand">
    <span class="brand-dot"></span>
    <span class="brand-name">${ctx.title.split('|')[0]?.trim() || ''}</span>
  </div>
  <div class="bottom-bar"></div>
</body>
</html>
`
