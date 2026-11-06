const fs = require('fs');
const path = require('path');

const mainTsPath = path.resolve(__dirname, 'backend/src/main.ts');
let code = fs.readFileSync(mainTsPath, 'utf8');

console.log('=== Injecting Mantis Sidebar & Dashboard View ===');

// 1. INJECT MANTIS SIDEBAR
const sidebarAnchor = '  <!-- Main Content Wrap -->\n  <div class="flex-1 flex flex-col min-w-0';
const sidebarAnchorCrlf = '  <!-- Main Content Wrap -->\r\n  <div class="flex-1 flex flex-col min-w-0';

const mantisSidebarHtml = `
  <!-- ==================================================== -->
  <!-- MANTIS MATERIAL UI DEDICATED NAVIGATION DRAWER -->
  <!-- ==================================================== -->
  <aside id="mantis-sidebar" class="hidden w-64 bg-white border-r border-[#F0F0F0] flex flex-col justify-between shrink-0 z-40 h-screen sticky top-0 shadow-[2px_0_8px_rgba(0,0,0,0.03)] text-sm">
    <div class="flex flex-col h-full overflow-y-auto no-scrollbar">
      <!-- Mantis Brand Header -->
      <div class="h-16 flex items-center gap-2.5 px-6 border-b border-[#F0F0F0] shrink-0">
        <div class="w-7 h-7 rounded-lg bg-[#1890FF] flex items-center justify-center text-white shadow-xs">
          <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"></polygon>
            <circle cx="12" cy="12" r="3" fill="currentColor"></circle>
          </svg>
        </div>
        <span class="text-lg font-bold tracking-tight text-[#262626]">Mantis</span>
      </div>

      <!-- Navigation Tree -->
      <div class="px-3 py-4 space-y-5 flex-1">
        <!-- Group: Dashboard -->
        <div class="space-y-1">
          <div class="px-3 text-[11px] font-semibold text-[#8C8C8C] uppercase tracking-wider">Dashboard</div>
          <a href="javascript:void(0)" onclick="setMantisSubView('default')" class="flex items-center gap-3 px-3 py-2 rounded-md text-[#595959] hover:bg-[#FAFAFA] hover:text-[#1890FF] transition text-[13px]">
            <svg class="w-4 h-4 text-[#8C8C8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            <span>Default</span>
          </a>
          <a href="javascript:void(0)" onclick="setMantisSubView('analytics')" id="mantis-nav-analytics" class="flex items-center gap-3 px-3 py-2 rounded-l-md mantis-active-nav transition text-[13px]">
            <svg class="w-4 h-4 text-[#1890FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            <span>Analytics</span>
          </a>
          <a href="javascript:void(0)" onclick="switchTab('arena')" class="flex items-center justify-between px-3 py-2 rounded-md text-[#595959] hover:bg-[#FAFAFA] hover:text-[#1890FF] transition text-[13px]">
            <div class="flex items-center gap-3">
              <svg class="w-4 h-4 text-[#8C8C8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
              <span>Components</span>
            </div>
            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E6F7FF] text-[#1890FF] border border-[#91D5FF]/40">new</span>
          </a>
        </div>

        <!-- Group: Widgets -->
        <div class="space-y-1">
          <div class="px-3 text-[11px] font-semibold text-[#8C8C8C] uppercase tracking-wider">Widgets</div>
          <a href="javascript:void(0)" onclick="switchTab('dashboard')" class="flex items-center gap-3 px-3 py-2 rounded-md text-[#595959] hover:bg-[#FAFAFA] hover:text-[#1890FF] transition text-[13px]">
            <svg class="w-4 h-4 text-[#8C8C8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            <span>Statistics</span>
          </a>
          <a href="javascript:void(0)" onclick="switchTab('activities')" class="flex items-center gap-3 px-3 py-2 rounded-md text-[#595959] hover:bg-[#FAFAFA] hover:text-[#1890FF] transition text-[13px]">
            <svg class="w-4 h-4 text-[#8C8C8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z"/></svg>
            <span>Data</span>
          </a>
          <a href="javascript:void(0)" onclick="switchTab('arena')" class="flex items-center gap-3 px-3 py-2 rounded-md text-[#595959] hover:bg-[#FAFAFA] hover:text-[#1890FF] transition text-[13px]">
            <svg class="w-4 h-4 text-[#8C8C8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/></svg>
            <span>Chart</span>
          </a>
        </div>

        <!-- Group: Applications -->
        <div class="space-y-1">
          <div class="px-3 text-[11px] font-semibold text-[#8C8C8C] uppercase tracking-wider">Applications</div>
          <a href="javascript:void(0)" onclick="switchTab('chat')" class="flex items-center gap-3 px-3 py-2 rounded-md text-[#595959] hover:bg-[#FAFAFA] hover:text-[#1890FF] transition text-[13px]">
            <svg class="w-4 h-4 text-[#8C8C8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
            <span>Chat</span>
          </a>
          <a href="javascript:void(0)" onclick="switchTab('governance')" class="flex items-center justify-between px-3 py-2 rounded-md text-[#595959] hover:bg-[#FAFAFA] hover:text-[#1890FF] transition text-[13px]">
            <div class="flex items-center gap-3">
              <svg class="w-4 h-4 text-[#8C8C8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              <span>Calendar</span>
            </div>
            <span class="text-[10px] text-[#BFBFBF]">🔗</span>
          </a>
          <a href="javascript:void(0)" onclick="switchTab('teams')" class="flex items-center gap-3 px-3 py-2 rounded-md text-[#595959] hover:bg-[#FAFAFA] hover:text-[#1890FF] transition text-[13px]">
            <svg class="w-4 h-4 text-[#8C8C8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"/></svg>
            <span>Kanban</span>
          </a>
          <div class="flex items-center justify-between px-3 py-2 rounded-md text-[#595959] hover:bg-[#FAFAFA] cursor-pointer text-[13px]">
            <div class="flex items-center gap-3">
              <svg class="w-4 h-4 text-[#8C8C8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              <span>Customer</span>
            </div>
            <span class="text-[10px] text-[#8C8C8C]">›</span>
          </div>
          <div class="flex items-center justify-between px-3 py-2 rounded-md text-[#595959] hover:bg-[#FAFAFA] cursor-pointer text-[13px]">
            <div class="flex items-center gap-3">
              <svg class="w-4 h-4 text-[#8C8C8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              <span>Invoice</span>
            </div>
            <span class="text-[10px] text-[#8C8C8C]">›</span>
          </div>
          <div class="flex items-center justify-between px-3 py-2 rounded-md text-[#595959] hover:bg-[#FAFAFA] cursor-pointer text-[13px]">
            <div class="flex items-center gap-3">
              <svg class="w-4 h-4 text-[#8C8C8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              <span>Profile</span>
            </div>
            <span class="text-[10px] text-[#8C8C8C]">›</span>
          </div>
          <div class="flex items-center justify-between px-3 py-2 rounded-md text-[#595959] hover:bg-[#FAFAFA] cursor-pointer text-[13px]">
            <div class="flex items-center gap-3">
              <svg class="w-4 h-4 text-[#8C8C8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              <span>E-commerce</span>
            </div>
            <span class="text-[10px] text-[#8C8C8C]">›</span>
          </div>
        </div>

        <!-- Group: Forms & Tables -->
        <div class="space-y-1">
          <div class="px-3 text-[11px] font-semibold text-[#8C8C8C] uppercase tracking-wider">Forms & Tables</div>
          <div class="flex items-center gap-3 px-3 py-2 rounded-md text-[#595959] hover:bg-[#FAFAFA] cursor-pointer text-[13px]">
            <svg class="w-4 h-4 text-[#8C8C8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
            <span>Forms Validation</span>
          </div>
          <div class="flex items-center gap-3 px-3 py-2 rounded-md text-[#595959] hover:bg-[#FAFAFA] cursor-pointer text-[13px]">
            <svg class="w-4 h-4 text-[#8C8C8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            <span>Forms Wizard</span>
          </div>
          <div class="flex items-center justify-between px-3 py-2 rounded-md text-[#595959] hover:bg-[#FAFAFA] cursor-pointer text-[13px]">
            <div class="flex items-center gap-3">
              <svg class="w-4 h-4 text-[#8C8C8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/></svg>
              <span>Layout</span>
            </div>
            <span class="text-[10px] text-[#8C8C8C]">›</span>
          </div>
          <div class="flex items-center justify-between px-3 py-2 rounded-md text-[#595959] hover:bg-[#FAFAFA] cursor-pointer text-[13px]">
            <div class="flex items-center gap-3">
              <svg class="w-4 h-4 text-[#8C8C8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"/></svg>
              <span>Plugins</span>
            </div>
            <span class="text-[10px] text-[#8C8C8C]">›</span>
          </div>
          <div class="flex items-center gap-3 px-3 py-2 rounded-md text-[#595959] hover:bg-[#FAFAFA] cursor-pointer text-[13px]">
            <svg class="w-4 h-4 text-[#8C8C8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
            <span>React Table</span>
          </div>
        </div>
      </div>

      <!-- Bottom User Profile Card -->
      <div class="p-3 border-t border-[#F0F0F0] shrink-0">
        <div class="flex items-center justify-between p-2 rounded-lg hover:bg-[#FAFAFA] transition cursor-pointer" onclick="switchTab('finance')">
          <div class="flex items-center gap-2.5">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Avatar" class="w-9 h-9 rounded-full object-cover border border-[#F0F0F0]">
            <div>
              <div class="text-[13px] font-bold text-[#262626]">JWT User</div>
              <div class="text-[11px] text-[#8C8C8C]">UI/UX Designer</div>
            </div>
          </div>
          <span class="text-xs text-[#8C8C8C]">›</span>
        </div>
      </div>
    </div>
  </aside>
`;

if (!code.includes('id="mantis-sidebar"')) {
  if (code.includes(sidebarAnchor)) {
    code = code.replace(sidebarAnchor, `${mantisSidebarHtml}\n\n${sidebarAnchor}`);
    console.log('✓ Inserted mantis-sidebar using LF anchor');
  } else if (code.includes(sidebarAnchorCrlf)) {
    code = code.replace(sidebarAnchorCrlf, `${mantisSidebarHtml}\r\n\r\n${sidebarAnchorCrlf}`);
    console.log('✓ Inserted mantis-sidebar using CRLF anchor');
  } else {
    // regex fallback
    code = code.replace(/(\s*<!-- Main Content Wrap -->\s*<div class="flex-1 flex flex-col min-w-0)/, `${mantisSidebarHtml}\n$1`);
    console.log('✓ Inserted mantis-sidebar using regex');
  }
}

// 2. INJECT MANTIS DASHBOARD VIEW
const mantisDashboardViewHtml = `
      <!-- ==================================================== -->
      <!-- MANTIS MATERIAL UI ANALYTICS DASHBOARD CANVAS -->
      <!-- ==================================================== -->
      <div id="mantis-dashboard-view" class="hidden space-y-6">
        <!-- 1. Hero Welcome Card -->
        <div class="relative bg-gradient-to-r from-[#1890FF] via-[#2F54EB] to-[#096DD9] rounded-xl p-8 text-white overflow-hidden shadow-xs border border-blue-400/20">
          <div class="relative z-10 max-w-xl space-y-2">
            <h2 class="text-2xl md:text-3xl font-bold tracking-tight text-white">Welcome to Mantis</h2>
            <p class="text-sm text-blue-100/90 leading-relaxed font-normal">
              The purpose of a product update is to add new features, fix bugs or improve the performance of the product.
            </p>
            <div class="pt-3">
              <button onclick="switchTab('arena')" class="px-4 py-2 rounded-md bg-transparent hover:bg-white/10 text-white font-medium text-xs border border-white/80 transition flex items-center gap-2">
                <span>View Full Statistic</span>
              </button>
            </div>
          </div>
          <!-- 3D Blueprint Illustration Decorative -->
          <div class="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 hidden sm:block opacity-95">
            <svg class="w-48 h-36" viewBox="0 0 200 150" fill="none">
              <!-- Blueprint Roll -->
              <rect x="30" y="35" width="120" height="75" rx="6" fill="#40A9FF" stroke="#FFFFFF" stroke-width="2"/>
              <line x1="45" y1="50" x2="135" y2="50" stroke="#FFFFFF" stroke-width="2"/>
              <line x1="45" y1="65" x2="135" y2="65" stroke="#FFFFFF" stroke-width="2"/>
              <line x1="45" y1="80" x2="105" y2="80" stroke="#FFFFFF" stroke-width="2"/>
              <!-- Chart Grid on Blueprint -->
              <line x1="60" y1="40" x2="60" y2="100" stroke="#BAE7FF" stroke-width="1.5" stroke-dasharray="2 2"/>
              <line x1="90" y1="40" x2="90" y2="100" stroke="#BAE7FF" stroke-width="1.5" stroke-dasharray="2 2"/>
              <line x1="120" y1="40" x2="120" y2="100" stroke="#BAE7FF" stroke-width="1.5" stroke-dasharray="2 2"/>
              <!-- Hands holding roll -->
              <circle cx="20" cy="70" r="16" fill="#FADB14" stroke="#D48806" stroke-width="2"/>
              <circle cx="160" cy="70" r="16" fill="#FADB14" stroke="#D48806" stroke-width="2"/>
              <!-- Floating Sparkles -->
              <polygon points="175,25 180,35 170,35" fill="#FFFFFF"/>
              <circle cx="25" cy="30" r="3" fill="#FFFFFF"/>
              <circle cx="170" cy="115" r="2.5" fill="#FFFFFF"/>
            </svg>
          </div>
        </div>

        <!-- 2. Four KPI Metric Cards with Sparklines -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Card 1: Total Users -->
          <div class="mantis-card p-5 bg-white border border-[#F0F0F0] rounded-xl flex flex-col justify-between shadow-xs">
            <div>
              <div class="text-[13px] font-medium text-[#8C8C8C]">Total Users</div>
              <div class="flex items-center justify-between mt-1">
                <span class="text-2xl font-bold text-[#262626]">78,250</span>
                <span class="px-2 py-0.5 rounded text-[11px] font-semibold text-[#1890FF] bg-[#E6F7FF] border border-[#91D5FF]/30 flex items-center gap-0.5">
                  ↗ 70.5%
                </span>
              </div>
            </div>
            <!-- Sparkline: Blue Bar Chart -->
            <div class="pt-4 flex items-end justify-between h-14 gap-1">
              <span class="w-full bg-[#1890FF] rounded-t-xs" style="height: 45%"></span>
              <span class="w-full bg-[#1890FF] rounded-t-xs" style="height: 65%"></span>
              <span class="w-full bg-[#1890FF] rounded-t-xs" style="height: 55%"></span>
              <span class="w-full bg-[#1890FF] rounded-t-xs" style="height: 35%"></span>
              <span class="w-full bg-[#1890FF] rounded-t-xs" style="height: 80%"></span>
              <span class="w-full bg-[#1890FF] rounded-t-xs" style="height: 90%"></span>
              <span class="w-full bg-[#1890FF] rounded-t-xs" style="height: 60%"></span>
              <span class="w-full bg-[#1890FF] rounded-t-xs" style="height: 75%"></span>
              <span class="w-full bg-[#1890FF] rounded-t-xs" style="height: 85%"></span>
              <span class="w-full bg-[#1890FF] rounded-t-xs" style="height: 40%"></span>
              <span class="w-full bg-[#1890FF] rounded-t-xs" style="height: 95%"></span>
              <span class="w-full bg-[#1890FF] rounded-t-xs" style="height: 70%"></span>
            </div>
          </div>

          <!-- Card 2: Total Order -->
          <div class="mantis-card p-5 bg-white border border-[#F0F0F0] rounded-xl flex flex-col justify-between shadow-xs">
            <div>
              <div class="text-[13px] font-medium text-[#8C8C8C]">Total Order</div>
              <div class="flex items-center justify-between mt-1">
                <span class="text-2xl font-bold text-[#262626]">18,800</span>
                <span class="px-2 py-0.5 rounded text-[11px] font-semibold text-[#FAAD14] bg-[#FFFBE6] border border-[#FFE58F]/40 flex items-center gap-0.5">
                  ↘ 27.4%
                </span>
              </div>
            </div>
            <!-- Sparkline: Red Downward Area Gradient -->
            <div class="pt-4 h-14 relative flex items-end">
              <svg class="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="orderGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#FF4D4F" stop-opacity="0.4"/>
                    <stop offset="100%" stop-color="#FF4D4F" stop-opacity="0.0"/>
                  </linearGradient>
                </defs>
                <path d="M 0,5 Q 25,12 40,28 T 75,32 T 100,35 L 100,40 L 0,40 Z" fill="url(#orderGrad)"/>
                <path d="M 0,5 Q 25,12 40,28 T 75,32 T 100,35" fill="none" stroke="#FF4D4F" stroke-width="2.5"/>
              </svg>
            </div>
          </div>

          <!-- Card 3: Total Sales -->
          <div class="mantis-card p-5 bg-white border border-[#F0F0F0] rounded-xl flex flex-col justify-between shadow-xs">
            <div>
              <div class="text-[13px] font-medium text-[#8C8C8C]">Total Sales</div>
              <div class="flex items-center justify-between mt-1">
                <span class="text-2xl font-bold text-[#262626]">$35,078</span>
                <span class="px-2 py-0.5 rounded text-[11px] font-semibold text-[#FAAD14] bg-[#FFFBE6] border border-[#FFE58F]/40 flex items-center gap-0.5">
                  ↗ 27.4%
                </span>
              </div>
            </div>
            <!-- Sparkline: Gold Bar Chart -->
            <div class="pt-4 flex items-end justify-between h-14 gap-1">
              <span class="w-full bg-[#FAAD14] rounded-t-xs" style="height: 60%"></span>
              <span class="w-full bg-[#FAAD14] rounded-t-xs" style="height: 75%"></span>
              <span class="w-full bg-[#FAAD14] rounded-t-xs" style="height: 85%"></span>
              <span class="w-full bg-[#FAAD14] rounded-t-xs" style="height: 50%"></span>
              <span class="w-full bg-[#FAAD14] rounded-t-xs" style="height: 90%"></span>
              <span class="w-full bg-[#FAAD14] rounded-t-xs" style="height: 80%"></span>
              <span class="w-full bg-[#FAAD14] rounded-t-xs" style="height: 65%"></span>
              <span class="w-full bg-[#FAAD14] rounded-t-xs" style="height: 95%"></span>
              <span class="w-full bg-[#FAAD14] rounded-t-xs" style="height: 70%"></span>
              <span class="w-full bg-[#FAAD14] rounded-t-xs" style="height: 85%"></span>
              <span class="w-full bg-[#FAAD14] rounded-t-xs" style="height: 55%"></span>
              <span class="w-full bg-[#FAAD14] rounded-t-xs" style="height: 75%"></span>
            </div>
          </div>

          <!-- Card 4: Total Marketing -->
          <div class="mantis-card p-5 bg-white border border-[#F0F0F0] rounded-xl flex flex-col justify-between shadow-xs">
            <div>
              <div class="text-[13px] font-medium text-[#8C8C8C]">Total Marketing</div>
              <div class="flex items-center justify-between mt-1">
                <span class="text-2xl font-bold text-[#262626]">$1,12,083</span>
                <span class="px-2 py-0.5 rounded text-[11px] font-semibold text-[#1890FF] bg-[#E6F7FF] border border-[#91D5FF]/30 flex items-center gap-0.5">
                  ↗ 70.5%
                </span>
              </div>
            </div>
            <!-- Sparkline: Blue Multi-Peak Spline -->
            <div class="pt-4 h-14 relative flex items-end">
              <svg class="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="marketGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#1890FF" stop-opacity="0.3"/>
                    <stop offset="100%" stop-color="#1890FF" stop-opacity="0.0"/>
                  </linearGradient>
                </defs>
                <path d="M 0,30 Q 15,28 25,10 T 45,32 T 70,18 T 90,28 L 100,15 L 100,40 L 0,40 Z" fill="url(#marketGrad)"/>
                <path d="M 0,30 Q 15,28 25,10 T 45,32 T 70,18 T 90,28 L 100,15" fill="none" stroke="#1890FF" stroke-width="2"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- 3. Main Analytics Grid (Income Overview & Page Views by Page Title) -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left 2/3: Income Overview with Spline Area Chart -->
          <div class="mantis-card lg:col-span-2 p-6 bg-white border border-[#F0F0F0] rounded-xl shadow-xs space-y-5">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 class="text-base font-bold text-[#262626]">Income Overview</h3>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-xs text-[#FF4D4F] font-bold flex items-center gap-0.5">
                    ▼ $1,12,900 (45.67%)
                  </span>
                  <span class="text-xs text-[#8C8C8C]">Compare to : 01 Dec 2021-08 Jan 2022</span>
                </div>
              </div>
              <!-- Controls: Week / Month / By Volume / Download -->
              <div class="flex items-center gap-2">
                <div class="flex items-center bg-[#F0F2F5] p-0.5 rounded-md border border-[#E8E8E8] text-xs font-semibold">
                  <button class="px-2.5 py-1 rounded bg-white text-[#262626] shadow-xs">Week</button>
                  <button class="px-2.5 py-1 rounded text-[#8C8C8C] hover:text-[#262626] transition">Month</button>
                </div>
                <div class="relative">
                  <select class="px-2.5 py-1 bg-white border border-[#D9D9D9] rounded-md text-xs text-[#262626] focus:outline-none focus:border-[#1890FF]">
                    <option>By Volume</option>
                    <option>By Revenue</option>
                  </select>
                </div>
                <button class="p-1.5 bg-white border border-[#D9D9D9] rounded-md text-[#595959] hover:bg-[#FAFAFA] transition" title="Tải xuống báo cáo">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                </button>
              </div>
            </div>

            <!-- SVG Spline Area Chart matching exactly the image -->
            <div class="relative h-64 w-full pt-4">
              <!-- Y Axis labels and horizontal grid lines -->
              <div class="absolute inset-0 flex flex-col justify-between text-[11px] text-[#BFBFBF] pointer-events-none">
                <div class="flex items-center"><span class="w-7 text-right pr-2">100</span><div class="flex-1 border-b border-[#F0F0F0]"></div></div>
                <div class="flex items-center"><span class="w-7 text-right pr-2">80</span><div class="flex-1 border-b border-[#F0F0F0]"></div></div>
                <div class="flex items-center"><span class="w-7 text-right pr-2">60</span><div class="flex-1 border-b border-[#F0F0F0]"></div></div>
                <div class="flex items-center"><span class="w-7 text-right pr-2">40</span><div class="flex-1 border-b border-[#F0F0F0]"></div></div>
                <div class="flex items-center"><span class="w-7 text-right pr-2">20</span><div class="flex-1 border-b border-[#F0F0F0]"></div></div>
              </div>

              <!-- SVG Spline Curve and Gradient Fill -->
              <div class="absolute inset-0 pl-7 pb-6">
                <svg class="w-full h-full overflow-visible" viewBox="0 0 700 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="incomeSplineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#1890FF" stop-opacity="0.25"/>
                      <stop offset="100%" stop-color="#1890FF" stop-opacity="0.01"/>
                    </linearGradient>
                  </defs>
                  <!-- Area Fill -->
                  <polygon points="0,20 116,180 233,90 350,180 466,180 583,60 700,180 700,200 0,200" fill="url(#incomeSplineGrad)"/>
                  <!-- Stroke Line -->
                  <polyline points="0,20 116,180 233,90 350,180 466,180 583,60 700,180" fill="none" stroke="#1890FF" stroke-width="2.5"/>
                  <!-- Dots -->
                  <circle cx="0" cy="20" r="3" fill="#1890FF"/>
                  <circle cx="116" cy="180" r="3" fill="#1890FF"/>
                  <circle cx="233" cy="90" r="3" fill="#1890FF"/>
                  <circle cx="350" cy="180" r="3" fill="#1890FF"/>
                  <circle cx="466" cy="180" r="3" fill="#1890FF"/>
                  <circle cx="583" cy="60" r="3" fill="#1890FF"/>
                  <circle cx="700" cy="180" r="3" fill="#1890FF"/>
                </svg>
              </div>

              <!-- X Axis Days -->
              <div class="absolute bottom-0 left-7 right-0 flex justify-between text-[11px] text-[#8C8C8C] pt-2">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>
          </div>

          <!-- Right 1/3: Page Views by Page Title -->
          <div class="mantis-card p-6 bg-white border border-[#F0F0F0] rounded-xl shadow-xs space-y-4">
            <h3 class="text-base font-bold text-[#262626]">Page Views by Page Title</h3>
            <div class="divide-y divide-[#F0F0F0] text-sm">
              <div class="py-3 flex items-center justify-between">
                <div>
                  <div class="font-semibold text-[#262626]">Admin Home</div>
                  <div class="text-[11px] text-[#8C8C8C] font-mono">/demo/admin/index.html</div>
                </div>
                <div class="text-right">
                  <div class="font-bold text-[#1890FF]">7755</div>
                  <div class="text-[11px] text-[#8C8C8C]">31.74%</div>
                </div>
              </div>

              <div class="py-3 flex items-center justify-between">
                <div>
                  <div class="font-semibold text-[#262626]">Form Elements</div>
                  <div class="text-[11px] text-[#8C8C8C] font-mono">/demo/admin/forms.html</div>
                </div>
                <div class="text-right">
                  <div class="font-bold text-[#1890FF]">5215</div>
                  <div class="text-[11px] text-[#8C8C8C]">28.53%</div>
                </div>
              </div>

              <div class="py-3 flex items-center justify-between">
                <div>
                  <div class="font-semibold text-[#262626]">Utilities</div>
                  <div class="text-[11px] text-[#8C8C8C] font-mono">/demo/admin/util.html</div>
                </div>
                <div class="text-right">
                  <div class="font-bold text-[#1890FF]">4848</div>
                  <div class="text-[11px] text-[#8C8C8C]">25.35%</div>
                </div>
              </div>

              <div class="py-3 flex items-center justify-between">
                <div>
                  <div class="font-semibold text-[#262626]">Form Validation</div>
                  <div class="text-[11px] text-[#8C8C8C] font-mono">/demo/admin/validation.html</div>
                </div>
                <div class="text-right">
                  <div class="font-bold text-[#1890FF]">3275</div>
                  <div class="text-[11px] text-[#8C8C8C]">23.17%</div>
                </div>
              </div>

              <div class="py-3 flex items-center justify-between">
                <div>
                  <div class="font-semibold text-[#262626]">Modals</div>
                  <div class="text-[11px] text-[#8C8C8C] font-mono">/demo/admin/modals.html</div>
                </div>
                <div class="text-right">
                  <div class="font-bold text-[#1890FF]">3003</div>
                  <div class="text-[11px] text-[#8C8C8C]">22.21%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. Bottom Row Preview Cards -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="mantis-card p-6 bg-white border border-[#F0F0F0] rounded-xl shadow-xs space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-bold text-[#262626]">Recent Orders</h3>
              <span class="text-xs text-[#1890FF] font-semibold cursor-pointer" onclick="switchTab('activities')">View All</span>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead>
                  <tr class="border-b border-[#F0F0F0] text-[#8C8C8C]">
                    <th class="py-2">Tracking No.</th>
                    <th class="py-2">Product Name</th>
                    <th class="py-2">Total Order</th>
                    <th class="py-2">Status</th>
                    <th class="py-2 text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#F0F0F0] text-[#595959]">
                  <tr>
                    <td class="py-2.5 font-mono text-[#1890FF]">#84564564</td>
                    <td class="py-2.5 font-semibold text-[#262626]">Camera Lens</td>
                    <td class="py-2.5">40</td>
                    <td class="py-2.5"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F6FFED] text-[#52C41A] border border-[#B7EB8F]">Approved</span></td>
                    <td class="py-2.5 text-right font-bold">$40,570</td>
                  </tr>
                  <tr>
                    <td class="py-2.5 font-mono text-[#1890FF]">#84564565</td>
                    <td class="py-2.5 font-semibold text-[#262626]">Laptop Stand</td>
                    <td class="py-2.5">25</td>
                    <td class="py-2.5"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E6F7FF] text-[#1890FF] border border-[#91D5FF]">Pending</span></td>
                    <td class="py-2.5 text-right font-bold">$18,200</td>
                  </tr>
                  <tr>
                    <td class="py-2.5 font-mono text-[#1890FF]">#84564566</td>
                    <td class="py-2.5 font-semibold text-[#262626]">Mobile Phone</td>
                    <td class="py-2.5">12</td>
                    <td class="py-2.5"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFF1F0] text-[#FF4D4F] border border-[#FFA39E]">Rejected</span></td>
                    <td class="py-2.5 text-right font-bold">$9,890</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="mantis-card p-6 bg-white border border-[#F0F0F0] rounded-xl shadow-xs space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-bold text-[#262626]">Analytics Report</h3>
              <span class="text-xs text-[#1890FF] font-semibold cursor-pointer" onclick="switchTab('arena')">Details</span>
            </div>
            <p class="text-xs text-[#8C8C8C] leading-relaxed">
              Mantis Material UI đồng bộ cùng hệ thống OpenRace Runner API. Người dùng có thể chuyển đổi giao diện bất cứ lúc nào qua công tắc trên Header mà không bị mất dữ liệu phiên làm việc.
            </p>
            <div class="pt-2 flex items-center gap-3">
              <button onclick="switchTab('arena')" class="px-3.5 py-2 rounded-md bg-[#1890FF] hover:bg-[#40A9FF] text-white text-xs font-semibold shadow-xs transition">
                Xem Đấu Trường Giải Chạy
              </button>
              <button onclick="setAppTheme('sport')" class="px-3.5 py-2 rounded-md bg-white border border-[#D9D9D9] hover:bg-[#FAFAFA] text-[#595959] text-xs font-semibold transition">
                Quay Lại Giao Diện Sport Cam
              </button>
            </div>
          </div>
        </div>
      </div>
`;

const tab2Marker = '<!-- TAB 2: [2.0] GIẢI ĐẤU & ĐẤU TRƯỜNG (RACE ARENA) -->';

if (!code.includes('id="mantis-dashboard-view"')) {
  // We want to insert mantis-dashboard-view inside tab-dashboard before tab 2
  // Look for the tab 2 marker and the closing </div> of tab-dashboard right before it
  const tab2Index = code.indexOf(tab2Marker);
  if (tab2Index !== -1) {
    // Look backwards from tab2Index for </div>
    const beforeTab2 = code.slice(0, tab2Index);
    const lastDivClose = beforeTab2.lastIndexOf('</div>');
    if (lastDivClose !== -1) {
      // We insert closing of openrace-dashboard-view and mantisDashboardViewHtml right before the lastDivClose of tab-dashboard
      const part1 = code.slice(0, lastDivClose);
      const part2 = code.slice(lastDivClose);
      code = `${part1}      </div>\n${mantisDashboardViewHtml}\n${part2}`;
      console.log('✓ Successfully inserted mantis-dashboard-view before TAB 2');
    }
  }
}

fs.writeFileSync(mainTsPath, code, 'utf8');
console.log('=== Injected successfully! ===');

