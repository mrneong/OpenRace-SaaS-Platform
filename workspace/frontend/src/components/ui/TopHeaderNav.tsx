'use client';

import React from 'react';
import type { NavTab } from './NavigationMenu';

interface TopHeaderNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingAppealsCount?: number;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export const TopHeaderNav: React.FC<TopHeaderNavProps> = ({
  activeTab,
  onSelectTab,
  pendingAppealsCount = 1,
  sidebarOpen = true,
  onToggleSidebar,
}) => {
  const tabs: { id: NavTab; label: string; code: string; badge?: string }[] = [
    { id: 'dashboard', code: '[1.0]', label: 'Runner Hub' },
    { id: 'arena', code: '[2.0]', label: 'Đấu Trường' },
    { id: 'activities', code: '[3.0]', label: 'Nhật Ký' },
    { id: 'club', code: '[4.0]', label: 'CLB Hub' },
    { id: 'finance', code: '[5.0]', label: 'Cá Nhân' },
    { id: 'club-manage', code: '[6.0]', label: 'QL CLB' },
    { id: 'rules', code: '[7.0]', label: 'Quy Chế' },
    { id: 'admin', code: '[8.0]', label: 'Admin', badge: pendingAppealsCount > 0 ? `${pendingAppealsCount}` : undefined },
  ];

  return (
    <header className="h-16 w-full px-4 lg:px-8 flex items-center justify-between border-b border-slate-200/50 bg-white/70 backdrop-blur-md sticky top-0 z-40">
      {/* Brand Logo & Sidebar Toggle */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="w-9 h-9 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition shadow-sm"
            title="Đóng / Mở Menu Cây"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#FF5B26] to-[#FF8254] flex items-center justify-center text-white shadow-md shadow-orange-500/20 font-black text-xs">
          OR
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-black tracking-tight text-slate-900">OpenRace</span>
          <span className="text-[9px] font-bold uppercase tracking-widest text-[#FF5B26]">SaaS</span>
        </div>
      </div>

      {/* Floating Center Segmented Pill Nav with Explicit Codes [1.0] -> [8.0] */}
      <nav className="flex items-center bg-white/90 border border-slate-200/80 rounded-full p-1 shadow-sm overflow-x-auto max-w-2xl no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`px-2.5 py-1.5 rounded-full text-xs font-bold transition shrink-0 flex items-center gap-1 ${
                isActive
                  ? 'bg-[#18181B] text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className={isActive ? 'text-[#FF8254]' : 'text-slate-400 font-mono text-[10px]'}>
                {tab.code}
              </span>
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="w-2 h-2 rounded-full bg-[#FF5B26] animate-pulse"></span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Right Controls & User Profile Pill */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1 bg-white border border-slate-200/80 rounded-full p-1 shadow-sm">
          <button className="w-7 h-7 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 text-xs" title="Tìm kiếm">
            🔍
          </button>
          <button className="w-7 h-7 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 text-xs relative" title="Thông báo">
            🔔
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-orange-500"></span>
          </button>
          <button className="w-7 h-7 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 text-xs" title="Thông tin">
            ℹ️
          </button>
        </div>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2.5 bg-white border border-slate-200/80 rounded-full py-1 px-3 shadow-sm cursor-pointer hover:border-slate-300 transition">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-orange-400 to-amber-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">
            NA
          </div>
          <div className="hidden xl:block text-left text-xs leading-tight">
            <div className="font-bold text-slate-800">Nguyễn Văn A</div>
            <div className="text-[10px] text-slate-400">athlete.nguyen@sarc.vn</div>
          </div>
          <span className="text-slate-400 text-xs">▾</span>
        </div>
      </div>
    </header>
  );
};
