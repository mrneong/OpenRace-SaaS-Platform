'use client';

import React, { useState } from 'react';

export interface ActivityItem {
  id: string;
  title: string;
  startAt: string;
  distanceKm: number;
  paceStr: string;
  gainM: number;
  isValid: boolean;
  bonusKm?: number;
  finalKm: number;
  rejectCode?: string;
  rejectMessage?: string;
}

export const ActivityLogCard: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: 'act-01',
      title: 'Chạy sáng Hồ Tây đón bình minh',
      startAt: '05/11/2026 05:45',
      distanceKm: 5.2,
      paceStr: '5:30',
      gainM: 25,
      isValid: true,
      bonusKm: 0,
      finalKm: 5.2,
    },
    {
      id: 'act-02',
      title: 'Chạy Trail Đền Gióng Sóc Sơn',
      startAt: '04/11/2026 15:30',
      distanceKm: 6.0,
      paceStr: '12:10',
      gainM: 260,
      isValid: true,
      bonusKm: 2.0,
      finalKm: 8.0,
    },
    {
      id: 'act-03',
      title: 'Khởi động công viên',
      startAt: '03/11/2026 06:15',
      distanceKm: 2.4,
      paceStr: '6:10',
      gainM: 5,
      isValid: false,
      finalKm: 0,
      rejectCode: 'INVALID_MIN_DISTANCE',
      rejectMessage: 'Cự ly 2.4 km nhỏ hơn mức tối thiểu 3.0 km theo thể lệ giải',
    },
    {
      id: 'act-04',
      title: 'Chạy trên cầu Nhật Tân',
      startAt: '02/11/2026 21:00',
      distanceKm: 8.0,
      paceStr: '3:15',
      gainM: 10,
      isValid: false,
      finalKm: 0,
      rejectCode: 'PACE_TOO_FAST',
      rejectMessage: 'Pace 3:15 min/km quá nhanh (< 4:00), nghi vấn đi xe cơ giới hoặc gian lận GPS',
    },
  ]);

  const [selectedActivityForAppeal, setSelectedActivityForAppeal] = useState<ActivityItem | null>(null);
  const [appealReason, setAppealReason] = useState('');
  const [appealSubmitted, setAppealSubmitted] = useState(false);
  const [filter, setFilter] = useState<'all' | 'valid' | 'invalid'>('all');

  const filteredActivities = activities.filter((act) => {
    if (filter === 'valid') return act.isValid;
    if (filter === 'invalid') return !act.isValid;
    return true;
  });

  const handleSubmitAppeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealReason) return;
    setAppealSubmitted(true);
    setTimeout(() => {
      setSelectedActivityForAppeal(null);
      setAppealReason('');
      setAppealSubmitted(false);
    }, 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <span>📋</span> Nhật Ký Hoạt Động & Thẩm Định (UI-3)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Dữ liệu đồng bộ trực tiếp từ tài khoản Strava</p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg font-semibold transition ${
              filter === 'all' ? 'bg-orange-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tất cả ({activities.length})
          </button>
          <button
            onClick={() => setFilter('valid')}
            className={`px-3 py-1 rounded-lg font-semibold transition ${
              filter === 'valid' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Hợp lệ ({activities.filter((a) => a.isValid).length})
          </button>
          <button
            onClick={() => setFilter('invalid')}
            className={`px-3 py-1 rounded-lg font-semibold transition ${
              filter === 'invalid' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Bị loại ({activities.filter((a) => !a.isValid).length})
          </button>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-3">
        {filteredActivities.map((act) => (
          <div
            key={act.id}
            className={`p-4 rounded-2xl border transition-all ${
              act.isValid
                ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                : 'bg-red-950/20 border-red-900/30 hover:border-red-800/40'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-200">{act.title}</h4>
                  {act.isValid ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ✓ HỢP LỆ
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                      ✕ KHÔNG HỢP LỆ
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-1">Bắt đầu: {act.startAt}</div>
              </div>

              <div className="text-right">
                <div className="text-base font-extrabold text-slate-100">
                  {act.finalKm > 0 ? `${act.finalKm.toFixed(1)} km` : `${act.distanceKm.toFixed(1)} km`}
                </div>
                {act.bonusKm && act.bonusKm > 0 ? (
                  <div className="text-[11px] text-amber-400 font-semibold">+Thưởng Trail: {act.bonusKm.toFixed(1)} km</div>
                ) : null}
              </div>
            </div>

            {/* Metrics pills */}
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-3 pt-2 border-t border-slate-800/60">
              <span>Cự ly gốc: <strong className="text-slate-200">{act.distanceKm.toFixed(1)} km</strong></span>
              <span>Pace: <strong className="text-slate-200">{act.paceStr} min/km</strong></span>
              <span>Độ cao (Gain): <strong className="text-slate-200">{act.gainM} m</strong></span>
            </div>

            {/* Rejection notice & Appeal button */}
            {!act.isValid && (
              <div className="mt-3 p-3 rounded-xl bg-red-950/40 border border-red-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-red-300">Lý do loại ({act.rejectCode}):</div>
                  <div className="text-xs text-red-200/80 mt-0.5">{act.rejectMessage}</div>
                </div>
                <button
                  onClick={() => setSelectedActivityForAppeal(act)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-600/30 hover:bg-red-600/50 text-red-200 border border-red-500/30 transition whitespace-nowrap"
                >
                  Khiếu nại bài này
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Appeal Modal */}
      {selectedActivityForAppeal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100">Gửi Khiếu Nại Thẩm Định (M11)</h3>
              <button
                onClick={() => setSelectedActivityForAppeal(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="text-xs bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300">
              <span className="font-semibold text-slate-200">{selectedActivityForAppeal.title}</span>
              <p className="text-red-400 mt-1">Lỗi: {selectedActivityForAppeal.rejectMessage}</p>
            </div>

            {appealSubmitted ? (
              <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 p-4 rounded-xl text-xs font-semibold text-center">
                ✓ Khiếu nại đã gửi tới Ban Tổ Chức thành công! Vui lòng chờ xem xét.
              </div>
            ) : (
              <form onSubmit={handleSubmitAppeal} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Lý do giải trình (kèm liên kết ảnh chụp bằng chứng nếu có):
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={appealReason}
                    onChange={(e) => setAppealReason(e.target.value)}
                    placeholder="VD: Đoạn qua hầm GPS bị gián đoạn dẫn đến hiển thị pace sai lệch, tôi có đính kèm file GPX đối chiếu..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedActivityForAppeal(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white shadow-md shadow-orange-600/20"
                  >
                    Nộp đơn khiếu nại
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

