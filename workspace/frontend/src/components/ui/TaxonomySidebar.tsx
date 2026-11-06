'use client';

import React, { useState } from 'react';
import type { NavTab } from './NavigationMenu';

interface TaxonomySidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const TaxonomySidebar: React.FC<TaxonomySidebarProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Quick navigation helper
  const navigate = (tab: NavTab, sectionId?: string) => {
    onSelectTab(tab);
    if (sectionId && typeof window !== 'undefined') {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  return (
    <aside
      className={`bg-white/95 rounded-3xl p-4 flex flex-col justify-between border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] shrink-0 my-4 ml-4 transition-all duration-300 overflow-y-auto max-h-[calc(100vh-2rem)] no-scrollbar z-30 ${
        collapsed ? 'w-20' : 'w-80'
      }`}
    >
      <div className="space-y-4">
        {/* Top Brand & Sidebar Controls */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#FF5B26] to-[#FF8254] flex items-center justify-center text-white shadow-md shadow-orange-500/20 font-black text-sm">
              OR
            </div>
            {!collapsed && (
              <div>
                <div className="text-sm font-black tracking-tight text-slate-900 leading-none">
                  OpenRace SaaS
                </div>
                <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                  v3.0 • Hệ Thống Giải Chạy
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsDark(!isDark)}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition text-xs"
              title="Chế độ sáng/tối"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition text-xs"
              title={collapsed ? 'Mở rộng menu' : 'Thu nhỏ menu'}
            >
              {collapsed ? '▶' : '◀'}
            </button>
          </div>
        </div>

        {/* Navigation Tree: 3 Major Sections */}
        <nav className="space-y-4 text-xs">
          {/* SECTION 1: RUNNER HUB (1.0 - 5.0) */}
          <div className="space-y-1">
            {!collapsed && (
              <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>VĐV & Thành Viên</span>
                <span className="text-[9px] text-slate-400">1.0 - 5.0</span>
              </div>
            )}

            {/* [1.0] Dashboard Runner */}
            <div className="rounded-2xl overflow-hidden">
              <button
                onClick={() => navigate('dashboard')}
                className={`w-full p-2.5 rounded-2xl flex items-center justify-between font-bold text-left transition ${
                  activeTab === 'dashboard'
                    ? 'bg-[#18181B] text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
                title="[1.0] Dashboard Runner"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">📊</span>
                  {!collapsed && <span>[1.0] Dashboard Runner</span>}
                </div>
                {!collapsed && <span className="text-[10px] opacity-70">▾</span>}
              </button>
              {!collapsed && (
                <div className="pl-6 pr-2 py-1.5 space-y-1 bg-slate-50/70 border-l-2 border-orange-500 ml-3 mt-1 rounded-r-xl text-[11px]">
                  <button
                    onClick={() => navigate('dashboard', 'section-1-1')}
                    className="block w-full text-left py-1 text-slate-600 hover:text-[#FF5B26] font-medium"
                  >
                    • [1.1] Đồng bộ Strava
                  </button>
                  <button
                    onClick={() => navigate('dashboard', 'section-1-2')}
                    className="block w-full text-left py-1 text-slate-600 hover:text-[#FF5B26] font-medium"
                  >
                    • [1.2] Chỉ tiêu tuần
                  </button>
                  <button
                    onClick={() => navigate('dashboard', 'section-1-3')}
                    className="block w-full text-left py-1 text-rose-600 hover:text-rose-700 font-semibold"
                  >
                    • [1.3] Cảnh báo phạt sớm
                  </button>
                  <button
                    onClick={() => navigate('dashboard', 'section-1-4')}
                    className="block w-full text-left py-1 text-slate-600 hover:text-[#FF5B26] font-medium"
                  >
                    • [1.4] Carousel giải đấu
                  </button>
                  <button
                    onClick={() => navigate('dashboard', 'section-1-5')}
                    className="block w-full text-left py-1 text-slate-600 hover:text-[#FF5B26] font-medium"
                  >
                    • [1.5] Lối tắt quét QR / Vào giải
                  </button>
                </div>
              )}
            </div>

            {/* [2.0] Đấu Trường Giải */}
            <div className="rounded-2xl overflow-hidden">
              <button
                onClick={() => navigate('arena')}
                className={`w-full p-2.5 rounded-2xl flex items-center justify-between font-bold text-left transition ${
                  activeTab === 'arena'
                    ? 'bg-[#18181B] text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
                title="[2.0] Đấu Trường Giải"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">🏆</span>
                  {!collapsed && <span>[2.0] Đấu Trường Giải</span>}
                </div>
                {!collapsed && <span className="text-[10px] text-slate-400">▾</span>}
              </button>
              {!collapsed && (
                <div className="pl-6 pr-2 py-1.5 space-y-1 bg-slate-50/70 border-l-2 border-slate-300 ml-3 mt-1 rounded-r-xl text-[11px]">
                  <button
                    onClick={() => navigate('arena', 'section-2-1')}
                    className="block w-full text-left py-1 text-slate-600 hover:text-[#FF5B26] font-medium"
                  >
                    • [2.1] Hero & Đếm ngược
                  </button>
                  <button
                    onClick={() => navigate('arena', 'section-2-2')}
                    className="block w-full text-left py-1 text-slate-600 hover:text-[#FF5B26] font-medium"
                  >
                    • [2.2] BXH Đội (Hạng 1 & 2)
                  </button>
                  <button
                    onClick={() => navigate('arena', 'section-2-3')}
                    className="block w-full text-left py-1 text-slate-600 hover:text-[#FF5B26] font-medium"
                  >
                    • [2.3] BXH Cá nhân (Áo SARC)
                  </button>
                  <button
                    onClick={() => navigate('arena', 'section-2-4')}
                    className="block w-full text-left py-1 text-slate-600 hover:text-[#FF5B26] font-medium"
                  >
                    • [2.4] Đội thi của tôi
                  </button>
                  <button
                    onClick={() => navigate('arena', 'section-2-5')}
                    className="block w-full text-left py-1 text-emerald-600 font-semibold"
                  >
                    • [2.5] Luồng Live SSE
                  </button>
                </div>
              )}
            </div>

            {/* [3.0] Nhật Ký Bài Chạy */}
            <div className="rounded-2xl overflow-hidden">
              <button
                onClick={() => navigate('activities')}
                className={`w-full p-2.5 rounded-2xl flex items-center justify-between font-bold text-left transition ${
                  activeTab === 'activities'
                    ? 'bg-[#18181B] text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
                title="[3.0] Nhật Ký Bài Chạy"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">📋</span>
                  {!collapsed && <span>[3.0] Nhật Ký Bài Chạy</span>}
                </div>
                {!collapsed && <span className="text-[10px] text-slate-400">▾</span>}
              </button>
              {!collapsed && (
                <div className="pl-6 pr-2 py-1.5 space-y-1 bg-slate-50/70 border-l-2 border-slate-300 ml-3 mt-1 rounded-r-xl text-[11px]">
                  <button
                    onClick={() => navigate('activities', 'section-3-1')}
                    className="block w-full text-left py-1 text-slate-600 hover:text-[#FF5B26] font-medium"
                  >
                    • [3.1] Toàn bộ bài chạy
                  </button>
                  <button
                    onClick={() => navigate('activities', 'section-3-2')}
                    className="block w-full text-left py-1 text-slate-600 hover:text-[#FF5B26] font-medium"
                  >
                    • [3.2] Lọc theo giải đấu
                  </button>
                  <button
                    onClick={() => navigate('activities', 'section-3-3')}
                    className="block w-full text-left py-1 text-slate-600 hover:text-[#FF5B26] font-medium"
                  >
                    • [3.3] Chi tiết thẩm định & Gain
                  </button>
                  <button
                    onClick={() => navigate('activities', 'section-3-4')}
                    className="block w-full text-left py-1 text-[#FF5B26] font-semibold"
                  >
                    • [3.4] Gửi khiếu nại (Drawer)
                  </button>
                </div>
              )}
            </div>

            {/* [4.0] Không Gian CLB */}
            <div className="rounded-2xl overflow-hidden">
              <button
                onClick={() => navigate('club')}
                className={`w-full p-2.5 rounded-2xl flex items-center justify-between font-bold text-left transition ${
                  activeTab === 'club'
                    ? 'bg-[#18181B] text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
                title="[4.0] Không Gian CLB"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">👥</span>
                  {!collapsed && <span>[4.0] Không Gian CLB</span>}
                </div>
                {!collapsed && <span className="text-[10px] text-slate-400">▾</span>}
              </button>
              {!collapsed && (
                <div className="pl-6 pr-2 py-1.5 space-y-1 bg-slate-50/70 border-l-2 border-slate-300 ml-3 mt-1 rounded-r-xl text-[11px]">
                  <button
                    onClick={() => navigate('club', 'section-4-1')}
                    className="block w-full text-left py-1 text-slate-600 hover:text-[#FF5B26] font-medium"
                  >
                    • [4.1] Hồ sơ & Bảng tin CLB
                  </button>
                  <button
                    onClick={() => navigate('club', 'section-4-2')}
                    className="block w-full text-left py-1 text-slate-600 hover:text-[#FF5B26] font-medium"
                  >
                    • [4.2] Danh mục giải CLB
                  </button>
                  <button
                    onClick={() => navigate('club', 'section-4-3')}
                    className="block w-full text-left py-1 text-slate-600 hover:text-[#FF5B26] font-medium"
                  >
                    • [4.3] Thành viên & Ban cán sự
                  </button>
                  <button
                    onClick={() => navigate('club', 'section-4-4')}
                    className="block w-full text-left py-1 text-amber-600 font-semibold"
                  >
                    • [4.4] Mời TV (Chống In-App)
                  </button>
                </div>
              )}
            </div>

            {/* [5.0] Cá Nhân & Sổ Nợ */}
            <div className="rounded-2xl overflow-hidden">
              <button
                onClick={() => navigate('finance')}
                className={`w-full p-2.5 rounded-2xl flex items-center justify-between font-bold text-left transition ${
                  activeTab === 'finance'
                    ? 'bg-[#18181B] text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
                title="[5.0] Cá Nhân & Cài Đặt"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">💳</span>
                  {!collapsed && <span>[5.0] Cá Nhân & Sổ Nợ</span>}
                </div>
                {!collapsed && <span className="text-[10px] text-slate-400">▾</span>}
              </button>
              {!collapsed && (
                <div className="pl-6 pr-2 py-1.5 space-y-1 bg-slate-50/70 border-l-2 border-slate-300 ml-3 mt-1 rounded-r-xl text-[11px]">
                  <button
                    onClick={() => navigate('finance', 'section-5-1')}
                    className="block w-full text-left py-1 text-slate-600 hover:text-[#FF5B26] font-medium"
                  >
                    • [5.1] Tài khoản & Đồng ý NĐ13
                  </button>
                  <button
                    onClick={() => navigate('finance', 'section-5-2')}
                    className="block w-full text-left py-1 text-slate-600 hover:text-[#FF5B26] font-medium"
                  >
                    • [5.2] Kết nối OAuth Strava
                  </button>
                  <button
                    onClick={() => navigate('finance', 'section-5-3')}
                    className="block w-full text-left py-1 text-slate-600 hover:text-[#FF5B26] font-medium"
                  >
                    • [5.3] Sổ nợ phạt & VietQR
                  </button>
                  <button
                    onClick={() => navigate('finance', 'section-5-4')}
                    className="block w-full text-left py-1 text-slate-600 hover:text-[#FF5B26] font-medium"
                  >
                    • [5.4] Tuỳ chọn Dark/Light
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2: CLUB MANAGEMENT (6.0 - 7.0) */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            {!collapsed && (
              <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Ban Quản Trị CLB</span>
                <span className="text-[9px] text-slate-400">6.0 - 7.0</span>
              </div>
            )}

            {/* [6.0] Quản Trị CLB */}
            <div className="rounded-2xl overflow-hidden">
              <button
                onClick={() => navigate('club-manage')}
                className={`w-full p-2.5 rounded-2xl flex items-center justify-between font-bold text-left transition ${
                  activeTab === 'club-manage'
                    ? 'bg-[#18181B] text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
                title="[6.0] Quản Trị CLB"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">🏢</span>
                  {!collapsed && <span>[6.0] Quản Trị CLB</span>}
                </div>
                {!collapsed && <span className="text-[10px] text-slate-400">▾</span>}
              </button>
              {!collapsed && (
                <div className="pl-6 pr-2 py-1.5 space-y-1 bg-slate-50/70 border-l-2 border-slate-300 ml-3 mt-1 rounded-r-xl text-[11px]">
                  <button
                    onClick={() => navigate('club-manage', 'section-6-1')}
                    className="block w-full text-left py-1 text-slate-600 hover:text-[#FF5B26] font-medium"
                  >
                    • [6.1] Thông tin & Tài khoản VietQR
                  </button>
                  <button
                    onClick={() => navigate('club-manage', 'section-6-2')}
                    className="block w-full text-left py-1 text-slate-600 hover:text-[#FF5B26] font-medium"
                  >
                    • [6.2] Duyệt & Khóa thành viên
                  </button>
                  <button
                    onClick={() => navigate('club-manage', 'section-6-3')}
                    className="block w-full text-left py-1 text-slate-600 hover:text-[#FF5B26] font-medium"
                  >
                    • [6.3] Tạo & Quản lý mã mời
                  </button>
                </div>
              )}
            </div>

            {/* [7.0] Quản Trị Giải Đấu */}
            <div className="rounded-2xl overflow-hidden">
              <button
                onClick={() => navigate('rules')}
                className={`w-full p-2.5 rounded-2xl flex items-center justify-between font-bold text-left transition ${
                  activeTab === 'rules'
                    ? 'bg-[#18181B] text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
                title="[7.0] Quản Trị Giải Đấu"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">⚙️</span>
                  {!collapsed && <span>[7.0] Quản Trị Giải Đấu</span>}
                </div>
                {!collapsed && <span className="text-[10px] text-slate-400">▾</span>}
              </button>
              {!collapsed && (
                <div className="pl-6 pr-2 py-1.5 space-y-1 bg-slate-50/70 border-l-2 border-slate-300 ml-3 mt-1 rounded-r-xl text-[11px]">
                  <button
                    onClick={() => navigate('rules', 'section-7-1')}
                    className="block w-full text-left py-1 text-slate-600 hover:text-[#FF5B26] font-medium"
                  >
                    • [7.1] Wizard Thể lệ 7 bước
                  </button>
                  <button
                    onClick={() => navigate('rules', 'section-7-2')}
                    className="block w-full text-left py-1 text-slate-600 hover:text-[#FF5B26] font-medium"
                  >
                    • [7.2] Phân bổ Đội & Đội trưởng
                  </button>
                  <button
                    onClick={() => navigate('rules', 'section-7-3')}
                    className="block w-full text-left py-1 text-slate-600 hover:text-[#FF5B26] font-medium"
                  >
                    • [7.3] Thẩm định khiếu nại
                  </button>
                  <button
                    onClick={() => navigate('rules', 'section-7-4')}
                    className="block w-full text-left py-1 text-slate-600 hover:text-[#FF5B26] font-medium"
                  >
                    • [7.4] Miễn trừ phạt tuần
                  </button>
                  <button
                    onClick={() => navigate('rules', 'section-7-5')}
                    className="block w-full text-left py-1 text-slate-600 hover:text-[#FF5B26] font-medium"
                  >
                    • [7.5] Quản lý quỹ & VietQR
                  </button>
                  <button
                    onClick={() => navigate('rules', 'section-7-6')}
                    className="block w-full text-left py-1 text-slate-600 hover:text-[#FF5B26] font-medium"
                  >
                    • [7.6] Xuất dữ liệu Excel/CSV
                  </button>
                  <button
                    onClick={() => navigate('rules', 'section-7-7')}
                    className="block w-full text-left py-1 text-slate-600 hover:text-[#FF5B26] font-medium"
                  >
                    • [7.7] Chốt giải & Đóng băng
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3: SUPER ADMIN (8.0) */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            {!collapsed && (
              <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Toàn Sàn OpenRace</span>
                <span className="text-[9px] text-[#FF5B26] font-bold">8.0</span>
              </div>
            )}

            {/* [8.0] Hệ Thống Toàn Sàn */}
            <div className="rounded-2xl overflow-hidden">
              <button
                onClick={() => navigate('admin')}
                className={`w-full p-2.5 rounded-2xl flex items-center justify-between font-bold text-left transition ${
                  activeTab === 'admin'
                    ? 'bg-[#18181B] text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
                title="[8.0] Hệ Thống Toàn Sàn"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">🛡️</span>
                  {!collapsed && <span>[8.0] Toàn Sàn OpenRace</span>}
                </div>
                {!collapsed && (
                  <span className="w-2 h-2 rounded-full bg-[#FF5B26] animate-pulse"></span>
                )}
              </button>
              {!collapsed && (
                <div className="pl-6 pr-2 py-1.5 space-y-1 bg-slate-50/70 border-l-2 border-slate-300 ml-3 mt-1 rounded-r-xl text-[11px]">
                  <button
                    onClick={() => navigate('admin', 'section-8-1')}
                    className="block w-full text-left py-1 text-slate-600 hover:text-[#FF5B26] font-medium"
                  >
                    • [8.1] Giám sát Strava Quota
                  </button>
                  <button
                    onClick={() => navigate('admin', 'section-8-2')}
                    className="block w-full text-left py-1 text-slate-600 hover:text-[#FF5B26] font-medium"
                  >
                    • [8.2] Webhook & Dead-letter
                  </button>
                  <button
                    onClick={() => navigate('admin', 'section-8-3')}
                    className="block w-full text-left py-1 text-slate-600 hover:text-[#FF5B26] font-medium"
                  >
                    • [8.3] Quản lý CLB / Tenant
                  </button>
                  <button
                    onClick={() => navigate('admin', 'section-8-4')}
                    className="block w-full text-left py-1 text-slate-600 hover:text-[#FF5B26] font-medium"
                  >
                    • [8.4] Recompute & Replay
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>

      {/* Bottom Profile / Support Bar */}
      {!collapsed ? (
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>API Online</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="hover:text-slate-800 transition">❓ Trợ giúp</button>
            <button className="hover:text-red-500 transition">🚪 Thoát</button>
          </div>
        </div>
      ) : (
        <div className="pt-4 border-t border-slate-100 flex flex-col items-center gap-2 text-xs text-slate-400">
          <button className="hover:text-slate-800 transition" title="Trợ giúp">
            ❓
          </button>
          <button className="hover:text-red-500 transition" title="Đăng xuất">
            🚪
          </button>
        </div>
      )}
    </aside>
  );
};

