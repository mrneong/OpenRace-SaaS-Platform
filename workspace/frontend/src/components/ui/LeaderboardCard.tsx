import React from 'react';

export interface LeaderboardCardProps {
  rank: number;
  rankLabel: string;
  teamName: string;
  totalKm: number;
  diligentDays: number;
  scoreDistance: number;
  scoreDiligent: number;
  totalScore: number;
}

export const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
  rank,
  rankLabel,
  teamName,
  totalKm,
  diligentDays,
  scoreDistance,
  scoreDiligent,
  totalScore,
}) => {
  const isTop1 = rank === 1;

  return (
    <div
      className={`p-5 rounded-2xl border transition-all duration-300 shadow-sm ${
        isTop1
          ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30'
          : 'bg-slate-900/60 border-slate-800'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span
            className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
              isTop1
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            {rank}
          </span>
          <div>
            <h3 className="font-semibold text-slate-100 text-base">{teamName}</h3>
            <span className="text-xs text-slate-400 font-medium">{rankLabel}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-amber-400">{totalScore.toFixed(1)}</div>
          <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Tổng điểm</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800/80 text-xs">
        <div>
          <span className="text-slate-400 block mb-0.5">Tổng cự ly</span>
          <span className="font-semibold text-slate-200">
            {totalKm.toLocaleString()} km ({scoreDistance.toFixed(1)}đ)
          </span>
        </div>
        <div>
          <span className="text-slate-400 block mb-0.5">Chuyên cần</span>
          <span className="font-semibold text-slate-200">
            {diligentDays} ngày ({scoreDiligent.toFixed(1)}đ)
          </span>
        </div>
      </div>
    </div>
  );
};

