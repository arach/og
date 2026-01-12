// Dark Mode Logic
const themeToggleBtn = document.getElementById('theme-toggle');
const root = document.documentElement;
const iconSun = document.querySelector('.icon-sun');
const iconMoon = document.querySelector('.icon-moon');

// Check system preference or local storage
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

// Initialize
setTheme(currentTheme);

themeToggleBtn.addEventListener('click', () => {
  const isDark = root.getAttribute('data-theme') === 'dark';
  setTheme(isDark ? 'light' : 'dark');
});


// Copy Functionality
function setupCopyButtons() {
  // Install Command Copy
  const installBtn = document.querySelector('.install-copy');
  
  if (installBtn) {
    installBtn.addEventListener('click', () => {
      const installCode = document.getElementById('install-cmd').textContent;
      handleCopy(installBtn, installCode);
    });
  }

  // Template ID Copy
  document.querySelectorAll('.copy-template-id').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      handleCopy(btn, id);
    });
  });
}

// Package Manager Tabs
function setupTabs() {
  const tabs = document.querySelectorAll('.install-tab');
  const codeEl = document.getElementById('install-cmd');
  
  const commands = {
    pnpm: 'pnpm add @arach/og',
    npm: 'npm install @arach/og',
    yarn: 'yarn add @arach/og',
    bun: 'bun add @arach/og'
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Update Active State
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Update Command
      const pm = tab.getAttribute('data-pm');
      codeEl.textContent = commands[pm];
    });
  });
}

async function handleCopy(btn, text) {
  try {
    await navigator.clipboard.writeText(text);
    
    // Visual feedback
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

setupCopyButtons();
setupTabs();
