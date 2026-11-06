'use client';

import React from 'react';

export const RightRailSidebar: React.FC = () => {
  return (
    <aside className="space-y-4">
      {/* Quick Facts & Registry Card */}
      <div className="p-4 rounded-xl border border-[#26334A] bg-[#131926] shadow-sm space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Thông Tin Pháp Lý & Thể Thao
        </h4>
        <div className="space-y-2 text-xs divide-y divide-[#26334A]">
          <div className="flex justify-between pt-1">
            <span className="text-slate-500">Website</span>
            <span className="font-mono text-sky-400 font-medium hover:underline cursor-pointer">
              openrace.io/sadc-sarc ↗
            </span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="text-slate-500">Thời gian giải</span>
            <span className="text-slate-200 font-mono">01/11 – 30/11/2026</span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="text-slate-500">Múi giờ chuẩn</span>
            <span className="text-slate-200 font-mono">Asia/Ho_Chi_Minh</span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="text-slate-500">Phiên bản luật</span>
            <span className="text-slate-200 font-mono">Rule Set v1.0.0</span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="text-slate-500">Đóng quỹ Top 1</span>
            <span className="text-emerald-400 font-bold font-mono">100.000đ/người</span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="text-slate-500">Đóng quỹ Đội 2</span>
            <span className="text-amber-400 font-bold font-mono">200.000đ/người</span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="text-slate-500">Phạt thiếu tuần</span>
            <span className="text-red-400 font-bold font-mono">50.000đ/chu kỳ</span>
          </div>
        </div>
      </div>

      {/* Strava Integration Card */}
      <div className="p-4 rounded-xl border border-[#26334A] bg-[#131926] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Strava Live Ingestion
          </h4>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">OAuth VĐV:</span>
            <strong className="text-slate-200 font-medium">Nguyễn Văn A</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Độ trễ Webhook:</span>
            <strong className="text-emerald-400 font-mono">&lt; 300 ms (p95)</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Cách ly CSDL:</span>
            <strong className="text-sky-400 font-mono">Supabase RLS ON</strong>
          </div>
        </div>
      </div>

      {/* Quick VietQR Dynamic Pay */}
      <div className="p-4 rounded-xl border border-[#26334A] bg-[#131926] shadow-sm space-y-3 text-center">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          VietQR Nộp Quỹ Tức Thì
        </h4>
        <div className="w-32 h-32 mx-auto bg-white p-2 rounded-xl border-2 border-sky-500/40 shadow">
          <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
            <path d="M10 10h30v30h-30z m10 10h10v10h-10z M60 10h30v30h-30z m10 10h10v10h-10z M10 60h30v30h-30z m10 10h10v10h-10z M60 60h10v10h-10z M80 60h10v10h-10z M70 70h10v10h-10z M60 80h10v10h-10z M80 80h10v10h-10z"/>
          </svg>
        </div>
        <div className="text-[11px] text-slate-400">
          Quét bằng App mọi Ngân hàng • Đã kèm số tiền <strong className="text-sky-400 font-mono">100.000đ</strong>
        </div>
      </div>
    </aside>
  );
};

