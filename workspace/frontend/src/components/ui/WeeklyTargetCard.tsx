import React from 'react';

export interface WeeklyTargetCardProps {
  currentKm: number;
  targetKm: number;
  remainingDays: number;
  penaltyVnd: number;
  hasWaiver?: boolean;
}

export const WeeklyTargetCard: React.FC<WeeklyTargetCardProps> = ({
  currentKm,
  targetKm,
  remainingDays,
  penaltyVnd,
  hasWaiver = false,
}) => {
  const percentage = Math.min(100, Math.round((currentKm / targetKm) * 100));
  const isCompleted = currentKm >= targetKm;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-slate-200">Chỉ tiêu chu kỳ tuần</h4>
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isCompleted
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          }`}
        >
          {isCompleted ? 'Đã hoàn thành' : `Còn ${remainingDays} ngày`}
        </span>
      </div>

      <div className="flex items-baseline space-x-2 mb-2">
        <span className="text-3xl font-extrabold text-slate-100">{currentKm.toFixed(1)}</span>
        <span className="text-sm text-slate-400">/ {targetKm.toFixed(1)} km</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 rounded-full h-2 mb-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isCompleted ? 'bg-emerald-500' : 'bg-orange-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>Tiến độ: {percentage}%</span>
        {hasWaiver ? (
          <span className="text-blue-400 font-medium">Được cấp miễn trừ phạt</span>
        ) : (
          <span>Phạt vi phạm: {penaltyVnd.toLocaleString()}đ</span>
        )}
      </div>
    </div>
  );
};

