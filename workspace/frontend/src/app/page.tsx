'use client';

import React, { useState } from 'react';
import { SlimSidebar } from '../components/ui/SlimSidebar';
import { TopHeaderNav } from '../components/ui/TopHeaderNav';
import { KeyMetricCard } from '../components/ui/KeyMetricCard';
import { QuickStatCards } from '../components/ui/QuickStatCards';
import { ActivitiesTable } from '../components/ui/ActivitiesTable';
import { PerformanceChart } from '../components/ui/PerformanceChart';
import { RunnerPassCard } from '../components/ui/RunnerPassCard';
import { LeaderboardCard } from '../components/ui/LeaderboardCard';
import { ClubInviteCard } from '../components/ui/ClubInviteCard';
import { FinanceLedgerCard } from '../components/ui/FinanceLedgerCard';
import { RuleEngineSimulator } from '../components/ui/RuleEngineSimulator';
import { RaceRuleWizard } from '../components/ui/RaceRuleWizard';
import { ClubHubOnboarding } from '../components/ui/ClubHubOnboarding';
import { IndividualLeaderboard } from '../components/ui/IndividualLeaderboard';
import { AdminDashboard } from '../components/ui/AdminDashboard';
import { AthleteRegistrationModal } from '../components/ui/AthleteRegistrationModal';
import { RaceProvider, useRace } from '../context/RaceContext';
import type { NavTab } from '../components/ui/NavigationMenu';

function HomePageContent() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [ruleMode, setRuleMode] = useState<'wizard' | 'simulator'>('wizard');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const { appeals } = useRace();
  const pendingAppealsCount = appeals.filter((a) => a.status === 'PENDING').length;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="flex min-h-screen bg-[#F4F5F7] text-slate-800 antialiased font-sans selection:bg-orange-500 selection:text-white">
      {/* 1. SLIM LEFT ICON SIDEBAR (Image Reference Style) */}
      <SlimSidebar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-10">
        {/* 2. TOP HEADER NAV WITH FLOATING PILL SEGMENTED CONTROL */}
        <TopHeaderNav
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          pendingAppealsCount={pendingAppealsCount}
        />

        {/* Global Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#18181B] text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2">
            <span>✓</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 3. GREETING & CONTEXT HEADER */}
        <section className="px-4 lg:px-8 pt-4 pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              Good morning, Nguyễn Văn A
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Theo dõi chỉ tiêu tuần, tiến độ cự ly giải Mùa 10 Run to Techcombank 2026 • Đội Phoenix SARC (Hạng 1)
            </p>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="self-start sm:self-auto px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <span>🏃 Cổng Đăng Ký Vận Động Viên</span>
          </button>
        </section>

        {/* 4. DYNAMIC VIEW ACCORDING TO ACTIVE TAB */}
        <main className="px-4 lg:px-8 py-4 flex-1">
          {/* TAB 1: OVERVIEW / MODERN DASHBOARD (IMAGE REFERENCE 3-COLUMN LAYOUT) */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* COLUMN 1: LEFT (~30% / 4 Cols) */}
              <div className="lg:col-span-4 space-y-5">
                <KeyMetricCard
                  onTransferClick={() => setActiveTab('finance')}
                  onRequestClick={() => setActiveTab('activities')}
                />
                <RunnerPassCard />
              </div>

              {/* COLUMN 2: MIDDLE (~40% / 5 Cols) */}
              <div className="lg:col-span-5 space-y-5">
                <QuickStatCards />
                <ActivitiesTable
                  onAppealClick={(act) => {
                    setActiveTab('activities');
                    showToast(`Mở khiếu nại cho bài: ${act.title}`);
                  }}
                />
              </div>

              {/* COLUMN 3: RIGHT (~30% / 3 Cols) */}
              <div className="lg:col-span-3 space-y-5">
                <PerformanceChart />

                {/* Quick VietQR Dynamic Pay Card */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-3 text-center">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">VietQR Nộp Quỹ Tức Thì</span>
                    <span className="text-[10px] font-bold bg-orange-50 text-[#FF5B26] px-2 py-0.5 rounded-full">
                      Auto Fill
                    </span>
                  </div>
                  <div className="w-36 h-36 mx-auto bg-white p-2.5 rounded-2xl border-2 border-orange-500/30 shadow-sm flex items-center justify-center">
                    <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                      <path d="M10 10h30v30h-30z m10 10h10v10h-10z M60 10h30v30h-30z m10 10h10v10h-10z M10 60h30v30h-30z m10 10h10v10h-10z M60 60h10v10h-10z M80 60h10v10h-10z M70 70h10v10h-10z M60 80h10v10h-10z M80 80h10v10h-10z"/>
                    </svg>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Số tiền: <strong className="text-slate-900 font-mono">100.000đ</strong> • Đội Hạng 1
                  </div>
                  <button
                    onClick={() => setActiveTab('finance')}
                    className="w-full py-2 rounded-xl text-xs font-semibold bg-[#18181B] hover:bg-slate-800 text-white transition shadow-sm"
                  >
                    Xem chi tiết sổ cái →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RACE ARENA (UI-2) */}
          {activeTab === 'arena' && (
            <div className="max-w-4xl mx-auto">
              <IndividualLeaderboard />
            </div>
          )}

          {/* TAB 3: ACTIVITIES (UI-3) */}
          {activeTab === 'activities' && (
            <div className="max-w-4xl mx-auto space-y-5">
              <ActivitiesTable
                onAppealClick={(act) => {
                  showToast(`Đã ghi nhận yêu cầu khiếu nại cho bài: ${act.title}`);
                }}
              />
            </div>
          )}

          {/* TAB 4: CLUB & TEAMS (UI-4) */}
          {activeTab === 'club' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <ClubHubOnboarding
                onSuccess={() => {
                  showToast('Đăng ký đội thi thành công! Đã kích hoạt VĐV.');
                  setActiveTab('dashboard');
                }}
              />
              <ClubInviteCard />
            </div>
          )}

          {/* TAB 5: FINANCIALS (UI-5) */}
          {activeTab === 'finance' && (
            <div className="max-w-4xl mx-auto">
              <FinanceLedgerCard />
            </div>
          )}

          {/* TAB 6: RULE ENGINE CONFIGURATOR & SIMULATOR (UI-6) */}
          {activeTab === 'rules' && (
            <div className="max-w-5xl mx-auto space-y-4">
              <div className="flex justify-end">
                <div className="inline-flex bg-white p-1 rounded-2xl border border-slate-200/80 shadow-xs">
                  <button
                    onClick={() => setRuleMode('wizard')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      ruleMode === 'wizard' ? 'bg-[#18181B] text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Wizard 7 Bước (doc01.md)
                  </button>
                  <button
                    onClick={() => setRuleMode('simulator')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      ruleMode === 'simulator' ? 'bg-[#18181B] text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Mô Phỏng Trực Tiếp
                  </button>
                </div>
              </div>

              {ruleMode === 'wizard' ? (
                <RaceRuleWizard
                  onPublish={() => {
                    showToast('Đã ban hành bộ luật giải chạy thành công!');
                    setRuleMode('simulator');
                  }}
                />
              ) : (
                <RuleEngineSimulator />
              )}
            </div>
          )}

          {/* TAB 7: ADMIN CONSOLE */}
          {activeTab === 'admin' && (
            <div className="max-w-5xl mx-auto">
              <AdminDashboard />
            </div>
          )}
        </main>

        {/* Cổng Đăng Ký Vận Động Viên Modal (NextAuth.js Google OAuth) */}
        <AthleteRegistrationModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={(u) => {
            showToast(`Chào mừng bạn tham gia OpenRace!`);
          }}
        />
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <RaceProvider>
      <HomePageContent />
    </RaceProvider>
  );
}
