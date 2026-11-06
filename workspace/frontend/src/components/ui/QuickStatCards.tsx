'use client';

import React from 'react';
import { useRace } from '../../context/RaceContext';

export const QuickStatCards: React.FC = () => {
  const { teams } = useRace();
  const phoenix = teams.find((t) => t.id === 'team-phoenix') || teams[0];
  const totalKm = phoenix ? phoenix.totalKm : 1250;
  const diligentDays = phoenix ? phoenix.diligentDays : 118;

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* 1. Highlight Orange Card */}
      <div className="bg-gradient-to-tr from-[#FF5B26] to-[#FF7B4C] text-white p-5 rounded-3xl shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs font-medium text-white/90">
          <span>Tổng Cự Ly Đội Dẫn Đầu</span>
          <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">🏃</span>
        </div>
        <div className="text-3xl font-extrabold font-mono tracking-tight">
          {totalKm.toFixed(0)} <span className="text-sm font-normal text-white/80">KM</span>
        </div>
        <div className="text-[11px] text-white/90 flex items-center gap-1 font-medium">
          <span>{phoenix?.name || 'Team Phoenix SARC'}</span>
        </div>
      </div>

      {/* 2. White Card: Tiền Quỹ */}
      <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-3">
        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
          <span>Tiền Đóng Quỹ Dự Kiến</span>
          <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-400">ℹ️</span>
        </div>
        <div className="text-3xl font-extrabold font-mono text-slate-900 tracking-tight">
          100k <span className="text-sm font-normal text-slate-400">VND</span>
        </div>
        <div className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
          <span>✓ Bậc Hạng 1</span>
          <span className="text-slate-400">Vô Địch</span>
        </div>
      </div>

      {/* 3. White Card: Ngày Chuyên Cần */}
      <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-3">
        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
          <span>Ngày Chuyên Cần</span>
          <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-400">📅</span>
        </div>
        <div className="text-3xl font-extrabold font-mono text-slate-900 tracking-tight">
          {diligentDays} <span className="text-sm font-normal text-slate-400">/ 140</span>
        </div>
        <div className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
          <span>↑ 8.43 pts</span>
          <span className="text-slate-400">điểm ngày</span>
        </div>
      </div>

      {/* 4. White Card: Thưởng Dốc Trail */}
      <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-3">
        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
          <span>Thưởng Dốc Trail</span>
          <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-400">⛰️</span>
        </div>
        <div className="text-3xl font-extrabold font-mono text-slate-900 tracking-tight">
          +2.0 <span className="text-sm font-normal text-slate-400">KM</span>
        </div>
        <div className="text-[11px] text-[#FF5B26] flex items-center gap-1 font-medium">
          <span>↑ Gain 260m</span>
          <span className="text-slate-400">đạt chuẩn</span>
        </div>
      </div>
    </div>
  );
};

