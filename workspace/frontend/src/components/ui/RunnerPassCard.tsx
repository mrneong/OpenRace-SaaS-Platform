'use client';

import React from 'react';

export const RunnerPassCard: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">🪪</span>
          <h3 className="text-sm font-bold text-slate-800">Thẻ Thành Viên Giải Đấu</h3>
        </div>
        <button className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition">
          + Cấp thẻ mới
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Dark Charcoal Card */}
        <div className="bg-[#18181B] text-white p-4 rounded-2xl relative overflow-hidden shadow-md space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold bg-white/10 px-2 py-0.5 rounded-full text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Active
            </span>
            <div className="flex -space-x-1.5">
              <span className="w-4 h-4 rounded-full bg-red-500 opacity-90"></span>
              <span className="w-4 h-4 rounded-full bg-amber-400 opacity-90"></span>
            </div>
          </div>

          <div className="pt-2">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">Athlete Pass ID</div>
            <div className="font-mono text-sm tracking-widest text-slate-200 mt-0.5">
              •••• •••• 6782
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono border-t border-white/10 pt-2">
            <div>
              <span className="text-slate-500">MÙA:</span> 10/2026
            </div>
            <div>
              <span className="text-slate-500">ĐỘI:</span> PHOENIX
            </div>
          </div>
        </div>

        {/* Tangerine Orange Card */}
        <div className="bg-gradient-to-tr from-[#FF5B26] to-[#FF8254] text-white p-4 rounded-2xl relative overflow-hidden shadow-md space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold bg-white/20 px-2 py-0.5 rounded-full text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span> Active
            </span>
            <span className="text-xs font-black tracking-tight">SARC</span>
          </div>

          <div className="pt-2">
            <div className="text-[10px] uppercase tracking-wider text-white/80">Napas VietQR Pass</div>
            <div className="font-mono text-sm tracking-widest text-white mt-0.5">
              •••• •••• 4356
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-white/80 font-mono border-t border-white/20 pt-2">
            <div>
              <span>QUỸ:</span> 100.000đ
            </div>
            <div>
              <span>HẠNG:</span> TOP 1
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

