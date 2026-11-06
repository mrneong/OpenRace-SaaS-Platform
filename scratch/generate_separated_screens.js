const fs = require('fs');

// Helper to wrap a screen with standard header banner
function makeStandardHeader(moduleName, screenTitle, subtext, badgesHtml = '', actionsHtml = '') {
  return `
    <div class="bg-gradient-to-r from-slate-50 to-orange-50/30 rounded-3xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3 mb-5">
      <div class="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <span class="hover:text-slate-800 transition cursor-pointer" onclick="switchTab('dashboard')">Trang chủ</span>
        <span class="text-slate-300">›</span>
        <span class="text-slate-700">${moduleName}</span>
        <span class="text-slate-300">›</span>
        <span class="text-[#FF5B26] font-bold">${screenTitle}</span>
      </div>
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
        <div>
          <div class="flex items-center gap-2.5 flex-wrap">
            <h2 class="text-xl md:text-2xl font-black text-slate-900 tracking-tight">${screenTitle}</h2>
            ${badgesHtml}
          </div>
          <p class="text-xs text-slate-500 mt-1">${subtext}</p>
        </div>
        ${actionsHtml ? `<div class="shrink-0 flex items-center gap-2">${actionsHtml}</div>` : ''}
      </div>
    </div>
  `;
}

console.log('makeStandardHeader helper created.');

