const fs = require('fs');
const path = require('path');

const mainPath = path.join(__dirname, 'backend', 'src', 'main.ts');
let content = fs.readFileSync(mainPath, 'utf8');

console.log('[INJECT SYSTEM ADMIN] Starting clean injection into main.ts...');

// 1. Update CORS headers
content = content.replace(
  "res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');",
  "res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');"
);
content = content.replace(
  "res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');",
  "res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');"
);

// 2. Insert into slim-rail (Sport theme)
const slimRailTarget = `        <button onclick="switchTab('admin')" id="rail-btn-admin"`;
const slimRailBtn = `        <button onclick="switchTab('system-admin')" id="rail-btn-system-admin" class="w-10 h-10 rounded-2xl text-slate-400 hover:text-purple-600 hover:bg-purple-50 flex items-center justify-center transition relative" title="Quản Trị Hệ Thống (IAM & Danh Mục)">
          <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          <span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
        </button>
`;

if (!content.includes('id="rail-btn-system-admin"')) {
  content = content.replace(slimRailTarget, slimRailBtn + slimRailTarget);
  console.log('✓ Injected System Admin button into slim-rail');
}

// 3. Insert into main-sidebar (Sport theme off-canvas drawer)
const mainSidebarTarget = `        <!-- GROUP 4: CỘNG ĐỒNG & ĐỘI [V2.1 MỚI ⭐] -->`;
const mainSidebarGroup = `        <!-- GROUP 5: QUẢN TRỊ HỆ THỐNG (IAM & DANH MỤC THIẾT LẬP) -->
        <div class="pt-2">
          <div class="px-2 mb-2 text-[10px] font-extrabold tracking-wider text-purple-600 dark:text-purple-400 uppercase flex items-center justify-between">
            <span>QUẢN TRỊ HỆ THỐNG</span>
            <span class="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-bold">IAM</span>
          </div>

          <div class="bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-sm border border-slate-100 dark:border-slate-700/80 mb-3">
            <button onclick="switchTab('system-admin')" id="sidebar-system-admin" class="sidebar-btn w-full flex items-center justify-between font-bold text-slate-800 dark:text-slate-100 text-xs mb-1.5 text-left transition">
              <div class="flex items-center gap-1.5">
                <span class="text-purple-500">🛡️</span>
                <span>Quản Trị Hệ Thống</span>
              </div>
              <span class="text-[10px] text-slate-400">▾</span>
            </button>
            <div class="space-y-1 text-[11px] pl-1.5">
              <a href="javascript:void(0)" onclick="switchTab('system-admin'); showSystemAdminTab('users')" class="block py-0.5 text-slate-600 dark:text-slate-300 hover:text-purple-600 font-medium transition">• Quản lý người dùng</a>
              <a href="javascript:void(0)" onclick="switchTab('system-admin'); showSystemAdminTab('roles')" class="block py-0.5 text-slate-600 dark:text-slate-300 hover:text-purple-600 font-medium transition">• Phân quyền người dùng</a>
              <a href="javascript:void(0)" onclick="switchTab('system-admin'); showSystemAdminTab('configs')" class="block py-0.5 text-purple-600 font-bold hover:text-purple-700 transition">• Danh mục thiết lập</a>
            </div>
          </div>
        </div>

`;

if (!content.includes('id="sidebar-system-admin"')) {
  content = content.replace(mainSidebarTarget, mainSidebarGroup + mainSidebarTarget);
  console.log('✓ Injected Quản trị hệ thống group into main-sidebar');
}

// 4. Insert into mantis-sidebar (Mantis Material UI sidebar)
const mantisSidebarTarget = `        <!-- Group 6: TIỆN ÍCH RUNNER MỞ RỘNG (Enterprise Expansions) -->`;
const mantisSidebarGroup = `        <!-- Group 5.1: QUẢN TRỊ HỆ THỐNG (System Administration) -->
        <div class="space-y-1">
          <div class="px-3 text-[11px] font-bold text-[#8C8C8C] uppercase tracking-wider">Quản Trị Hệ Thống</div>
          <a href="javascript:void(0)" onclick="switchTab('system-admin'); showSystemAdminTab('users')" id="mantis-nav-system-admin-users" class="mantis-nav-item flex items-center gap-3 px-3 py-2 rounded-md text-[#595959] hover:bg-[#FAFAFA] hover:text-[#1890FF] transition text-[13px]">
            <svg class="w-4 h-4 text-[#8C8C8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            <span>Quản Lý Người Dùng</span>
          </a>
          <a href="javascript:void(0)" onclick="switchTab('system-admin'); showSystemAdminTab('roles')" id="mantis-nav-system-admin-roles" class="mantis-nav-item flex items-center gap-3 px-3 py-2 rounded-md text-[#595959] hover:bg-[#FAFAFA] hover:text-[#1890FF] transition text-[13px]">
            <svg class="w-4 h-4 text-[#8C8C8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            <span>Phân Quyền Người Dùng</span>
          </a>
          <a href="javascript:void(0)" onclick="switchTab('system-admin'); showSystemAdminTab('configs')" id="mantis-nav-system-admin-configs" class="mantis-nav-item flex items-center gap-3 px-3 py-2 rounded-md text-[#595959] hover:bg-[#FAFAFA] hover:text-[#1890FF] transition text-[13px]">
            <svg class="w-4 h-4 text-[#8C8C8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
            <span>Danh Mục Thiết Lập</span>
          </a>
        </div>

`;

if (!content.includes('id="mantis-nav-system-admin-users"')) {
  content = content.replace(mantisSidebarTarget, mantisSidebarGroup + mantisSidebarTarget);
  console.log('✓ Injected Quản trị hệ thống group into mantis-sidebar');
}

// 5. Update switchTab alias map
const aliasTarget = `'club-manage': 'club-manage'`;
const aliasAddition = `'club-manage': 'club-manage',
        'system-admin': 'system-admin', 'iam': 'system-admin', 'users': 'system-admin', 'roles': 'system-admin', 'configs': 'system-admin'`;

if (!content.includes("'system-admin': 'system-admin'")) {
  content = content.replace(aliasTarget, aliasAddition);
  console.log('✓ Updated switchTab alias map for system-admin');
}

// 6. Insert #tab-system-admin HTML content before the floating action button
const tabInsertTarget = `      <!-- [1.5] Floating Action Button (FAB) for Mobile & Desktop -->`;
const systemAdminHtml = `      <!-- ==================================================== -->
      <!-- TAB: QUẢN TRỊ HỆ THỐNG (IAM, RBAC & DANH MỤC THIẾT LẬP) -->
      <!-- ==================================================== -->
      <div id="tab-system-admin" class="tab-content w-full space-y-5">
        <!-- Top Screen Header Banner -->
        <div class="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
          <div class="absolute -right-10 -bottom-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div class="relative z-10 space-y-3">
            <div class="flex items-center gap-2 text-xs font-semibold text-purple-300">
              <span class="hover:text-white transition cursor-pointer" onclick="switchTab('dashboard')">Trang Chủ</span>
              <span>›</span>
              <span class="text-white font-bold">Quản Trị Hệ Thống</span>
              <span>›</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/30 text-purple-200 border border-purple-400/30">IAM & MASTER DATA</span>
            </div>
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 class="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                  <span>Quản Trị Hệ Thống & Thiết Lập Danh Mục</span>
                  <span class="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-400/30">v3.1 Live</span>
                </h1>
                <p class="text-xs md:text-sm text-purple-200/80 mt-1 max-w-2xl">
                  Quản lý tập trung tài khoản người dùng, phân quyền truy cập ma trận (RBAC) và 4 bộ danh mục thông số quy chuẩn của nền tảng OpenRace SaaS.
                </p>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <button onclick="loadSystemAdminData()" class="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl backdrop-blur-sm border border-white/20 transition flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                  <span>Làm mới</span>
                </button>
              </div>
            </div>

            <!-- 4 Quick Stats Badges -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-purple-500/20">
              <div class="bg-white/5 rounded-2xl p-3 border border-white/10">
                <div class="text-[11px] text-purple-200">Tổng Người Dùng</div>
                <div id="stat-total-users" class="text-xl font-black text-white font-mono mt-0.5">8</div>
                <div class="text-[10px] text-emerald-300 flex items-center gap-1 mt-0.5">● Đã đồng bộ CSDL</div>
              </div>
              <div class="bg-white/5 rounded-2xl p-3 border border-white/10">
                <div class="text-[11px] text-purple-200">Đang Hoạt Động</div>
                <div id="stat-active-users" class="text-xl font-black text-emerald-400 font-mono mt-0.5">7</div>
                <div class="text-[10px] text-purple-300 mt-0.5">1 đã bỏ kích hoạt</div>
              </div>
              <div class="bg-white/5 rounded-2xl p-3 border border-white/10">
                <div class="text-[11px] text-purple-200">Vai Trò & RBAC</div>
                <div id="stat-total-roles" class="text-xl font-black text-amber-400 font-mono mt-0.5">7</div>
                <div class="text-[10px] text-amber-200/80 mt-0.5">6 mặc định + 1 tùy biến</div>
              </div>
              <div class="bg-white/5 rounded-2xl p-3 border border-white/10">
                <div class="text-[11px] text-purple-200">Bộ Danh Mục Thiết Lập</div>
                <div id="stat-total-catalogs" class="text-xl font-black text-cyan-400 font-mono mt-0.5">4</div>
                <div class="text-[10px] text-cyan-200/80 mt-0.5">28 tham số toàn sàn</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 3 Major Sub-Navigation Tabs -->
        <div class="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80 w-full sm:w-fit text-xs font-bold">
          <button id="subtab-btn-users" onclick="showSystemAdminTab('users')" class="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white text-purple-900 shadow-xs transition flex items-center gap-2">
            <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            <span>Quản Lý Người Dùng</span>
            <span id="badge-users-count" class="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-100 text-purple-800 font-mono">8</span>
          </button>
          <button id="subtab-btn-roles" onclick="showSystemAdminTab('roles')" class="flex-1 sm:flex-none px-4 py-2 rounded-xl text-slate-600 hover:text-purple-900 transition flex items-center gap-2">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            <span>Phân Quyền Người Dùng</span>
            <span id="badge-roles-count" class="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700 font-mono">7</span>
          </button>
          <button id="subtab-btn-configs" onclick="showSystemAdminTab('configs')" class="flex-1 sm:flex-none px-4 py-2 rounded-xl text-slate-600 hover:text-purple-900 transition flex items-center gap-2">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
            <span>Danh Mục Thiết Lập Cho Hệ Thống</span>
            <span id="badge-configs-count" class="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700 font-mono">4 Bộ</span>
          </button>
        </div>

        <!-- ========================================== -->
        <!-- SUB-VIEW 1: QUẢN LÝ NGƯỜI DÙNG -->
        <!-- ========================================== -->
        <div id="view-system-users" class="space-y-4">
          <!-- Filter & Action Bar -->
          <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div class="flex flex-wrap items-center gap-2.5 w-full md:w-auto flex-1">
              <!-- Search Input -->
              <div class="relative flex-1 min-w-[200px]">
                <input type="text" id="sys-user-search" oninput="filterSystemUsers()" placeholder="Tìm theo tên, email, username, SĐT..." class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-purple-600 focus:bg-white transition">
                <svg class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
              <!-- Role Filter -->
              <select id="sys-user-role-filter" onchange="filterSystemUsers()" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-purple-600">
                <option value="ALL">Tất cả vai trò</option>
                <option value="role-super-admin">Tổng Quản Trị</option>
                <option value="role-club-admin">Quản Trị Viên CLB</option>
                <option value="role-team-leader">Đội Trưởng</option>
                <option value="role-race-director">Giám Đốc Giải Đấu</option>
                <option value="role-runner-athlete">Vận Động Viên</option>
                <option value="role-auditor">Kiểm Toán Viên</option>
              </select>
              <!-- Status Filter -->
              <select id="sys-user-status-filter" onchange="filterSystemUsers()" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-purple-600">
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Đang hoạt động</option>
                <option value="DEACTIVATED">Đã bỏ kích hoạt</option>
              </select>
            </div>
            <!-- Add User Button -->
            <button onclick="openAddUserModal()" class="w-full md:w-auto px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 shrink-0">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              <span>Thêm Người Dùng</span>
            </button>
          </div>

          <!-- Users Table -->
          <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th class="py-3.5 px-4">Người Dùng</th>
                    <th class="py-3.5 px-4">Vai Trò</th>
                    <th class="py-3.5 px-4">CLB & Đội Thi Đấu</th>
                    <th class="py-3.5 px-4">Trạng Thái</th>
                    <th class="py-3.5 px-4">Đăng Nhập Cuối</th>
                    <th class="py-3.5 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody id="sys-users-tbody" class="divide-y divide-slate-100 font-medium">
                  <!-- Populated by JavaScript -->
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- SUB-VIEW 2: PHÂN QUYỀN NGƯỜI DÙNG (RBAC) -->
        <!-- ========================================== -->
        <div id="view-system-roles" class="hidden space-y-4">
          <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <h3 class="font-extrabold text-slate-900 text-sm">Danh Sách Vai Trò & Ma Trận Phân Quyền (RBAC)</h3>
              <p class="text-xs text-slate-500">Quy định thẩm quyền thao tác đối với từng chức năng trên hệ thống OpenRace SaaS</p>
            </div>
            <button onclick="openAddRoleModal()" class="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              <span>Thêm Vai Trò Mới</span>
            </button>
          </div>

          <!-- Roles Grid Cards -->
          <div id="sys-roles-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <!-- Populated by JavaScript -->
          </div>
        </div>

        <!-- ========================================== -->
        <!-- SUB-VIEW 3: DANH MỤC THIẾT LẬP CHO HỆ THỐNG -->
        <!-- ========================================== -->
        <div id="view-system-configs" class="hidden space-y-5">
          <!-- 4 Catalog Pills -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <button id="cat-btn-CATALOG_PACE_RULES" onclick="selectConfigCatalog('CATALOG_PACE_RULES')" class="catalog-card-btn text-left p-4 rounded-2xl border-2 border-purple-600 bg-purple-50/50 shadow-xs transition relative">
              <div class="flex items-center gap-3">
                <span class="text-2xl">🏃</span>
                <div>
                  <div class="text-xs font-black text-purple-900">Bộ 1: Quy Chuẩn Hoạt Động & Pace</div>
                  <div class="text-[11px] text-purple-700 mt-0.5"><span class="font-mono font-bold" id="cat-count-CATALOG_PACE_RULES">8</span> thông số quy chuẩn</div>
                </div>
              </div>
            </button>

            <button id="cat-btn-CATALOG_FINANCE_GATEWAY" onclick="selectConfigCatalog('CATALOG_FINANCE_GATEWAY')" class="catalog-card-btn text-left p-4 rounded-2xl border border-slate-200 bg-white hover:border-purple-300 shadow-xs transition relative">
              <div class="flex items-center gap-3">
                <span class="text-2xl">💳</span>
                <div>
                  <div class="text-xs font-black text-slate-800">Bộ 2: Tài Chính & VietQR</div>
                  <div class="text-[11px] text-slate-500 mt-0.5"><span class="font-mono font-bold" id="cat-count-CATALOG_FINANCE_GATEWAY">7</span> thông số quỹ giải</div>
                </div>
              </div>
            </button>

            <button id="cat-btn-CATALOG_WEARABLES_INTEGRATION" onclick="selectConfigCatalog('CATALOG_WEARABLES_INTEGRATION')" class="catalog-card-btn text-left p-4 rounded-2xl border border-slate-200 bg-white hover:border-purple-300 shadow-xs transition relative">
              <div class="flex items-center gap-3">
                <span class="text-2xl">⌚</span>
                <div>
                  <div class="text-xs font-black text-slate-800">Bộ 3: Tích Hợp API & Thiết Bị</div>
                  <div class="text-[11px] text-slate-500 mt-0.5"><span class="font-mono font-bold" id="cat-count-CATALOG_WEARABLES_INTEGRATION">6</span> cấu hình Webhook/Sync</div>
                </div>
              </div>
            </button>

            <button id="cat-btn-CATALOG_RACE_LIFECYCLE" onclick="selectConfigCatalog('CATALOG_RACE_LIFECYCLE')" class="catalog-card-btn text-left p-4 rounded-2xl border border-slate-200 bg-white hover:border-purple-300 shadow-xs transition relative">
              <div class="flex items-center gap-3">
                <span class="text-2xl">🏆</span>
                <div>
                  <div class="text-xs font-black text-slate-800">Bộ 4: Vận Hành Mùa Giải</div>
                  <div class="text-[11px] text-slate-500 mt-0.5"><span class="font-mono font-bold" id="cat-count-CATALOG_RACE_LIFECYCLE">7</span> thông số chu kỳ & đội</div>
                </div>
              </div>
            </button>
          </div>

          <!-- Catalog Header & Action -->
          <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <span id="active-catalog-icon" class="text-xl">🏃</span>
                <h3 id="active-catalog-title" class="font-black text-slate-900 text-sm">Bộ 1: Quy Chuẩn Hoạt Động & Pace</h3>
                <span id="active-catalog-code" class="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-100 text-purple-800 font-bold">CATALOG_PACE_RULES</span>
              </div>
              <p id="active-catalog-desc" class="text-xs text-slate-500 mt-1">Kiểm soát cự ly tối thiểu, ngưỡng pace hợp lệ, tỉ lệ bù dốc Trail, chống gian lận và quy tắc chạy máy</p>
            </div>
            <button onclick="openAddConfigModal()" class="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-2 shrink-0">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              <span>Thêm Thông Số Danh Mục</span>
            </button>
          </div>

          <!-- Configs Table -->
          <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th class="py-3.5 px-4">Mã Tham Số</th>
                    <th class="py-3.5 px-4">Tên Thông Số</th>
                    <th class="py-3.5 px-4">Giá Trị Cấu Hình</th>
                    <th class="py-3.5 px-4">Đơn Vị</th>
                    <th class="py-3.5 px-4">Mô Tả Quy Chuẩn</th>
                    <th class="py-3.5 px-4">Trạng Thái</th>
                    <th class="py-3.5 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody id="sys-configs-tbody" class="divide-y divide-slate-100 font-medium">
                  <!-- Populated by JavaScript -->
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- MODALS: USER, ROLE & CONFIG -->
      <!-- ========================================== -->
      <!-- 1. MODAL: THÊM / ĐIỀU CHỈNH NGƯỜI DÙNG -->
      <div id="modal-sys-user" class="hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 border border-slate-100 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-purple-600">Quản Trị Người Dùng</span>
              <h3 id="modal-user-title" class="text-base font-extrabold text-slate-900">Thêm Người Dùng Mới</h3>
            </div>
            <button onclick="closeSysUserModal()" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs">✕</button>
          </div>

          <form id="sys-user-form" onsubmit="event.preventDefault(); saveSysUser();" class="space-y-3.5 text-xs">
            <input type="hidden" id="usr-modal-id">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Tên đăng nhập (Username) *</label>
                <input type="text" id="usr-modal-username" required placeholder="runner_01" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono">
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Họ và tên *</label>
                <input type="text" id="usr-modal-fullname" required placeholder="Nguyễn Văn A" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Email liên hệ *</label>
                <input type="email" id="usr-modal-email" required placeholder="athlete@openrace.vn" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800">
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Số điện thoại</label>
                <input type="text" id="usr-modal-phone" placeholder="0901234567" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono">
              </div>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Vai trò hệ thống (Role) *</label>
              <select id="usr-modal-role" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800">
                <option value="role-runner-athlete">Vận Động Viên (Runner)</option>
                <option value="role-team-leader">Đội Trưởng Thi Đấu</option>
                <option value="role-club-admin">Quản Trị Viên CLB</option>
                <option value="role-race-director">Giám Đốc Giải Đấu</option>
                <option value="role-auditor">Kiểm Toán Viên Kỹ Thuật</option>
                <option value="role-super-admin">Tổng Quản Trị Hệ Thống</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Câu lạc bộ (CLB)</label>
                <input type="text" id="usr-modal-club" value="Sài Gòn Athletes Running Club (SARC)" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800">
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Đội thi đấu</label>
                <input type="text" id="usr-modal-team" placeholder="Team Phoenix SARC" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800">
              </div>
            </div>

            <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button type="button" onclick="closeSysUserModal()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition">Hủy</button>
              <button type="submit" class="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs transition">Lưu Thông Tin</button>
            </div>
          </form>
        </div>
      </div>

      <!-- 2. MODAL: THÊM / ĐIỀU CHỈNH VAI TRÒ (RBAC) -->
      <div id="modal-sys-role" class="hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 border border-slate-100 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-purple-600">Phân Quyền Vai Trò</span>
              <h3 id="modal-role-title" class="text-base font-extrabold text-slate-900">Thêm Vai Trò Mới</h3>
            </div>
            <button onclick="closeSysRoleModal()" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs">✕</button>
          </div>

          <form id="sys-role-form" onsubmit="event.preventDefault(); saveSysRole();" class="space-y-3.5 text-xs">
            <input type="hidden" id="role-modal-id">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Mã vai trò (Code) *</label>
                <input type="text" id="role-modal-code" required placeholder="REFEREE_LEAD" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono uppercase">
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Tên hiển thị *</label>
                <input type="text" id="role-modal-name" required placeholder="Trưởng Ban Trọng Tài" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800">
              </div>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Mô tả nhiệm vụ & thẩm quyền</label>
              <textarea id="role-modal-desc" rows="2" placeholder="Mô tả tóm tắt quyền hạn của vai trò này..." class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"></textarea>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Gán quyền hạn (Permissions Matrix) *</label>
              <div class="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-[11px]">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="role-perm" value="activities.sync" class="rounded text-purple-600">
                  <span>Đồng bộ Strava/Garmin</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="role-perm" value="activities.view" class="rounded text-purple-600">
                  <span>Xem hoạt động cá nhân/đội</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="role-perm" value="activities.verify" class="rounded text-purple-600">
                  <span>Thẩm định dốc & Treadmill HR</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="role-perm" value="activities.autotrim" class="rounded text-purple-600">
                  <span>Kích hoạt cắt xe máy Auto-Trim</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="role-perm" value="appeals.create" class="rounded text-purple-600">
                  <span>Gửi kháng nghị khiếu nại</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="role-perm" value="appeals.manage" class="rounded text-purple-600">
                  <span>Duyệt & từ chối khiếu nại (+km)</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="role-perm" value="finance.pay" class="rounded text-purple-600">
                  <span>Tạo mã QR thanh toán quỹ</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="role-perm" value="finance.audit" class="rounded text-purple-600">
                  <span>Đối soát & quyết toán VietQR</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="role-perm" value="club.manage" class="rounded text-purple-600">
                  <span>Quản trị câu lạc bộ & sĩ số</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="role-perm" value="rules.config" class="rounded text-purple-600">
                  <span>Thiết lập thể lệ & danh mục</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="role-perm" value="users.manage" class="rounded text-purple-600">
                  <span>Quản lý tài khoản người dùng</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="role-perm" value="telemetry.view" class="rounded text-purple-600">
                  <span>Xem Telemetry & Audit Logs</span>
                </label>
              </div>
            </div>

            <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button type="button" onclick="closeSysRoleModal()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition">Hủy</button>
              <button type="submit" class="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs transition">Lưu Vai Trò</button>
            </div>
          </form>
        </div>
      </div>

      <!-- 3. MODAL: THÊM / ĐIỀU CHỈNH THÔNG SỐ DANH MỤC -->
      <div id="modal-sys-config" class="hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 border border-slate-100 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-purple-600">Danh Mục Thiết Lập Hệ Thống</span>
              <h3 id="modal-config-title" class="text-base font-extrabold text-slate-900">Thêm Thông Số Quy Chuẩn</h3>
            </div>
            <button onclick="closeSysConfigModal()" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs">✕</button>
          </div>

          <form id="sys-config-form" onsubmit="event.preventDefault(); saveSysConfig();" class="space-y-3.5 text-xs">
            <input type="hidden" id="cfg-modal-id">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Bộ danh mục áp dụng *</label>
              <select id="cfg-modal-catalog" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800">
                <option value="CATALOG_PACE_RULES">Bộ 1: Quy Chuẩn Hoạt Động & Pace</option>
                <option value="CATALOG_FINANCE_GATEWAY">Bộ 2: Tài Chính & Ngân Hàng VietQR</option>
                <option value="CATALOG_WEARABLES_INTEGRATION">Bộ 3: Tích Hợp API & Thiết Bị Đeo</option>
                <option value="CATALOG_RACE_LIFECYCLE">Bộ 4: Thông Số Vận Hành & Mùa Giải</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Mã tham số (Key) *</label>
                <input type="text" id="cfg-modal-key" required placeholder="MAX_DAILY_KM" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono uppercase">
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Tên thông số hiển thị *</label>
                <input type="text" id="cfg-modal-name" required placeholder="Cự ly chạy tối đa/ngày" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800">
              </div>
            </div>

            <div class="grid grid-cols-3 gap-3">
              <div class="col-span-2">
                <label class="block font-bold text-slate-700 mb-1">Giá trị cấu hình *</label>
                <input type="text" id="cfg-modal-val" required placeholder="50.0" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono font-bold">
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Đơn vị</label>
                <input type="text" id="cfg-modal-unit" placeholder="km" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono">
              </div>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Kiểu dữ liệu</label>
              <select id="cfg-modal-datatype" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800">
                <option value="number">Số (Number)</option>
                <option value="string">Chuỗi văn bản (String)</option>
                <option value="boolean">Đúng / Sai (Boolean)</option>
                <option value="json">Cấu trúc JSON</option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Mô tả mục đích quy chuẩn</label>
              <textarea id="cfg-modal-desc" rows="2" placeholder="Quy chuẩn này nhằm đảm bảo tính công bằng và an toàn thể thao..." class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"></textarea>
            </div>

            <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button type="button" onclick="closeSysConfigModal()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition">Hủy</button>
              <button type="submit" class="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs transition">Lưu Thông Số</button>
            </div>
          </form>
        </div>
      </div>
`;

if (!content.includes('id="tab-system-admin"')) {
  content = content.replace(tabInsertTarget, systemAdminHtml + '\n' + tabInsertTarget);
  console.log('✓ Injected #tab-system-admin HTML view and Modals');
}

// 7. Inject client-side JavaScript functions before </script>
const scriptEndTarget = `  </script>`;
const clientJsLines = [
  "    // ==========================================",
  "    // SYSTEM ADMINISTRATION (IAM & CATALOGS) SCRIPT",
  "    // ==========================================",
  "    let currentSystemAdminSubTab = 'users';",
  "    let currentSelectedCatalog = 'CATALOG_PACE_RULES';",
  "    let cachedSystemUsers = [];",
  "    let cachedSystemRoles = [];",
  "    let cachedSystemConfigs = [];",
  "    let cachedSystemCatalogs = [];",
  "",
  "    async function loadSystemAdminData() {",
  "      try {",
  "        const [usersRes, rolesRes, configsRes, catalogsRes] = await Promise.all([",
  "          fetch('/api/admin/system/users').catch(() => null),",
  "          fetch('/api/admin/system/roles').catch(() => null),",
  "          fetch('/api/admin/system/configs').catch(() => null),",
  "          fetch('/api/admin/system/catalogs').catch(() => null)",
  "        ]);",
  "",
  "        if (usersRes && usersRes.ok) {",
  "          cachedSystemUsers = await usersRes.json();",
  "        }",
  "        if (rolesRes && rolesRes.ok) {",
  "          cachedSystemRoles = await rolesRes.json();",
  "        }",
  "        if (configsRes && configsRes.ok) {",
  "          cachedSystemConfigs = await configsRes.json();",
  "        }",
  "        if (catalogsRes && catalogsRes.ok) {",
  "          cachedSystemCatalogs = await catalogsRes.json();",
  "        }",
  "",
  "        updateSystemAdminStats();",
  "        renderSystemUsers();",
  "        renderSystemRoles();",
  "        renderSystemConfigs();",
  "      } catch (err) {",
  "        console.error('Error loading system admin data:', err);",
  "      }",
  "    }",
  "",
  "    function updateSystemAdminStats() {",
  "      const totalUsers = cachedSystemUsers.length;",
  "      const activeUsers = cachedSystemUsers.filter(function(u) { return u.status === 'ACTIVE'; }).length;",
  "      const totalRoles = cachedSystemRoles.length;",
  "      const totalCatalogs = cachedSystemCatalogs.length || 4;",
  "",
  "      const elTotalUsers = document.getElementById('stat-total-users');",
  "      if (elTotalUsers) elTotalUsers.textContent = String(totalUsers);",
  "      const elActiveUsers = document.getElementById('stat-active-users');",
  "      if (elActiveUsers) elActiveUsers.textContent = String(activeUsers);",
  "      const elTotalRoles = document.getElementById('stat-total-roles');",
  "      if (elTotalRoles) elTotalRoles.textContent = String(totalRoles);",
  "      const elTotalCatalogs = document.getElementById('stat-total-catalogs');",
  "      if (elTotalCatalogs) elTotalCatalogs.textContent = String(totalCatalogs);",
  "",
  "      const badgeUsers = document.getElementById('badge-users-count');",
  "      if (badgeUsers) badgeUsers.textContent = String(totalUsers);",
  "      const badgeRoles = document.getElementById('badge-roles-count');",
  "      if (badgeRoles) badgeRoles.textContent = String(totalRoles);",
  "",
  "      ['CATALOG_PACE_RULES', 'CATALOG_FINANCE_GATEWAY', 'CATALOG_WEARABLES_INTEGRATION', 'CATALOG_RACE_LIFECYCLE'].forEach(function(code) {",
  "        const count = cachedSystemConfigs.filter(function(c) { return c.catalogCode === code; }).length;",
  "        const el = document.getElementById('cat-count-' + code);",
  "        if (el) el.textContent = String(count);",
  "      });",
  "    }",
  "",
  "    function showSystemAdminTab(subTab) {",
  "      currentSystemAdminSubTab = subTab;",
  "      ['users', 'roles', 'configs'].forEach(function(t) {",
  "        const view = document.getElementById('view-system-' + t);",
  "        const btn = document.getElementById('subtab-btn-' + t);",
  "        if (view) {",
  "          if (t === subTab) {",
  "            view.classList.remove('hidden');",
  "          } else {",
  "            view.classList.add('hidden');",
  "          }",
  "        }",
  "        if (btn) {",
  "          if (t === subTab) {",
  "            btn.classList.add('bg-white', 'text-purple-900', 'shadow-xs');",
  "            btn.classList.remove('text-slate-600');",
  "          } else {",
  "            btn.classList.remove('bg-white', 'text-purple-900', 'shadow-xs');",
  "            btn.classList.add('text-slate-600');",
  "          }",
  "        }",
  "      });",
  "    }",
  "",
  "    function renderSystemUsers() {",
  "      const tbody = document.getElementById('sys-users-tbody');",
  "      if (!tbody) return;",
  "",
  "      const q = (document.getElementById('sys-user-search')?.value || '').toLowerCase();",
  "      const roleFilter = document.getElementById('sys-user-role-filter')?.value || 'ALL';",
  "      const statusFilter = document.getElementById('sys-user-status-filter')?.value || 'ALL';",
  "",
  "      let filtered = cachedSystemUsers.filter(function(u) {",
  "        if (roleFilter !== 'ALL' && u.roleId !== roleFilter) return false;",
  "        if (statusFilter !== 'ALL' && u.status !== statusFilter) return false;",
  "        if (q) {",
  "          const match = u.fullName.toLowerCase().includes(q) ||",
  "            u.username.toLowerCase().includes(q) ||",
  "            u.email.toLowerCase().includes(q) ||",
  "            (u.phone && u.phone.includes(q));",
  "          if (!match) return false;",
  "        }",
  "        return true;",
  "      });",
  "",
  "      if (filtered.length === 0) {",
  "        tbody.innerHTML = '<tr><td colspan=\"6\" class=\"py-8 text-center text-slate-400\">Không tìm thấy người dùng phù hợp với tiêu chí lọc.</td></tr>';",
  "        return;",
  "      }",
  "",
  "      tbody.innerHTML = filtered.map(function(u) {",
  "        const isActive = u.status === 'ACTIVE';",
  "        const initials = u.fullName.split(' ').map(function(n) { return n[0]; }).join('').slice(-2).toUpperCase();",
  "        let roleBadgeClass = 'bg-slate-100 text-slate-800';",
  "        if (u.roleId === 'role-super-admin') roleBadgeClass = 'bg-purple-100 text-purple-800 border border-purple-200';",
  "        else if (u.roleId === 'role-club-admin') roleBadgeClass = 'bg-blue-100 text-blue-800 border border-blue-200';",
  "        else if (u.roleId === 'role-team-leader') roleBadgeClass = 'bg-indigo-100 text-indigo-800 border border-indigo-200';",
  "        else if (u.roleId === 'role-race-director') roleBadgeClass = 'bg-amber-100 text-amber-800 border border-amber-200';",
  "        else if (u.roleId === 'role-auditor') roleBadgeClass = 'bg-rose-100 text-rose-800 border border-rose-200';",
  "        const statusBadge = isActive ?",
  "          '<span class=\"inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200\"><span class=\"w-1.5 h-1.5 rounded-full bg-emerald-500\"></span>ACTIVE</span>' :",
  "          '<span class=\"inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-600 border border-slate-300\"><span class=\"w-1.5 h-1.5 rounded-full bg-slate-400\"></span>BỎ KÍCH HOẠT</span>';",
  "        const toggleBtn = '<button data-id=\"' + u.id + '\" onclick=\"toggleSysUserStatus(this.dataset.id)\" class=\"px-2.5 py-1 ' + (isActive ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200') + ' font-bold rounded-lg transition text-[11px]\">' + (isActive ? 'Bỏ kích hoạt' : 'Kích hoạt lại') + '</button>';",
  "        const loginDate = u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : 'Chưa đăng nhập';",
  "        return '<tr class=\"hover:bg-slate-50/70 transition ' + (isActive ? '' : 'bg-slate-50/40 opacity-70') + '\">' +",
  "          '<td class=\"py-3 px-4\"><div class=\"flex items-center gap-3\"><div class=\"w-8 h-8 rounded-full ' + (isActive ? 'bg-gradient-to-tr from-purple-500 to-indigo-600' : 'bg-slate-400') + ' text-white font-bold text-xs flex items-center justify-center shrink-0\">' + initials + '</div><div><div class=\"font-bold text-slate-900 flex items-center gap-1.5\"><span>' + u.fullName + '</span><span class=\"text-[10px] font-mono text-slate-400\">(@' + u.username + ')</span></div><div class=\"text-[11px] text-slate-500\">' + u.email + (u.phone ? ' • ' + u.phone : '') + '</div></div></div></td>' +",
  "          '<td class=\"py-3 px-4\"><span class=\"px-2.5 py-0.5 rounded-full text-[10px] font-bold ' + roleBadgeClass + '\">' + u.roleName + '</span></td>' +",
  "          '<td class=\"py-3 px-4\"><div class=\"text-slate-800 font-semibold\">' + (u.clubName || 'Chưa gán CLB') + '</div><div class=\"text-[11px] text-slate-400\">' + (u.teamName ? 'Đội: ' + u.teamName : 'Tự do') + '</div></td>' +",
  "          '<td class=\"py-3 px-4\">' + statusBadge + '</td>' +",
  "          '<td class=\"py-3 px-4 text-slate-500 font-mono text-[11px]\">' + loginDate + '</td>' +",
  "          '<td class=\"py-3 px-4 text-right space-x-1.5 shrink-0\"><button data-id=\"' + u.id + '\" onclick=\"editSysUser(this.dataset.id)\" class=\"px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition text-[11px]\">Điều chỉnh</button>' + toggleBtn + '</td>' +",
  "          '</tr>';",
  "      }).join('');",
  "    }",
  "",
  "    function filterSystemUsers() {",
  "      renderSystemUsers();",
  "    }",
  "",
  "    function openAddUserModal() {",
  "      document.getElementById('modal-user-title').textContent = 'Thêm Người Dùng Mới';",
  "      document.getElementById('usr-modal-id').value = '';",
  "      document.getElementById('usr-modal-username').value = '';",
  "      document.getElementById('usr-modal-username').disabled = false;",
  "      document.getElementById('usr-modal-fullname').value = '';",
  "      document.getElementById('usr-modal-email').value = '';",
  "      document.getElementById('usr-modal-phone').value = '';",
  "      document.getElementById('usr-modal-role').value = 'role-runner-athlete';",
  "      document.getElementById('usr-modal-club').value = 'Sài Gòn Athletes Running Club (SARC)';",
  "      document.getElementById('usr-modal-team').value = '';",
  "      document.getElementById('modal-sys-user').classList.remove('hidden');",
  "    }",
  "",
  "    function editSysUser(userId) {",
  "      const user = cachedSystemUsers.find(function(u) { return u.id === userId; });",
  "      if (!user) return;",
  "      document.getElementById('modal-user-title').textContent = 'Điều Chỉnh Thông Tin Người Dùng';",
  "      document.getElementById('usr-modal-id').value = user.id;",
  "      document.getElementById('usr-modal-username').value = user.username;",
  "      document.getElementById('usr-modal-username').disabled = true;",
  "      document.getElementById('usr-modal-fullname').value = user.fullName;",
  "      document.getElementById('usr-modal-email').value = user.email;",
  "      document.getElementById('usr-modal-phone').value = user.phone || '';",
  "      document.getElementById('usr-modal-role').value = user.roleId;",
  "      document.getElementById('usr-modal-club').value = user.clubName || '';",
  "      document.getElementById('usr-modal-team').value = user.teamName || '';",
  "      document.getElementById('modal-sys-user').classList.remove('hidden');",
  "    }",
  "",
  "    function closeSysUserModal() {",
  "      document.getElementById('modal-sys-user').classList.add('hidden');",
  "    }",
  "",
  "    async function saveSysUser() {",
  "      const id = document.getElementById('usr-modal-id').value;",
  "      const roleSelect = document.getElementById('usr-modal-role');",
  "      const payload = {",
  "        username: document.getElementById('usr-modal-username').value,",
  "        fullName: document.getElementById('usr-modal-fullname').value,",
  "        email: document.getElementById('usr-modal-email').value,",
  "        phone: document.getElementById('usr-modal-phone').value,",
  "        roleId: roleSelect.value,",
  "        roleName: roleSelect.options[roleSelect.selectedIndex].text,",
  "        clubName: document.getElementById('usr-modal-club').value,",
  "        teamName: document.getElementById('usr-modal-team').value",
  "      };",
  "",
  "      try {",
  "        let res;",
  "        if (id) {",
  "          res = await fetch('/api/admin/system/users/' + id, {",
  "            method: 'PUT',",
  "            headers: { 'Content-Type': 'application/json' },",
  "            body: JSON.stringify(payload)",
  "          });",
  "        } else {",
  "          res = await fetch('/api/admin/system/users', {",
  "            method: 'POST',",
  "            headers: { 'Content-Type': 'application/json' },",
  "            body: JSON.stringify(payload)",
  "          });",
  "        }",
  "",
  "        if (res && res.ok) {",
  "          showToast('✓ Đã lưu thông tin người dùng thành công');",
  "          closeSysUserModal();",
  "          await loadSystemAdminData();",
  "        } else {",
  "          showToast('⚠️ Không thể lưu thông tin: Lỗi kết nối API');",
  "        }",
  "      } catch (err) {",
  "        showToast('⚠️ Lỗi: ' + err.message);",
  "      }",
  "    }",
  "",
  "    async function toggleSysUserStatus(userId) {",
  "      const user = cachedSystemUsers.find(function(u) { return u.id === userId; });",
  "      const actionName = user && user.status === 'ACTIVE' ? 'bỏ kích hoạt' : 'kích hoạt lại';",
  "      if (!confirm('Bạn có chắc chắn muốn ' + actionName + ' tài khoản này? (Lưu ý: Dữ liệu bài chạy, tài chính và lịch sử sẽ được bảo toàn nguyên vẹn, không bị xóa.)')) {",
  "        return;",
  "      }",
  "",
  "      try {",
  "        const res = await fetch('/api/admin/system/users/' + userId + '/toggle-status', {",
  "          method: 'POST',",
  "          headers: { 'Content-Type': 'application/json' },",
  "          body: JSON.stringify({ reason: 'Admin toggle status' })",
  "        });",
  "        if (res && res.ok) {",
  "          showToast('✓ Đã ' + actionName + ' tài khoản người dùng thành công (Dữ liệu bảo toàn)');",
  "          await loadSystemAdminData();",
  "        } else {",
  "          showToast('⚠️ Lỗi khi cập nhật trạng thái');",
  "        }",
  "      } catch (err) {",
  "        showToast('⚠️ Lỗi: ' + err.message);",
  "      }",
  "    }",
  "",
  "    // --- ROLES & RBAC RENDERING ---",
  "    function renderSystemRoles() {",
  "      const grid = document.getElementById('sys-roles-grid');",
  "      if (!grid) return;",
  "",
  "      grid.innerHTML = cachedSystemRoles.map(function(r) {",
  "        const isActive = r.status === 'ACTIVE';",
  "        const permTags = r.permissions.map(function(p) {",
  "          return '<span class=\"px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-mono font-semibold\">' + p + '</span>';",
  "        }).join('');",
  "        return '<div class=\"bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 ' + (isActive ? '' : 'bg-slate-50 opacity-70') + '\">' +",
  "          '<div class=\"space-y-3\">' +",
  "            '<div class=\"flex items-center justify-between\">' +",
  "              '<span class=\"px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ' + (r.isSystemDefault ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800') + '\">' + r.code + '</span>' +",
  "              (isActive ? '<span class=\"text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full\">ACTIVE</span>' : '<span class=\"text-[10px] font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full\">BỎ KÍCH HOẠT</span>') +",
  "            '</div>' +",
  "            '<div><h4 class=\"font-extrabold text-slate-900 text-sm\">' + r.name + '</h4><p class=\"text-xs text-slate-500 mt-1 leading-relaxed\">' + r.description + '</p></div>' +",
  "            '<div><div class=\"text-[11px] font-bold text-slate-700 mb-1.5\">Quyền hạn áp dụng (' + r.permissions.length + '):</div><div class=\"flex flex-wrap gap-1\">' + permTags + '</div></div>' +",
  "          '</div>' +",
  "          '<div class=\"pt-3 border-t border-slate-100 flex items-center justify-between\">' +",
  "            '<span class=\"text-[11px] text-slate-400 font-mono\">' + (r.isSystemDefault ? 'Vai trò hệ thống' : 'Tùy biến CLB') + '</span>' +",
  "            '<div class=\"space-x-1.5\"><button data-id=\"' + r.id + '\" onclick=\"editSysRole(this.dataset.id)\" class=\"px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition text-[11px]\">Điều chỉnh</button><button data-id=\"' + r.id + '\" onclick=\"toggleSysRoleStatus(this.dataset.id)\" class=\"px-2.5 py-1 ' + (isActive ? 'bg-amber-50 hover:bg-amber-100 text-amber-700' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700') + ' font-bold rounded-lg transition text-[11px]\">' + (isActive ? 'Bỏ kích hoạt' : 'Kích hoạt lại') + '</button></div>' +",
  "          '</div>' +",
  "        '</div>';",
  "      }).join('');",
  "    }",
  "",
  "    function openAddRoleModal() {",
  "      document.getElementById('modal-role-title').textContent = 'Thêm Vai Trò Mới';",
  "      document.getElementById('role-modal-id').value = '';",
  "      document.getElementById('role-modal-code').value = '';",
  "      document.getElementById('role-modal-code').disabled = false;",
  "      document.getElementById('role-modal-name').value = '';",
  "      document.getElementById('role-modal-desc').value = '';",
  "      document.querySelectorAll(\"input[name='role-perm']\").forEach(function(cb) { cb.checked = false; });",
  "      document.getElementById('modal-sys-role').classList.remove('hidden');",
  "    }",
  "",
  "    function editSysRole(roleId) {",
  "      const role = cachedSystemRoles.find(function(r) { return r.id === roleId; });",
  "      if (!role) return;",
  "      document.getElementById('modal-role-title').textContent = 'Điều Chỉnh Quyền Hạn Vai Trò';",
  "      document.getElementById('role-modal-id').value = role.id;",
  "      document.getElementById('role-modal-code').value = role.code;",
  "      document.getElementById('role-modal-code').disabled = role.isSystemDefault ? true : false;",
  "      document.getElementById('role-modal-name').value = role.name;",
  "      document.getElementById('role-modal-desc').value = role.description;",
  "      document.querySelectorAll(\"input[name='role-perm']\").forEach(function(cb) {",
  "        cb.checked = role.permissions.includes(cb.value) || role.permissions.includes('*') || role.permissions.includes('users.all');",
  "      });",
  "      document.getElementById('modal-sys-role').classList.remove('hidden');",
  "    }",
  "",
  "    function closeSysRoleModal() {",
  "      document.getElementById('modal-sys-role').classList.add('hidden');",
  "    }",
  "",
  "    async function saveSysRole() {",
  "      const id = document.getElementById('role-modal-id').value;",
  "      const checkedPerms = Array.from(document.querySelectorAll(\"input[name='role-perm']:checked\")).map(function(cb) { return cb.value; });",
  "      const payload = {",
  "        code: document.getElementById('role-modal-code').value,",
  "        name: document.getElementById('role-modal-name').value,",
  "        description: document.getElementById('role-modal-desc').value,",
  "        permissions: checkedPerms.length > 0 ? checkedPerms : ['activities.view']",
  "      };",
  "",
  "      try {",
  "        let res;",
  "        if (id) {",
  "          res = await fetch('/api/admin/system/roles/' + id, {",
  "            method: 'PUT',",
  "            headers: { 'Content-Type': 'application/json' },",
  "            body: JSON.stringify(payload)",
  "          });",
  "        } else {",
  "          res = await fetch('/api/admin/system/roles', {",
  "            method: 'POST',",
  "            headers: { 'Content-Type': 'application/json' },",
  "            body: JSON.stringify(payload)",
  "          });",
  "        }",
  "",
  "        if (res && res.ok) {",
  "          showToast('✓ Đã cập nhật vai trò RBAC thành công');",
  "          closeSysRoleModal();",
  "          await loadSystemAdminData();",
  "        } else {",
  "          showToast('⚠️ Không thể lưu vai trò');",
  "        }",
  "      } catch (err) {",
  "        showToast('⚠️ Lỗi: ' + err.message);",
  "      }",
  "    }",
  "",
  "    async function toggleSysRoleStatus(roleId) {",
  "      try {",
  "        const res = await fetch('/api/admin/system/roles/' + roleId + '/toggle-status', {",
  "          method: 'POST'",
  "        });",
  "        if (res && res.ok) {",
  "          showToast('✓ Đã thay đổi trạng thái kích hoạt vai trò');",
  "          await loadSystemAdminData();",
  "        }",
  "      } catch (err) {",
  "        showToast('⚠️ Lỗi: ' + err.message);",
  "      }",
  "    }",
  "",
  "    // --- CONFIG CATALOGS RENDERING ---",
  "    function selectConfigCatalog(catalogCode) {",
  "      currentSelectedCatalog = catalogCode;",
  "      ['CATALOG_PACE_RULES', 'CATALOG_FINANCE_GATEWAY', 'CATALOG_WEARABLES_INTEGRATION', 'CATALOG_RACE_LIFECYCLE'].forEach(function(code) {",
  "        const btn = document.getElementById('cat-btn-' + code);",
  "        if (btn) {",
  "          if (code === catalogCode) {",
  "            btn.classList.add('border-2', 'border-purple-600', 'bg-purple-50/50');",
  "            btn.classList.remove('border-slate-200', 'bg-white');",
  "          } else {",
  "            btn.classList.remove('border-2', 'border-purple-600', 'bg-purple-50/50');",
  "            btn.classList.add('border-slate-200', 'bg-white');",
  "          }",
  "        }",
  "      });",
  "",
  "      const catMetaMap = {",
  "        'CATALOG_PACE_RULES': { title: 'Bộ 1: Quy Chuẩn Hoạt Động & Pace', icon: '🏃', desc: 'Kiểm soát cự ly tối thiểu, ngưỡng pace hợp lệ, tỉ lệ bù dốc Trail, chống gian lận và quy tắc chạy máy' },",
  "        'CATALOG_FINANCE_GATEWAY': { title: 'Bộ 2: Tài Chính & Ngân Hàng VietQR', icon: '💳', desc: 'Tài khoản quỹ giải thụ hưởng, mức đóng góp phân tầng, phạt chu kỳ tuần và định dạng memo VietQR' },",
  "        'CATALOG_WEARABLES_INTEGRATION': { title: 'Bộ 3: Tích Hợp API & Thiết Bị Đeo', icon: '⌚', desc: 'Hạn mức Strava API, Webhook endpoints Garmin / Coros, tần suất đồng bộ nền và secret key bảo mật' },",
  "        'CATALOG_RACE_LIFECYCLE': { title: 'Bộ 4: Thông Số Vận Hành & Mùa Giải', icon: '🏆', desc: 'Chỉ tiêu chu kỳ tuần, thời gian ân hạn thứ Hai, sĩ số tối đa mỗi đội và cơ chế tính điểm xếp hạng' }",
  "      };",
  "      const catMeta = catMetaMap[catalogCode] || { title: catalogCode, icon: '⚙️', desc: '' };",
  "",
  "      const tEl = document.getElementById('active-catalog-title'); if (tEl) tEl.textContent = catMeta.title;",
  "      const iEl = document.getElementById('active-catalog-icon'); if (iEl) iEl.textContent = catMeta.icon;",
  "      const cEl = document.getElementById('active-catalog-code'); if (cEl) cEl.textContent = catalogCode;",
  "      const dEl = document.getElementById('active-catalog-desc'); if (dEl) dEl.textContent = catMeta.desc;",
  "",
  "      renderSystemConfigs();",
  "    }",
  "",
  "    function renderSystemConfigs() {",
  "      const tbody = document.getElementById('sys-configs-tbody');",
  "      if (!tbody) return;",
  "",
  "      const configs = cachedSystemConfigs.filter(function(c) { return c.catalogCode === currentSelectedCatalog; });",
  "",
  "      if (configs.length === 0) {",
  "        tbody.innerHTML = '<tr><td colspan=\"7\" class=\"py-8 text-center text-slate-400\">Chưa có thông số nào trong bộ danh mục này.</td></tr>';",
  "        return;",
  "      }",
  "",
  "      tbody.innerHTML = configs.map(function(c) {",
  "        const isActive = c.status === 'ACTIVE';",
  "        const statusBadge = isActive ?",
  "          '<span class=\"inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200\"><span class=\"w-1.5 h-1.5 rounded-full bg-emerald-500\"></span>ACTIVE</span>' :",
  "          '<span class=\"inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-600 border border-slate-300\"><span class=\"w-1.5 h-1.5 rounded-full bg-slate-400\"></span>BỎ KÍCH HOẠT</span>';",
  "        return '<tr class=\"hover:bg-slate-50/70 transition ' + (isActive ? '' : 'bg-slate-50/40 opacity-70') + '\">' +",
  "          '<td class=\"py-3 px-4 font-mono font-bold text-slate-900\">' + c.key + '</td>' +",
  "          '<td class=\"py-3 px-4 font-bold text-slate-800\">' + c.name + '</td>' +",
  "          '<td class=\"py-3 px-4\"><span class=\"px-2 py-1 rounded-md bg-purple-50 text-purple-900 font-mono font-bold border border-purple-200\">' + c.value + '</span></td>' +",
  "          '<td class=\"py-3 px-4 font-mono text-slate-600\">' + (c.unit || '-') + '</td>' +",
  "          '<td class=\"py-3 px-4 text-slate-500 max-w-xs truncate\" title=\"' + c.description + '\">' + c.description + '</td>' +",
  "          '<td class=\"py-3 px-4\">' + statusBadge + '</td>' +",
  "          '<td class=\"py-3 px-4 text-right space-x-1.5 shrink-0\"><button data-id=\"' + c.id + '\" onclick=\"editSysConfig(this.dataset.id)\" class=\"px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition text-[11px]\">Điều chỉnh</button><button data-id=\"' + c.id + '\" onclick=\"toggleSysConfigStatus(this.dataset.id)\" class=\"px-2.5 py-1 ' + (isActive ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200') + ' font-bold rounded-lg transition text-[11px]\">' + (isActive ? 'Bỏ kích hoạt' : 'Kích hoạt lại') + '</button></td>' +",
  "          '</tr>';",
  "      }).join('');",
  "    }",
  "",
  "    function openAddConfigModal() {",
  "      document.getElementById('modal-config-title').textContent = 'Thêm Thông Số Quy Chuẩn Mới';",
  "      document.getElementById('cfg-modal-id').value = '';",
  "      document.getElementById('cfg-modal-catalog').value = currentSelectedCatalog;",
  "      document.getElementById('cfg-modal-key').value = '';",
  "      document.getElementById('cfg-modal-key').disabled = false;",
  "      document.getElementById('cfg-modal-name').value = '';",
  "      document.getElementById('cfg-modal-val').value = '';",
  "      document.getElementById('cfg-modal-unit').value = '';",
  "      document.getElementById('cfg-modal-datatype').value = 'string';",
  "      document.getElementById('cfg-modal-desc').value = '';",
  "      document.getElementById('modal-sys-config').classList.remove('hidden');",
  "    }",
  "",
  "    function editSysConfig(configId) {",
  "      const config = cachedSystemConfigs.find(function(c) { return c.id === configId; });",
  "      if (!config) return;",
  "      document.getElementById('modal-config-title').textContent = 'Điều Chỉnh Giá Trị Thông Số';",
  "      document.getElementById('cfg-modal-id').value = config.id;",
  "      document.getElementById('cfg-modal-catalog').value = config.catalogCode;",
  "      document.getElementById('cfg-modal-key').value = config.key;",
  "      document.getElementById('cfg-modal-key').disabled = true;",
  "      document.getElementById('cfg-modal-name').value = config.name;",
  "      document.getElementById('cfg-modal-val').value = config.value;",
  "      document.getElementById('cfg-modal-unit').value = config.unit || '';",
  "      document.getElementById('cfg-modal-datatype').value = config.dataType;",
  "      document.getElementById('cfg-modal-desc').value = config.description;",
  "      document.getElementById('modal-sys-config').classList.remove('hidden');",
  "    }",
  "",
  "    function closeSysConfigModal() {",
  "      document.getElementById('modal-sys-config').classList.add('hidden');",
  "    }",
  "",
  "    async function saveSysConfig() {",
  "      const id = document.getElementById('cfg-modal-id').value;",
  "      const payload = {",
  "        catalogCode: document.getElementById('cfg-modal-catalog').value,",
  "        key: document.getElementById('cfg-modal-key').value,",
  "        name: document.getElementById('cfg-modal-name').value,",
  "        value: document.getElementById('cfg-modal-val').value,",
  "        unit: document.getElementById('cfg-modal-unit').value,",
  "        dataType: document.getElementById('cfg-modal-datatype').value,",
  "        description: document.getElementById('cfg-modal-desc').value",
  "      };",
  "",
  "      try {",
  "        let res;",
  "        if (id) {",
  "          res = await fetch('/api/admin/system/configs/' + id, {",
  "            method: 'PUT',",
  "            headers: { 'Content-Type': 'application/json' },",
  "            body: JSON.stringify(payload)",
  "          });",
  "        } else {",
  "          res = await fetch('/api/admin/system/configs', {",
  "            method: 'POST',",
  "            headers: { 'Content-Type': 'application/json' },",
  "            body: JSON.stringify(payload)",
  "          });",
  "        }",
  "",
  "        if (res && res.ok) {",
  "          showToast('✓ Đã cập nhật thông số danh mục thành công');",
  "          closeSysConfigModal();",
  "          await loadSystemAdminData();",
  "        } else {",
  "          showToast('⚠️ Không thể lưu thông số');",
  "        }",
  "      } catch (err) {",
  "        showToast('⚠️ Lỗi: ' + err.message);",
  "      }",
  "    }",
  "",
  "    async function toggleSysConfigStatus(configId) {",
  "      try {",
  "        const res = await fetch('/api/admin/system/configs/' + configId + '/toggle-status', {",
  "          method: 'POST'",
  "        });",
  "        if (res && res.ok) {",
  "          showToast('✓ Đã cập nhật trạng thái kích hoạt thông số');",
  "          await loadSystemAdminData();",
  "        }",
  "      } catch (err) {",
  "        showToast('⚠️ Lỗi: ' + err.message);",
  "      }",
  "    }",
  "",
  "    // Auto-load System Admin data when switching to system-admin tab",
  "    const origSwitchTab = switchTab;",
  "    switchTab = function(tabId) {",
  "      origSwitchTab(tabId);",
  "      const aliasMap = {",
  "        'system-admin': 'system-admin', 'iam': 'system-admin', 'users': 'system-admin', 'roles': 'system-admin', 'configs': 'system-admin'",
  "      };",
  "      if (aliasMap[tabId]) {",
  "        loadSystemAdminData();",
  "      }",
  "    };"
];

const clientJsString = clientJsLines.join('\n');

if (!content.includes('function loadSystemAdminData()')) {
  content = content.replace(scriptEndTarget, clientJsString + '\n' + scriptEndTarget);
  console.log('✓ Injected client-side JavaScript for System Admin');
}

// 8. Add backend REST API routes into handleApiRequest
const apiRoutesTarget = `    if (req.method === 'GET' && pathname === '/api/audit-logs') {`;
const apiRoutesLines = [
  "    // ==========================================",
  "    // SYSTEM ADMINISTRATION REST APIS (IAM, RBAC & CATALOGS)",
  "    // ==========================================",
  "    // 1. Users",
  "    if (req.method === 'GET' && pathname === '/api/admin/system/users') {",
  "      const url = new URL(req.url || '/', 'http://' + (req.headers.host || 'localhost'));",
  "      const status = url.searchParams.get('status') || undefined;",
  "      const roleId = url.searchParams.get('roleId') || undefined;",
  "      const search = url.searchParams.get('search') || undefined;",
  "      const users = adminUseCase.getSystemUsers({ status, roleId, search });",
  "      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });",
  "      res.end(JSON.stringify(users));",
  "      return true;",
  "    }",
  "",
  "    if (req.method === 'POST' && pathname === '/api/admin/system/users') {",
  "      let body = '';",
  "      req.on('data', chunk => { body += chunk; });",
  "      req.on('end', () => {",
  "        try {",
  "          const payload = JSON.parse(body || '{}');",
  "          const created = adminUseCase.createSystemUser(payload, 'admin-session');",
  "          res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });",
  "          res.end(JSON.stringify(created));",
  "        } catch (err: any) {",
  "          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });",
  "          res.end(JSON.stringify({ error: err.message }));",
  "        }",
  "      });",
  "      return true;",
  "    }",
  "",
  "    if ((req.method === 'PUT' || req.method === 'POST') && pathname.startsWith('/api/admin/system/users/') && !pathname.endsWith('/toggle-status')) {",
  "      const id = pathname.split('/').pop() || '';",
  "      let body = '';",
  "      req.on('data', chunk => { body += chunk; });",
  "      req.on('end', () => {",
  "        try {",
  "          const payload = JSON.parse(body || '{}');",
  "          const updated = adminUseCase.updateSystemUser(id, payload, 'admin-session');",
  "          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });",
  "          res.end(JSON.stringify(updated));",
  "        } catch (err: any) {",
  "          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });",
  "          res.end(JSON.stringify({ error: err.message }));",
  "        }",
  "      });",
  "      return true;",
  "    }",
  "",
  "    if ((req.method === 'POST' || req.method === 'PATCH') && pathname.startsWith('/api/admin/system/users/') && pathname.endsWith('/toggle-status')) {",
  "      const parts = pathname.split('/');",
  "      const id = parts[parts.length - 2];",
  "      let body = '';",
  "      req.on('data', chunk => { body += chunk; });",
  "      req.on('end', () => {",
  "        try {",
  "          const payload = JSON.parse(body || '{}');",
  "          const toggled = adminUseCase.toggleSystemUserStatus(id, 'admin-session', payload.reason);",
  "          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });",
  "          res.end(JSON.stringify(toggled));",
  "        } catch (err: any) {",
  "          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });",
  "          res.end(JSON.stringify({ error: err.message }));",
  "        }",
  "      });",
  "      return true;",
  "    }",
  "",
  "    // 2. Roles",
  "    if (req.method === 'GET' && pathname === '/api/admin/system/roles') {",
  "      const roles = adminUseCase.getSystemRoles();",
  "      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });",
  "      res.end(JSON.stringify(roles));",
  "      return true;",
  "    }",
  "",
  "    if (req.method === 'POST' && pathname === '/api/admin/system/roles') {",
  "      let body = '';",
  "      req.on('data', chunk => { body += chunk; });",
  "      req.on('end', () => {",
  "        try {",
  "          const payload = JSON.parse(body || '{}');",
  "          const created = adminUseCase.createSystemRole(payload, 'admin-session');",
  "          res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });",
  "          res.end(JSON.stringify(created));",
  "        } catch (err: any) {",
  "          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });",
  "          res.end(JSON.stringify({ error: err.message }));",
  "        }",
  "      });",
  "      return true;",
  "    }",
  "",
  "    if ((req.method === 'PUT' || req.method === 'POST') && pathname.startsWith('/api/admin/system/roles/') && !pathname.endsWith('/toggle-status')) {",
  "      const id = pathname.split('/').pop() || '';",
  "      let body = '';",
  "      req.on('data', chunk => { body += chunk; });",
  "      req.on('end', () => {",
  "        try {",
  "          const payload = JSON.parse(body || '{}');",
  "          const updated = adminUseCase.updateSystemRole(id, payload, 'admin-session');",
  "          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });",
  "          res.end(JSON.stringify(updated));",
  "        } catch (err: any) {",
  "          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });",
  "          res.end(JSON.stringify({ error: err.message }));",
  "        }",
  "      });",
  "      return true;",
  "    }",
  "",
  "    if ((req.method === 'POST' || req.method === 'PATCH') && pathname.startsWith('/api/admin/system/roles/') && pathname.endsWith('/toggle-status')) {",
  "      const parts = pathname.split('/');",
  "      const id = parts[parts.length - 2];",
  "      try {",
  "        const toggled = adminUseCase.toggleSystemRoleStatus(id, 'admin-session');",
  "        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });",
  "        res.end(JSON.stringify(toggled));",
  "      } catch (err: any) {",
  "        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });",
  "        res.end(JSON.stringify({ error: err.message }));",
  "      }",
  "      return true;",
  "    }",
  "",
  "    // 3. Catalogs & Parameters",
  "    if (req.method === 'GET' && pathname === '/api/admin/system/catalogs') {",
  "      const catalogs = adminUseCase.getSystemCatalogs();",
  "      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });",
  "      res.end(JSON.stringify(catalogs));",
  "      return true;",
  "    }",
  "",
  "    if (req.method === 'GET' && pathname === '/api/admin/system/configs') {",
  "      const url = new URL(req.url || '/', 'http://' + (req.headers.host || 'localhost'));",
  "      const catalog = url.searchParams.get('catalog') || undefined;",
  "      const configs = adminUseCase.getSystemConfigs(catalog);",
  "      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });",
  "      res.end(JSON.stringify(configs));",
  "      return true;",
  "    }",
  "",
  "    if (req.method === 'POST' && pathname === '/api/admin/system/configs') {",
  "      let body = '';",
  "      req.on('data', chunk => { body += chunk; });",
  "      req.on('end', () => {",
  "        try {",
  "          const payload = JSON.parse(body || '{}');",
  "          const created = adminUseCase.createSystemConfig(payload, 'admin-session');",
  "          res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });",
  "          res.end(JSON.stringify(created));",
  "        } catch (err: any) {",
  "          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });",
  "          res.end(JSON.stringify({ error: err.message }));",
  "        }",
  "      });",
  "      return true;",
  "    }",
  "",
  "    if ((req.method === 'PUT' || req.method === 'POST') && pathname.startsWith('/api/admin/system/configs/') && !pathname.endsWith('/toggle-status')) {",
  "      const id = pathname.split('/').pop() || '';",
  "      let body = '';",
  "      req.on('data', chunk => { body += chunk; });",
  "      req.on('end', () => {",
  "        try {",
  "          const payload = JSON.parse(body || '{}');",
  "          const updated = adminUseCase.updateSystemConfig(id, payload, 'admin-session');",
  "          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });",
  "          res.end(JSON.stringify(updated));",
  "        } catch (err: any) {",
  "          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });",
  "          res.end(JSON.stringify({ error: err.message }));",
  "        }",
  "      });",
  "      return true;",
  "    }",
  "",
  "    if ((req.method === 'POST' || req.method === 'PATCH') && pathname.startsWith('/api/admin/system/configs/') && pathname.endsWith('/toggle-status')) {",
  "      const parts = pathname.split('/');",
  "      const id = parts[parts.length - 2];",
  "      try {",
  "        const toggled = adminUseCase.toggleSystemConfigStatus(id, 'admin-session');",
  "        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });",
  "        res.end(JSON.stringify(toggled));",
  "      } catch (err: any) {",
  "        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });",
  "        res.end(JSON.stringify({ error: err.message }));",
  "      }",
  "      return true;",
  "    }"
];

const apiRoutesString = apiRoutesLines.join('\n') + '\n\n';

if (!content.includes("pathname === '/api/admin/system/users'")) {
  content = content.replace(apiRoutesTarget, apiRoutesString + apiRoutesTarget);
  console.log('✓ Injected REST API routes for System Admin');
}

fs.writeFileSync(mainPath, content, 'utf8');
console.log('🎉 Successfully saved all changes to main.ts!');
