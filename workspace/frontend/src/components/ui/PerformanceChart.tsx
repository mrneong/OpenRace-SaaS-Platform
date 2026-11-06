'use client';

import React from 'react';

export const PerformanceChart: React.FC = () => {
  const bars = [
    { label: 'Jan', bottomHeight: '35%', topHeight: '40%' },
    { label: 'Feb', bottomHeight: '45%', topHeight: '45%' },
    { label: 'Mar', bottomHeight: '30%', topHeight: '38%' },
    { label: 'Apr', bottomHeight: '50%', topHeight: '42%' },
    { label: 'May', bottomHeight: '60%', topHeight: '48%' },
    { label: 'Jun', bottomHeight: '55%', topHeight: '55%' },
    { label: 'Jul', bottomHeight: '38%', topHeight: '42%' },
    { label: 'Aug', bottomHeight: '42%', topHeight: '46%' },
  ];

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Hiệu Suất Chạy Bộ & Điểm Đội</h3>
          <p className="text-xs text-slate-400 mt-0.5">Điểm cự ly và điểm chuyên cần qua các chu kỳ</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs pt-1">
        <span className="font-semibold text-slate-700">Tỷ lệ đóng góp điểm</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5B26]"></span> Điểm Cự Ly
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-[#18181B]"></span> Chuyên Cần
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative h-48 flex items-end justify-between pt-4 pb-2 border-b border-slate-100">
        {/* Y Axis Guide Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-300 font-mono">
          <div className="border-b border-slate-100/80 w-full flex justify-between"><span>20 pts</span></div>
          <div className="border-b border-slate-100/80 w-full flex justify-between"><span>15 pts</span></div>
          <div className="border-b border-slate-100/80 w-full flex justify-between"><span>10 pts</span></div>
          <div className="border-b border-slate-100/80 w-full flex justify-between"><span>05 pts</span></div>
          <div className="border-b border-slate-100/80 w-full flex justify-between"><span>00</span></div>
        </div>

        {/* Bars */}
        <div className="relative z-10 w-full h-full flex items-end justify-between px-2 gap-2">
          {bars.map((bar, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
              <div className="w-full max-w-[28px] flex flex-col items-center justify-end h-full">
                {/* Top Bar (Orange) */}
                <div
                  style={{ height: bar.topHeight }}
                  className="w-full bg-[#FF5B26] rounded-t-lg transition-all group-hover:brightness-110 shadow-sm"
                  title={`Điểm Cự Ly: ${bar.topHeight}`}
                ></div>
                {/* Bottom Bar (Charcoal) */}
                <div
                  style={{ height: bar.bottomHeight }}
                  className="w-full bg-[#18181B] rounded-b-lg border-t border-white/20 transition-all group-hover:brightness-125"
                  title={`Điểm Chuyên Cần: ${bar.bottomHeight}`}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* X Axis Labels */}
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-2">
        {bars.map((bar, idx) => (
          <span key={idx} className="text-center">{bar.label}</span>
        ))}
      </div>
    </div>
  );
};

