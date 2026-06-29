import type { TemplateFunction } from '../types.js'
import { templateFonts } from '../template-fonts.js'

/**
 * Minimal template - clean, typography-focused
 */
export const minimal: TemplateFunction = (ctx) => {
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
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .content {
      max-width: 900px;
      padding: 60px;
    }
    .title {
      font-family: ${fonts.display};
      font-size: 66px;
      font-weight: 500;
      line-height: normal;
      margin: 0 0 24px;
      letter-spacing: -0.03em;
      padding-bottom: 0.22em;
    }
    .subtitle {
      font-family: ${fonts.body};
      font-size: 28px;
      font-weight: 360;
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
}