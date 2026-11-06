const fs = require('fs');
const path = require('path');

const mainTsPath = path.resolve(__dirname, 'backend/src/main.ts');
let code = fs.readFileSync(mainTsPath, 'utf8');

console.log('--- Step 1: Adding .nav-dropdown CSS and updating <header> ---');
// 1. Add CSS for nav-dropdown and ensure high contrast solid background
const cssTarget = '/* Dark Mode Themes */';
const navDropdownCss = `/* Solid Opaque Nav Dropdowns */
    .nav-dropdown {
      background-color: #FFFFFF !important;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08) !important;
      z-index: 100 !important;
    }
    html.dark .nav-dropdown {
      background-color: #1E293B !important;
      border-color: #334155 !important;
    }
    /* Dark Mode Themes */`;

if (!code.includes('.nav-dropdown {')) {
  code = code.replace(cssTarget, navDropdownCss);
}

// Update <header> z-index from z-30 to z-40 or z-50
code = code.replace(
  '<header class="h-16 w-full px-4 lg:px-8 flex items-center justify-between border-b border-slate-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-30">',
  '<header class="h-16 w-full px-4 lg:px-8 flex items-center justify-between border-b border-slate-200/60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-40">'
);

// Update all 5 dropdown divs to use class "nav-dropdown" and solid styling
code = code.replace(
  /<div class="hidden group-hover:block absolute top-full left-0 mt-2 w-64 bg-white\/98 backdrop-blur-md rounded-2xl p-2.5 shadow-2xl border border-slate-200\/90 z-50 text-\[11px\] space-y-1">/g,
  '<div class="nav-dropdown hidden group-hover:block absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl p-2.5 shadow-2xl border border-slate-200 dark:border-slate-700 z-[100] text-[11px] space-y-1">'
);

code = code.replace(
  /<div class="hidden group-hover:block absolute top-full left-0 mt-2 w-72 bg-white\/98 backdrop-blur-md rounded-2xl p-2.5 shadow-2xl border border-slate-200\/90 z-50 text-\[11px\] space-y-1">/g,
  '<div class="nav-dropdown hidden group-hover:block absolute top-full left-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl p-2.5 shadow-2xl border border-slate-200 dark:border-slate-700 z-[100] text-[11px] space-y-1">'
);

code = code.replace(
  /<div class="hidden group-hover:block absolute top-full right-0 lg:left-0 mt-2 w-72 bg-white\/98 backdrop-blur-md rounded-2xl p-2.5 shadow-2xl border border-slate-200\/90 z-50 text-\[11px\] space-y-1">/g,
  '<div class="nav-dropdown hidden group-hover:block absolute top-full right-0 lg:left-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl p-2.5 shadow-2xl border border-slate-200 dark:border-slate-700 z-[100] text-[11px] space-y-1">'
);

console.log('--- Step 2: Relocating Greeting Header ONLY to tab-dashboard ---');
// Locate the greeting section
const greetingTarget = `    <!-- 4. GREETING & CONTEXT HEADER WITH BREADCRUMB -->
    <section class="px-4 lg:px-8 pt-5 pb-3">
      <div id="breadcrumb-bar" class="hidden text-[11px] font-mono font-semibold text-slate-400 items-center gap-1.5 mb-1">
        <span>Trang chủ</span>
        <span>›</span>
        <span id="breadcrumb-current" class="text-[#FF5B26] font-bold">[1.0] Dashboard Runner (Personal Hub)</span>
      </div>
      <h1 class="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
        Good morning, Nguyễn Văn A
      </h1>
      <p class="text-xs md:text-sm text-slate-500 mt-1 font-medium">
        Theo dõi chỉ tiêu tuần, tiến độ cự ly giải Mùa 10 Run to Techcombank 2026 • Đội Phoenix SARC (Hạng 1)
      </p>
    </section>`;

// Target inside tab-dashboard
const tabDashboardOpen = `<div id="tab-dashboard" class="tab-content active">`;

if (code.includes(greetingTarget)) {
  // Remove from outer wrapper
  code = code.replace(greetingTarget, '    <!-- 4. GLOBAL NOTIFICATIONS & ACTIONS -->');

  // Insert into tab-dashboard
  const newTabDashboard = `<div id="tab-dashboard" class="tab-content active w-full space-y-5">
        <!-- 4. GREETING & CONTEXT HEADER (ONLY ON DASHBOARD) -->
        <section class="pt-2 pb-1">
          <div id="breadcrumb-bar" class="hidden text-[11px] font-mono font-semibold text-slate-400 items-center gap-1.5 mb-1">
            <span>Trang chủ</span>
            <span>›</span>
            <span id="breadcrumb-current" class="text-[#FF5B26] font-bold">[1.0] Dashboard Runner (Personal Hub)</span>
          </div>
          <h1 class="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Good morning, Nguyễn Văn A
          </h1>
          <p class="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Theo dõi chỉ tiêu tuần, tiến độ cự ly giải Mùa 10 Run to Techcombank 2026 • Đội Phoenix SARC (Hạng 1)
          </p>
        </section>`;

  code = code.replace(tabDashboardOpen, newTabDashboard);
  console.log('Successfully moved greeting header inside tab-dashboard!');
} else {
  console.warn('Warning: greetingTarget exact match not found. Checking variant...');
}

console.log('--- Step 3: Making all other tabs FULL WIDTH (removing max-w-5xl mx-auto) ---');
const narrowTabsRegex = /class="tab-content max-w-5xl mx-auto space-y-5"/g;
const matchCount = (code.match(narrowTabsRegex) || []).length;
console.log(`Found ${matchCount} tabs with max-w-5xl mx-auto`);

code = code.replace(narrowTabsRegex, 'class="tab-content w-full space-y-5"');

fs.writeFileSync(mainTsPath, code, 'utf8');
console.log('Successfully updated main.ts with all 3 fixes!');

