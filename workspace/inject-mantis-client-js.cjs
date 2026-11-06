const fs = require('fs');
const path = require('path');

const mainTsPath = path.resolve(__dirname, 'backend/src/main.ts');
let code = fs.readFileSync(mainTsPath, 'utf8');

const mantisClientJs = `
    // ==========================================
    // [DUAL-THEME] MANTIS MATERIAL UI & SWITCHER
    // ==========================================

    function setAppTheme(theme) {
      if (theme === 'mantis') {
        document.body.setAttribute('data-theme', 'mantis');
        document.body.classList.add('theme-mantis');
        
        // Hide Sport layout elements
        document.getElementById('slim-rail')?.classList.add('hidden');
        document.getElementById('openrace-header')?.classList.add('hidden');
        document.getElementById('sub-nav-bar')?.classList.add('hidden');
        document.getElementById('openrace-dashboard-view')?.classList.add('hidden');
        
        // Show Mantis layout elements
        document.getElementById('mantis-sidebar')?.classList.remove('hidden');
        document.getElementById('mantis-header')?.classList.remove('hidden');
        document.getElementById('mantis-dashboard-view')?.classList.remove('hidden');
        
        localStorage.setItem('openrace_theme', 'mantis');
        showToast('✓ Đã kích hoạt Giao diện Mantis Material UI');
      } else {
        document.body.setAttribute('data-theme', 'sport');
        document.body.classList.remove('theme-mantis');
        
        // Show Sport layout elements
        document.getElementById('slim-rail')?.classList.remove('hidden');
        document.getElementById('openrace-header')?.classList.remove('hidden');
        document.getElementById('sub-nav-bar')?.classList.remove('hidden');
        document.getElementById('openrace-dashboard-view')?.classList.remove('hidden');
        
        // Hide Mantis layout elements
        document.getElementById('mantis-sidebar')?.classList.add('hidden');
        document.getElementById('mantis-header')?.classList.add('hidden');
        document.getElementById('mantis-dashboard-view')?.classList.add('hidden');
        
        localStorage.setItem('openrace_theme', 'sport');
        showToast('✓ Đã quay lại Giao diện OpenRace Thể Thao Cam');
      }
    }

    function toggleMantisSidebar() {
      const sidebar = document.getElementById('mantis-sidebar');
      if (sidebar) {
        sidebar.classList.toggle('hidden');
      }
    }

    function setMantisSubView(view) {
      if (view === 'default') {
        setAppTheme('sport');
      } else if (view === 'analytics') {
        const mv = document.getElementById('mantis-dashboard-view');
        if (mv) mv.scrollIntoView({ behavior: 'smooth' });
      }
    }

    function initAppTheme() {
      const savedTheme = localStorage.getItem('openrace_theme');
      if (savedTheme === 'mantis') {
        setAppTheme('mantis');
      } else {
        setAppTheme('sport');
      }
    }

    // Call initAppTheme once DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAppTheme);
    } else {
      setTimeout(initAppTheme, 50);
    }
`;

if (!code.includes('function setAppTheme(')) {
  code = code.replace(
    'setTimeout(renderContributionsHeatmap, 500);',
    `setTimeout(renderContributionsHeatmap, 500);\n${mantisClientJs}`
  );
  fs.writeFileSync(mainTsPath, code, 'utf8');
  console.log('✓ Successfully injected function setAppTheme into main.ts!');
} else {
  console.log('Function setAppTheme already exists.');
}

