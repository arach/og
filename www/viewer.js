import { loadTemplateCatalog } from './catalog.js'
import { createPreviewImage } from './preview.js'

const platforms = ['Twitter / X', 'LinkedIn', 'Discord']

function renderSocialCards(png, title) {
  return platforms.map((platform) => `
    <div class="viewer-social-card">
      <div class="viewer-social-card-header">${platform}</div>
      <img src="${png}" alt="${platform} preview" loading="lazy">
      <div class="viewer-social-card-meta">
        <div class="domain">og.arach.dev</div>
        <div class="title">${title}</div>
      </div>
    </div>
  `).join('')
}

function renderViewer(catalog) {
  const root = document.getElementById('viewer-root')
  if (!root) return

  root.innerHTML = catalog.map((template) => `
    <section id="${template.id}" class="viewer-section">
      <div class="viewer-section-header">
        <span class="viewer-section-name">${template.id}</span>
        <span class="viewer-section-desc">${template.description}</span>
      </div>

      <div class="og-preview-shell">
        <div class="og-preview-frame" data-preview-frame></div>
      </div>

      <div class="viewer-meta">
        <div class="viewer-meta-info">
          <span>1200×630</span>
          <span>Live preview</span>
        </div>
        <button class="viewer-copy-btn" type="button" data-template="${template.id}">Copy config</button>
      </div>

      <div class="viewer-social">
        <h3>Social preview</h3>
        <div class="viewer-social-grid">
          ${renderSocialCards(template.png, template.socialTitle)}
        </div>
      </div>
    </section>
  `).join('')

  root.querySelectorAll('[data-preview-frame]').forEach((frame, index) => {
    frame.appendChild(createPreviewImage(catalog[index]))
  })

  root.querySelectorAll('.viewer-copy-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-template')
      const template = catalog.find((item) => item.id === id)
      if (!template) return

      const text = JSON.stringify(template.config, null, 2)
      await navigator.clipboard.writeText(text)

      const original = btn.textContent
      btn.textContent = 'Copied!'
      setTimeout(() => {
        btn.textContent = original
      }, 1500)
    })
  })

}

async function init() {
  const catalog = await loadTemplateCatalog()
  renderViewer(catalog)
}

init()