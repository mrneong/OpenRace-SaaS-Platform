'use client';

import React from 'react';

export type NavTab =
  | 'dashboard'
  | 'arena'
  | 'activities'
  | 'club'
  | 'finance'
  | 'club-manage'
  | 'rules'
  | 'admin';

interface NavigationMenuProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingAppealsCount?: number;
}

export const NavigationMenu: React.FC<NavigationMenuProps> = ({
  activeTab,
  onSelectTab,
  pendingAppealsCount = 1,
}) => {
  const tabs = [
    { id: 'dashboard' as NavTab, label: '[1.0] Runner Hub', icon: '📊', badge: null },
    { id: 'arena' as NavTab, label: '[2.0] Đấu Trường', icon: '🏆', badge: 'Live' },
    { id: 'activities' as NavTab, label: '[3.0] Nhật Ký', icon: '📋', badge: null },
    { id: 'club' as NavTab, label: '[4.0] Không Gian CLB', icon: '👥', badge: null },
    { id: 'finance' as NavTab, label: '[5.0] Cá Nhân & Sổ Nợ', icon: '💰', badge: 'VietQR' },
    { id: 'club-manage' as NavTab, label: '[6.0] Quản Trị CLB', icon: '🏢', badge: null },
    { id: 'rules' as NavTab, label: '[7.0] Quản Trị Giải', icon: '⚙️', badge: null },
    {
      id: 'admin' as NavTab,
      label: '[8.0] Super Admin',
      icon: '🛡️',
      badge: pendingAppealsCount > 0 ? `${pendingAppealsCount} chờ` : null,
      badgeColor: 'bg-red-500/10 text-red-400 border-red-500/20',
    },
  ];

  return (
    <nav
      className="sticky top-16 z-40 h-12 w-full bg-[#131926]/95 backdrop-blur-sm border-b border-[#26334A] px-4 flex items-center gap-6 overflow-x-auto no-scrollbar"
      aria-label="Comprehensive 8-Subsystem Navigation"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            data-active={isActive ? 'true' : 'false'}
            className={`h-full flex items-center gap-2 text-xs md:text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-[1px] ${
              isActive
                ? 'border-[#FF5B26] text-[#FF5B26] font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.badge && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider border ${
                  isActive
                    ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                    : tab.badgeColor || 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
