'use client';

import React, { useState } from 'react';
import { useRace } from '../../context/RaceContext';

export const KeyMetricCard: React.FC<{ onTransferClick: () => void; onRequestClick: () => void }> = ({
  onTransferClick,
  onRequestClick,
}) => {
  const [unit, setUnit] = useState<'KM' | 'VND'>('KM');
  const { teams } = useRace();
  const totalKm = teams.reduce((acc, t) => acc + t.totalKm, 0);

  return (
    <div className="space-y-4">
      {/* Total Balance / Distance Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">
            {unit === 'KM' ? 'Tổng Cự Ly Giải Đấu' : 'Tổng Quỹ Giải Đấu'}
          </span>
          <button
            onClick={() => setUnit(unit === 'KM' ? 'VND' : 'KM')}
            className="flex items-center gap-1 text-xs font-mono font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full transition"
          >
            <span>{unit === 'KM' ? '🏃 KM' : '🇻🇳 VND'}</span>
            <span className="text-[10px]">▾</span>
          </button>
        </div>

        <div>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-900 tracking-tight">
            {unit === 'KM' ? totalKm.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '9,600,000'}
            <span className="text-sm font-normal text-slate-400 ml-1.5">{unit}</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <span>↑ 5%</span>
            <span className="text-slate-400">so với tuần trước</span>
          </div>
        </div>

        {/* Dual Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={onTransferClick}
            className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-full text-xs font-bold bg-[#18181B] hover:bg-slate-800 text-white shadow-sm transition"
          >
            <span>⇆</span>
            <span>Nộp Quỹ</span>
          </button>
          <button
            onClick={onRequestClick}
            className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-full text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition"
          >
            <span>⇆</span>
            <span>Khiếu Nại</span>
          </button>
        </div>

        {/* Wallets / Teams List */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Đội Thi | Tổng 3 Đội</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-left">
              <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> Phoenix
              </div>
              <div className="text-xs font-bold font-mono text-slate-900 mt-1">1,250 km</div>
              <div className="text-[9px] text-emerald-600 font-semibold mt-0.5">Top 1</div>
            </div>

            <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-left">
              <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Dragons
              </div>
              <div className="text-xs font-bold font-mono text-slate-900 mt-1">1,000 km</div>
              <div className="text-[9px] text-amber-600 font-semibold mt-0.5">Hạng 2</div>
            </div>

            <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-left">
              <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span> Tigers
              </div>
              <div className="text-xs font-bold font-mono text-slate-900 mt-1">920 km</div>
              <div className="text-[9px] text-amber-600 font-semibold mt-0.5">Hạng 2</div>
            </div>
          </div>
        </div>
      </div>

      {/* Target Progress Card (Monthly Spending Limit style) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800">Chỉ Tiêu Chu Kỳ Tuần (Target Limit)</h4>
          <span className="text-[10px] font-mono font-bold bg-orange-50 text-[#FF5B26] px-2 py-0.5 rounded-full">
            Còn 2 ngày
          </span>
        </div>

        {/* Dual-tone Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 flex">
          <div
            className="bg-[#FF5B26] h-full rounded-full transition-all duration-500 shadow-sm"
            style={{ width: '92.5%' }}
          ></div>
        </div>

        <div className="flex items-center justify-between text-xs font-mono text-slate-500">
          <span className="font-bold text-slate-900">18.5 km <span className="font-normal text-slate-400">hoàn thành</span></span>
          <span>Chỉ tiêu: 20.0 km</span>
        </div>

        <div className="text-[11px] text-red-500 bg-red-50/70 p-2 rounded-xl flex items-center justify-between">
          <span>Cảnh báo phạt nếu thiếu chỉ tiêu:</span>
          <strong className="font-mono font-bold">50.000đ</strong>
        </div>
      </div>
    </div>
  );
};

