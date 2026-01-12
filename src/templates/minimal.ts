import type { TemplateFunction } from '../types.js'

/**
 * Minimal template - clean, typography-focused
 */
export const minimal: TemplateFunction = (ctx) => `
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
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .content {
      max-width: 900px;
      padding: 60px;
    }
    .title {
      font-family: '${ctx.fonts[0]}', serif;
      font-size: 68px;
      font-weight: 600;
      line-height: 1.15;
      margin-bottom: 24px;
    }
    .subtitle {
      font-size: 28px;
      color: ${ctx.textColor}70;
      line-height: 1.5;
    }
    .accent-line {
      width: 80px;
      height: 4px;
      background: ${ctx.accent};
      border-radius: 2px;
      margin: 0 auto 32px;
    }
  </style>
</head>
<body>
  <div class="content">
    <div class="accent-line"></div>
    <h1 class="title">${ctx.title}</h1>
    ${ctx.subtitle ? `<p class="subtitle">${ctx.subtitle}</p>` : ''}
  </div>
</body>
</html>
`
