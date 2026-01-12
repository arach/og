import { createServer } from 'node:http'
import { readdir, readFile, stat } from 'node:fs/promises'
import { join, extname, basename } from 'node:path'

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
}

interface ImageInfo {
  path: string
  name: string
  size: number
  url: string
}

async function findOGImages(dir: string): Promise<ImageInfo[]> {
  const images: ImageInfo[] = []

  async function scan(currentDir: string, depth = 0): Promise<void> {
    if (depth > 3) return // Don't go too deep

    try {
      const entries = await readdir(currentDir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = join(currentDir, entry.name)

        if (entry.isDirectory()) {
          // Skip node_modules and hidden dirs
          if (entry.name.startsWith('.') || entry.name === 'node_modules') continue
          await scan(fullPath, depth + 1)
        } else if (entry.isFile()) {
          const ext = extname(entry.name).toLowerCase()
          if (['.png', '.jpg', '.jpeg'].includes(ext)) {
            // Check if it looks like an OG image (has 'og' in name or in common locations)
            const name = entry.name.toLowerCase()
            const isOG = name.includes('og') ||
                        currentDir.includes('public') ||
                        currentDir.includes('static') ||
                        currentDir.includes('assets')

            if (isOG) {
              const stats = await stat(fullPath)
              images.push({
                path: fullPath,
                name: entry.name,
                size: stats.size,
                url: `/image?path=${encodeURIComponent(fullPath)}`
              })
            }
          }
        }
      }
    } catch {
      // Ignore permission errors etc
    }
  }

  await scan(dir)
  return images
}

function generateHTML(images: ImageInfo[], dir: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OG Image Viewer</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', system-ui, sans-serif;
      background: #0a0a0a;
      color: #fafafa;
      min-height: 100vh;
      padding: 40px;
    }
    .header {
      max-width: 1200px;
      margin: 0 auto 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header h1 {
      font-size: 1.5rem;
      font-weight: 600;
    }
    .header .path {
      color: #666;
      font-size: 0.85rem;
      font-family: monospace;
    }
    .header .count {
      background: #222;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.85rem;
      color: #888;
    }
    .grid {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      gap: 32px;
    }
    .card {
      background: #111;
      border: 1px solid #222;
      border-radius: 12px;
      overflow: hidden;
    }
    .card-image {
      position: relative;
      background: #0a0a0a;
      border-bottom: 1px solid #222;
    }
    .card-image img {
      width: 100%;
      height: auto;
      display: block;
    }
    .card-info {
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .card-meta {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .card-name {
      font-weight: 500;
      font-family: monospace;
      font-size: 0.95rem;
    }
    .card-details {
      color: #666;
      font-size: 0.8rem;
      display: flex;
      gap: 12px;
    }
    .card-actions {
      display: flex;
      gap: 8px;
    }
    .btn {
      background: #222;
      border: 1px solid #333;
      color: #fff;
      padding: 8px 14px;
      border-radius: 6px;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn:hover {
      background: #333;
      border-color: #444;
    }
    .empty {
      text-align: center;
      padding: 80px 40px;
      color: #666;
    }
    .empty h2 {
      font-size: 1.25rem;
      margin-bottom: 12px;
      color: #888;
    }
    .empty p {
      font-size: 0.9rem;
      line-height: 1.6;
    }
    .empty code {
      background: #222;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.85rem;
    }
    .social-preview {
      margin-top: 16px;
      padding: 16px 20px;
      border-top: 1px solid #222;
      background: #0d0d0d;
    }
    .social-preview h4 {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #555;
      margin-bottom: 12px;
    }
    .social-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }
    .social-card {
      background: #161616;
      border: 1px solid #222;
      border-radius: 8px;
      overflow: hidden;
    }
    .social-card-label {
      padding: 8px 10px;
      font-size: 0.65rem;
      color: #666;
      border-bottom: 1px solid #222;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .social-card img {
      width: 100%;
      display: block;
    }
    @media (max-width: 900px) {
      .social-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>OG Image Viewer</h1>
      <div class="path">${dir}</div>
    </div>
    <div class="count">${images.length} image${images.length !== 1 ? 's' : ''} found</div>
  </div>

  ${images.length === 0 ? `
  <div class="empty">
    <h2>No OG images found</h2>
    <p>
      Looking for PNG/JPG files with "og" in the name, or in<br>
      <code>public/</code>, <code>static/</code>, or <code>assets/</code> directories.<br><br>
      Generate one with: <code>og config.json</code>
    </p>
  </div>
  ` : `
  <div class="grid">
    ${images.map(img => `
    <div class="card">
      <div class="card-image">
        <img src="${img.url}" alt="${img.name}">
      </div>
      <div class="card-info">
        <div class="card-meta">
          <div class="card-name">${img.name}</div>
          <div class="card-details">
            <span>${Math.round(img.size / 1024)}KB</span>
            <span>${img.path.replace(dir, '.')}</span>
          </div>
        </div>
        <div class="card-actions">
          <button class="btn" onclick="copyPath('${img.path}')">Copy Path</button>
        </div>
      </div>
      <div class="social-preview">
        <h4>Social Preview</h4>
        <div class="social-grid">
          <div class="social-card">
            <div class="social-card-label">Twitter / X</div>
            <img src="${img.url}" alt="Twitter preview">
          </div>
          <div class="social-card">
            <div class="social-card-label">LinkedIn</div>
            <img src="${img.url}" alt="LinkedIn preview">
          </div>
          <div class="social-card">
            <div class="social-card-label">Discord</div>
            <img src="${img.url}" alt="Discord preview">
          </div>
        </div>
      </div>
    </div>
    `).join('')}
  </div>
  `}

  <script>
    function copyPath(path) {
      navigator.clipboard.writeText(path);
    }
  </script>
</body>
</html>`
}

export async function startViewer(dir: string, port = 3333): Promise<void> {
  const images = await findOGImages(dir)

  const server = createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://localhost:${port}`)

    if (url.pathname === '/image') {
      const imagePath = url.searchParams.get('path')
      if (imagePath) {
        try {
          const data = await readFile(imagePath)
          const ext = extname(imagePath).toLowerCase()
          res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' })
          res.end(data)
          return
        } catch {
          res.writeHead(404)
          res.end('Not found')
          return
        }
      }
    }

    // Serve the main page
    const html = generateHTML(images, dir)
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(html)
  })

  server.listen(port, () => {
    console.log(`\n  OG Viewer running at http://localhost:${port}`)
    console.log(`  Scanning: ${dir}`)
    console.log(`  Found ${images.length} image${images.length !== 1 ? 's' : ''}\n`)
    console.log(`  Press Ctrl+C to stop\n`)
  })

  // Try to open in browser
  const open = await import('node:child_process').then(m => m.exec)
  const cmd = process.platform === 'darwin' ? 'open' :
              process.platform === 'win32' ? 'start' : 'xdg-open'
  open(`${cmd} http://localhost:${port}`)
}
