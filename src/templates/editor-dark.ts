import type { TemplateFunction } from '../types.js'
import { templateFonts } from '../template-fonts.js'

/**
 * Editor Dark template - dark theme for product/editor pages
 */
export const editorDark: TemplateFunction = (ctx) => {
  const fonts = templateFonts(ctx, { mono: true })

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
      box-sizing: border-box;
      background: #101518;
      font-family: ${fonts.body};
      color: #f0f4f7;
      position: relative;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .glow,
    .grid {
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
      padding: 76px 80px 88px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      overflow: visible;
    }
    .editor-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      border-radius: 6px;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.12);
      font-family: ${fonts.mono};
      font-size: 13px;
      color: ${ctx.accent};
      margin-bottom: 28px;
      width: fit-content;
    }
    .title {
      font-family: ${fonts.display};
      font-size: 60px;
      font-weight: 500;
      line-height: normal;
      max-width: 800px;
      margin: 0;
      padding-bottom: 0.22em;
      letter-spacing: -0.03em;
      overflow: visible;
    }
    .subtitle {
      font-family: ${fonts.body};
      font-size: 26px;
      font-weight: 400;
      color: rgba(240, 244, 247, 0.6);
      max-width: 600px;
      line-height: 1.5;
      margin-top: 28px;
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
      font-family: ${fonts.display};
      font-size: 22px;
      font-weight: 500;
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
}