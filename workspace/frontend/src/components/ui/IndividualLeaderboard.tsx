'use client';

import React, { useState } from 'react';
import { useRace } from '../../context/RaceContext';

export interface RunnerRecord {
  id: string;
  name: string;
  team: string;
  rank: number;
  delta: number; // +1, -1, 0
  totalKm: number;
  diligentDays: number;
  avgPace: string;
  isSelf?: boolean;
}

export function IndividualLeaderboard() {
  const { teams } = useRace();
  const [activeView, setActiveView] = useState<'team' | 'individual'>('individual');

  const runners: RunnerRecord[] = [
    {
      id: 'r1',
      name: 'Trần Văn Nam',
      team: 'Team Phoenix SARC',
      rank: 1,
      delta: 0,
      totalKm: 142.5,
      diligentDays: 24,
      avgPace: '5:12',
    },
    {
      id: 'r2',
      name: 'Lê Hoàng Yến',
      team: 'Team Dragons SADC',
      rank: 2,
      delta: 1,
      totalKm: 135.0,
      diligentDays: 22,
      avgPace: '5:24',
    },
    {
      id: 'r3',
      name: 'Nguyễn Văn A',
      team: 'Team Phoenix SARC',
      rank: 3,
      delta: -1,
      totalKm: 128.4,
      diligentDays: 21,
      avgPace: '5:35',
      isSelf: true,
    },
    {
      id: 'r4',
      name: 'Phạm Minh Đức',
      team: 'Team Tigers SADC',
      rank: 4,
      delta: 2,
      totalKm: 119.2,
      diligentDays: 20,
      avgPace: '5:48',
    },
    {
      id: 'r5',
      name: 'Võ Thị Mai',
      team: 'Team Dragons SADC',
      rank: 5,
      delta: 0,
      totalKm: 112.8,
      diligentDays: 19,
      avgPace: '6:02',
    },
  ];

  const selfRunner = runners.find((r) => r.isSelf) || runners[2];

  return (
    <div className="space-y-5">
      {/* HEADER WITH SEGMENTED SWITCH */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF5B26]">Sàn Đấu Bảng Xếp Hạng (UI-2)</span>
            {/* SSE Live Indicator */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              SSE Live Stream
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">Mùa 10 Run to Techcombank 2026</h2>
          <p className="text-xs text-slate-500 mt-1">
            Dữ liệu đồng bộ tức thời từ Strava Webhook • Đã lọc gian lận với System Pace Floor Lock 2:45
          </p>
        </div>

        {/* Segmented View Switch */}
        <div className="inline-flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shrink-0">
          <button
            onClick={() => setActiveView('team')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
              activeView === 'team'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Bảng Xếp Hạng Đội
          </button>
          <button
            onClick={() => setActiveView('individual')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
              activeView === 'individual'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Bảng Xếp Hạng Cá Nhân
          </button>
        </div>
      </div>

      {/* TEAM LEADERBOARD VIEW */}
      {activeView === 'team' && (
        <div className="space-y-3">
          {teams.map((t, idx) => {
            const isRank1 = t.rank === 1;
            return (
              <div
                key={t.id}
                className={`p-5 rounded-3xl transition relative overflow-hidden ${
                  isRank1
                    ? 'bg-white border-2 border-amber-400 shadow-[0_8px_30px_rgb(251,191,36,0.15)]'
                    : 'bg-white border border-slate-200/80 shadow-sm'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm ${
                        isRank1
                          ? 'bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-900'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isRank1 ? '🥇 1' : '🥈 2'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-slate-900">{t.name}</h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            isRank1 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isRank1 ? 'VÔ ĐỊCH DẪN ĐẦU (100k/người)' : 'Đồng Hạng 2 (200k/người)'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {t.currentMembers}/{t.maxMembers} VĐV • {t.diligentDays} ngày chuyên cần
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-xl font-black text-slate-900 font-mono">
                        {t.totalKm.toFixed(1)} km
                      </div>
                      <div className="text-[11px] text-slate-500">Cự ly tích luỹ</div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-xl font-black font-mono ${
                          isRank1 ? 'text-[#FF5B26]' : 'text-slate-700'
                        }`}
                      >
                        {t.score.toFixed(2)} pts
                      </div>
                      <div className="text-[11px] text-slate-500">Tổng điểm quy đổi</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* INDIVIDUAL LEADERBOARD VIEW */}
      {activeView === 'individual' && (
        <div className="space-y-3 pb-20">
          {runners.map((r) => {
            const isTop1 = r.rank === 1;
            const isSelf = !!r.isSelf;

            return (
              <div
                key={r.id}
                className={`p-4 md:p-5 rounded-3xl transition relative overflow-hidden ${
                  isTop1
                    ? 'bg-white border-2 border-[#CCFF00] shadow-[0_4px_30px_rgb(204,255,0,0.25)] ring-2 ring-lime-400/40'
                    : isSelf
                    ? 'bg-orange-50/40 border-2 border-orange-400/60 shadow-sm'
                    : 'bg-white border border-slate-200/80 shadow-sm'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Rank & Runner Info */}
                  <div className="flex items-center gap-3.5">
                    {/* Rank Badge */}
                    <div
                      className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center font-black ${
                        isTop1
                          ? 'bg-[#18181B] text-[#CCFF00] shadow-sm'
                          : r.rank === 2
                          ? 'bg-slate-200 text-slate-700'
                          : r.rank === 3
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <span className="text-sm">{r.rank}</span>
                      {/* Delta Indicator */}
                      <span className="text-[9px] font-bold">
                        {r.delta > 0 ? `▲+${r.delta}` : r.delta < 0 ? `▼${r.delta}` : '—'}
                      </span>
                    </div>

                    {/* Avatar & Name */}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-extrabold text-slate-900">{r.name}</span>
                        {isSelf && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-100 text-[#FF5B26]">
                            Bạn (Self)
                          </span>
                        )}
                        {isTop1 && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#CCFF00] text-slate-950 uppercase tracking-tight shadow-sm">
                            👑 Dẫn đầu nhận Áo SARC
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {r.team} • {r.diligentDays} ngày chuyên cần
                      </div>
                    </div>
                  </div>

                  {/* Right: Metrics */}
                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
                    <div className="text-left md:text-right">
                      <div className="text-base font-extrabold text-slate-900 font-mono">
                        {r.totalKm.toFixed(1)} <span className="text-xs font-normal text-slate-500">km</span>
                      </div>
                      <div className="text-[11px] text-slate-400">Tổng tích luỹ</div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-bold text-slate-700 font-mono">
                        {r.avgPace} <span className="text-xs font-normal text-slate-400">/km</span>
                      </div>
                      <div className="text-[11px] text-slate-400">Pace TB</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* STICKY SELF ROW PINNED TO VIEWPORT BOTTOM */}
      <div className="fixed bottom-4 left-4 right-4 md:left-24 md:right-8 z-40 bg-[#18181B]/95 backdrop-blur-md text-white rounded-2xl p-3.5 px-5 shadow-2xl border border-slate-700/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-orange-500 text-white font-black text-xs flex items-center justify-center">
            #{selfRunner.rank}
          </div>
          <div>
            <div className="text-xs font-bold flex items-center gap-2">
              <span>{selfRunner.name} (Vị trí của bạn)</span>
              <span className="text-[10px] text-orange-400 font-mono">▲ {selfRunner.delta}</span>
            </div>
            <div className="text-[11px] text-slate-400">{selfRunner.team}</div>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="text-right">
            <div className="text-xs font-bold text-white font-mono">{selfRunner.totalKm.toFixed(1)} km</div>
            <div className="text-[10px] text-slate-400">Cự ly</div>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-white font-mono">{selfRunner.avgPace} /km</div>
            <div className="text-[10px] text-slate-400">Pace TB</div>
          </div>
        </div>
      </div>
    </div>
  );
}

