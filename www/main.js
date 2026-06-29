import { loadTemplateCatalog } from './catalog.js'

// Dark Mode Logic
const themeToggleBtn = document.getElementById('theme-toggle');
const root = document.documentElement;
const iconSun = document.querySelector('.icon-sun');
const iconMoon = document.querySelector('.icon-moon');

const savedTheme = localStorage.getItem('theme');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
const currentTheme = savedTheme || systemTheme;

function setTheme(theme) {
  root.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  updateIcons(theme);
}

function updateIcons(theme) {
  if (theme === 'dark') {
    iconSun.style.display = 'block';
    iconMoon.style.display = 'none';
  } else {
    iconSun.style.display = 'none';
    iconMoon.style.display = 'block';
  }
}

setTheme(currentTheme);

themeToggleBtn.addEventListener('click', () => {
  const isDark = root.getAttribute('data-theme') === 'dark';
  setTheme(isDark ? 'light' : 'dark');
});

function renderTemplateCards(catalog) {
  const grid = document.getElementById('templates-grid');
  if (!grid) return;

  grid.innerHTML = catalog.map((template) => `
    <a class="template-card" href="/viewer.html#${template.id}">
      <div class="card-preview">
        <div class="og-preview-frame">
          <img src="${template.png}" alt="${template.id} template" width="1200" height="630" loading="lazy" decoding="async">
        </div>
      </div>
      <div class="template-info">
        <div class="template-header">
          <div class="template-name">${template.id}</div>
          <button class="copy-template-id" data-id="${template.id}" title="Copy ID" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
          </button>
        </div>
        <div class="template-desc">${template.description}</div>
      </div>
    </a>
  `).join('');

}

function setupCopyButtons() {
  const installBtn = document.querySelector('.install-copy');

  if (installBtn) {
    installBtn.addEventListener('click', () => {
      const installCode = document.getElementById('install-cmd').textContent;
      handleCopy(installBtn, installCode);
    });
  }

  document.querySelectorAll('.copy-template-id').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      handleCopy(btn, id);
    });
  });
}

async function handleCopy(btn, text) {
  try {
    await navigator.clipboard.writeText(text);

    const originalIcon = btn.innerHTML;
    btn.classList.add('copied');
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" class="text-green-500"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

    setTimeout(() => {
      btn.innerHTML = originalIcon;
      btn.classList.remove('copied');
    }, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
}

async function init() {
  const catalog = await loadTemplateCatalog();
  renderTemplateCards(catalog);
  setupCopyButtons();
}

init();