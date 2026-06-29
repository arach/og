import type { TemplateFunction } from '../types.js'
import { templateFonts } from '../template-fonts.js'

/**
 * Docs template - clean layout for documentation pages
 */
export const docs: TemplateFunction = (ctx) => {
  const fonts = templateFonts(ctx)

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  ${fonts.head}
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
      font-family: ${fonts.body};
      color: ${ctx.textColor};
      position: relative;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
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
      font-family: ${fonts.body};
      font-size: 14px;
      font-weight: 500;
      color: ${ctx.accent};
      margin-bottom: 24px;
      width: fit-content;
    }
    .title {
      font-family: ${fonts.display};
      font-size: 62px;
      font-weight: 500;
      line-height: normal;
      max-width: 850px;
      margin: 0 0 20px;
      letter-spacing: -0.03em;
      padding-bottom: 0.22em;
    }
    .subtitle {
      font-family: ${fonts.body};
      font-size: 26px;
      font-weight: 400;
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
      font-family: ${fonts.display};
      font-size: 20px;
      font-weight: 500;
    }
    .docs-label {
      font-family: ${fonts.body};
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
}