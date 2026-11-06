'use client';

import React from 'react';
import { useRace } from '../../context/RaceContext';

export const FinanceLedgerCard: React.FC = () => {
  const { financeLedger, runnerMarkPaid, exportData } = useRace();
  const myLedger = financeLedger.find((f) => f.runnerId === 'runner-self') || financeLedger[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-[0_4px_25px_rgb(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF5B26]">
              Tài Chính & Sổ Cái (UI-5 / M10)
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
              VietQR Chuẩn NAPAS
            </span>
          </div>
          <h3 className="text-xl font-black text-slate-900 mt-0.5">Sổ Cái Đóng Quỹ & Phạt Thiếu Cự Ly</h3>
          <p className="text-xs text-slate-500 mt-1">
            Quy tắc Mùa 10: Đội Vô Địch đóng 100.000đ/người • Các đội đồng hạng 2 đóng 200.000đ/người • Phạt tuần: 50.000đ
          </p>
        </div>

        <button
          onClick={() => exportData('finance', 'csv')}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5 self-start md:self-auto"
        >
          <span>📥</span>
          <span>Xuất Sổ Cái CSV</span>
        </button>
      </div>

      {/* Personal Due Card & VietQR Dynamic */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Payment Summary */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Khoản Đóng Của Bạn</span>
            <span className="text-xs font-bold text-[#FF5B26] bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
              {myLedger.teamName} (Hạng 1)
            </span>
          </div>

          <div className="space-y-2.5 border-y border-slate-100 py-3.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Tiền quỹ giải theo thứ hạng (Đội vô địch):</span>
              <span className="font-bold text-slate-900 font-mono">
                {myLedger.tieredFee.toLocaleString('vi-VN')}đ
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tiền phạt thiếu chỉ tiêu tuần:</span>
              <span className="font-bold font-mono text-emerald-600">
                {myLedger.penaltyFee > 0 ? `${myLedger.penaltyFee.toLocaleString('vi-VN')}đ` : '0đ'}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-100">
              <span>Tổng số tiền cần chuyển:</span>
              <span className="text-[#FF5B26] text-lg font-black font-mono">
                {myLedger.totalDue.toLocaleString('vi-VN')}đ
              </span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-slate-500 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
            <div>Ngân hàng thụ hưởng: <strong className="text-slate-900">Techcombank</strong></div>
            <div>Số tài khoản: <strong className="text-slate-900 font-mono">1903688889999</strong></div>
            <div>Chủ tài khoản: <strong className="text-slate-900">CLB CHAY BO SADC SARC</strong></div>
            <div>
              Mã tham chiếu (ngắn):{' '}
              <strong className="text-[#FF5B26] font-mono bg-orange-100/60 px-2 py-0.5 rounded">
                {myLedger.referenceCode}
              </strong>
            </div>
          </div>

          <div>
            {myLedger.status === 'PAID' ? (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center text-xs font-bold text-emerald-700">
                ✓ Đã hoàn tất thanh toán (PAID)! Cảm ơn bạn đã đóng góp quỹ.
              </div>
            ) : myLedger.status === 'PENDING_CONFIRMATION' ? (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-center text-xs font-bold text-amber-800">
                ⏳ Bạn đã báo chuyển khoản! Ban Tổ Chức đang đối soát sao kê.
              </div>
            ) : (
              <button
                onClick={() => runnerMarkPaid(myLedger.id)}
                className="w-full py-3 rounded-2xl text-xs font-bold bg-[#18181B] hover:bg-slate-800 text-white shadow-md transition flex items-center justify-center gap-2"
              >
                <span>💳</span>
                <span>Tôi Đã Chuyển Khoản Qua App Ngân Hàng</span>
              </button>
            )}
          </div>
        </div>

        {/* VietQR Dynamic Display */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-[0_4px_25px_rgb(0,0,0,0.03)] flex flex-col items-center justify-center text-center space-y-3">
          <div className="text-xs font-bold text-slate-800">Quét mã VietQR chuyển khoản nhanh</div>
          <div className="w-44 h-44 bg-white p-3 rounded-2xl shadow-sm flex flex-col items-center justify-center border-2 border-orange-500/30">
            <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
              <path d="M10 10h30v30h-30z m10 10h10v10h-10z M60 10h30v30h-30z m10 10h10v10h-10z M10 60h30v30h-30z m10 10h10v10h-10z M60 60h10v10h-10z M80 60h10v10h-10z M70 70h10v10h-10z M60 80h10v10h-10z M80 80h10v10h-10z" />
            </svg>
          </div>
          <div className="text-[11px] text-slate-500">
            Mã tự động điền số tiền{' '}
            <strong className="text-slate-900 font-mono">{myLedger.totalDue.toLocaleString('vi-VN')}đ</strong> và mã{' '}
            <strong className="text-[#FF5B26] font-mono">{myLedger.referenceCode}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
