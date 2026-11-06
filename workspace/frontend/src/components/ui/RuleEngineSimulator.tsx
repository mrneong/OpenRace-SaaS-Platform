'use client';

import React, { useState } from 'react';

export const RuleEngineSimulator: React.FC = () => {
  const [distanceKm, setDistanceKm] = useState(5.0);
  const [movingTimeMin, setMovingTimeMin] = useState(27.5); // Pace 5:30
  const [gainM, setGainM] = useState(40);
  const [simulationResult, setSimulationResult] = useState<any | null>(null);

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    const paceMinPerKm = movingTimeMin / distanceKm;
    const paceSecPerKm = paceMinPerKm * 60;
    const paceFormatted = `${Math.floor(paceMinPerKm)}:${String(Math.floor(paceSecPerKm % 60)).padStart(2, '0')}`;

    // Evaluate rules
    let isValid = true;
    let rejectCode = '';
    let rejectMessage = '';
    let bonusKm = 0;
    let finalKm = distanceKm;

    if (distanceKm < 3.0) {
      isValid = false;
      rejectCode = 'INVALID_MIN_DISTANCE';
      rejectMessage = `Cự ly ${distanceKm} km nhỏ hơn mức tối thiểu 3.0 km`;
      finalKm = 0;
    } else if (paceMinPerKm < 4.0) {
      isValid = false;
      rejectCode = 'PACE_TOO_FAST';
      rejectMessage = `Pace ${paceFormatted} min/km quá nhanh (< 4:00 min/km), vi phạm quy định gian lận tốc độ`;
      finalKm = 0;
    } else if (paceMinPerKm > 10.0) {
      // Check trail bonus
      if (gainM >= 100) {
        bonusKm = Math.floor(gainM / 100) * 1.0;
        finalKm = distanceKm + bonusKm;
      } else {
        isValid = false;
        rejectCode = 'PACE_TOO_SLOW_NO_GAIN';
        rejectMessage = `Pace ${paceFormatted} min/km vượt quá 10:00 min/km nhưng độ cao (gain ${gainM}m) không đủ mức 100m để hưởng quyền Trail`;
        finalKm = 0;
      }
    }

    setSimulationResult({
      isValid,
      paceFormatted,
      bonusKm,
      finalKm,
      rejectCode,
      rejectMessage,
    });
  };

  return (
    <div className="space-y-6">
      {/* Rule Set Parameters Overview */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>⚙️</span> Cấu Hình Thể Lệ Giải Đấu (M4 / UI-6)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Bộ luật áp dụng cho giải: Mùa 10 Run to Techcombank 2026 (Phiên bản: v1.0.0)
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
            Rule Set Active
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            <div className="text-slate-400">Cự ly tối thiểu</div>
            <div className="text-base font-extrabold text-slate-100 mt-0.5">3.0 km / bài</div>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            <div className="text-slate-400">Dải Pace hợp lệ</div>
            <div className="text-base font-extrabold text-slate-100 mt-0.5">4:00 – 10:00 min/km</div>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            <div className="text-slate-400">Thưởng leo dốc Trail</div>
            <div className="text-base font-extrabold text-amber-400 mt-0.5">+1.0 km / 100m gain</div>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            <div className="text-slate-400">Giới hạn bài/ngày</div>
            <div className="text-base font-extrabold text-slate-100 mt-0.5">Tối đa 2 bài / ngày</div>
          </div>
        </div>
      </div>

      {/* Simulator Sandbox */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
        <div>
          <h4 className="text-sm font-bold text-slate-200">🧪 Bộ Mô Phỏng Thẩm Định Thể Lệ (Dry-Run Simulator)</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Nhập các thông số bài chạy để kiểm tra tức thì kết quả đánh giá của Rule Engine
          </p>
        </div>

        <form onSubmit={handleSimulate} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Cự ly chạy (km)</label>
            <input
              type="number"
              step="0.1"
              value={distanceKm}
              onChange={(e) => setDistanceKm(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Thời gian di chuyển (phút)</label>
            <input
              type="number"
              step="0.5"
              value={movingTimeMin}
              onChange={(e) => setMovingTimeMin(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Độ cao tích lũy (Gain m)</label>
            <input
              type="number"
              step="10"
              value={gainM}
              onChange={(e) => setGainM(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
          <div className="sm:col-span-3">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white shadow-md shadow-orange-600/20 transition"
            >
              Chạy Thử Thẩm Định (Dry-Run)
            </button>
          </div>
        </form>

        {/* Simulation Output */}
        {simulationResult && (
          <div
            className={`p-4 rounded-xl border space-y-2 ${
              simulationResult.isValid
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                : 'bg-red-950/20 border-red-500/30 text-red-200'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold">
                {simulationResult.isValid ? '✓ KẾT QUẢ: BÀI CHẠY HỢP LỆ' : '✕ KẾT QUẢ: BÀI CHẠY BỊ TỪ CHỐI'}
              </span>
              <span>Pace tính toán: <strong>{simulationResult.paceFormatted} min/km</strong></span>
            </div>

            {simulationResult.isValid ? (
              <div className="text-xs space-y-1 text-slate-300">
                <div>Cự ly gốc: <strong>{distanceKm} km</strong></div>
                {simulationResult.bonusKm > 0 && (
                  <div className="text-amber-400">
                    + Thưởng độ dốc Trail (gain {gainM}m): <strong>+{simulationResult.bonusKm} km</strong>
                  </div>
                )}
                <div className="text-sm font-bold text-emerald-400">
                  Tổng cự ly ghi nhận cuối cùng: {simulationResult.finalKm.toFixed(1)} km
                </div>
              </div>
            ) : (
              <div className="text-xs text-red-300 space-y-1">
                <div>Mã lý do vi phạm: <strong className="font-mono">{simulationResult.rejectCode}</strong></div>
                <div>Chi tiết: {simulationResult.rejectMessage}</div>
                <div className="font-bold text-red-400">Cự ly ghi nhận: 0.0 km</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

