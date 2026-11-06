'use client';

import React, { useState, useMemo } from 'react';
import { useRace, type ActivityItem } from '../../context/RaceContext';
import { AddActivityModal } from './AddActivityModal';
import { SubmitAppealModal } from './SubmitAppealModal';

export const ActivitiesTable: React.FC<{
  onAppealClick?: (act: any) => void;
}> = () => {
  const { activities, exportData } = useRace();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'VALID' | 'REJECTED' | 'TRAIL'>('ALL');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [appealTargetActivity, setAppealTargetActivity] = useState<ActivityItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const matchSearch =
        act.title.toLowerCase().includes(search.toLowerCase()) ||
        act.athleteName.toLowerCase().includes(search.toLowerCase()) ||
        act.id.toLowerCase().includes(search.toLowerCase());

      if (!matchSearch) return false;
      if (filterType === 'VALID') return act.isValid;
      if (filterType === 'REJECTED') return !act.isValid;
      if (filterType === 'TRAIL') return act.isTrail || act.bonusDistanceKm > 0;
      return true;
    });
  }, [activities, search, filterType]);

  return (
    <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-4">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#18181B] text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER WITH TITLE, SEARCH, AND ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF5B26]">
            Nhật ký hoạt động (UI-3 / M7)
          </span>
          <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
            Nhật Ký & Thẩm Định Hoạt Động ({filteredActivities.length})
          </h3>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => exportData('activities', 'csv')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5"
            title="Xuất file CSV"
          >
            <span>📥</span>
            <span>Xuất CSV</span>
          </button>

          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#FF5B26] hover:bg-[#e04800] text-white shadow-sm transition flex items-center gap-1.5"
          >
            <span>+</span>
            <span>Thêm bài chạy mới</span>
          </button>
        </div>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Tìm theo tên bài, VĐV, mã bài..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
          <span className="absolute left-2.5 top-2 text-slate-400 text-xs">🔍</span>
        </div>

        {/* Filter Pills */}
        <div className="inline-flex bg-slate-100 p-1 rounded-xl text-[11px] font-bold self-start sm:self-auto">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1 rounded-lg transition ${
              filterType === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Tất cả ({activities.length})
          </button>
          <button
            onClick={() => setFilterType('VALID')}
            className={`px-3 py-1 rounded-lg transition ${
              filterType === 'VALID' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Hợp lệ ({activities.filter((a) => a.isValid).length})
          </button>
          <button
            onClick={() => setFilterType('REJECTED')}
            className={`px-3 py-1 rounded-lg transition ${
              filterType === 'REJECTED' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Bị loại ({activities.filter((a) => !a.isValid).length})
          </button>
          <button
            onClick={() => setFilterType('TRAIL')}
            className={`px-3 py-1 rounded-lg transition ${
              filterType === 'TRAIL' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Trail ({activities.filter((a) => a.isTrail || a.bonusDistanceKm > 0).length})
          </button>
        </div>
      </div>

      {/* ACTIVITIES TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-2.5 px-3">Hoạt động</th>
              <th className="py-2.5 px-3">Cự ly ghi nhận</th>
              <th className="py-2.5 px-3">Pace / Gain</th>
              <th className="py-2.5 px-3">Trạng thái thẩm định</th>
              <th className="py-2.5 px-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredActivities.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                  Không tìm thấy bài chạy nào phù hợp với bộ lọc.
                </td>
              </tr>
            ) : (
              filteredActivities.map((act) => {
                const isRejected = !act.isValid;
                const hasTrailBonus = act.bonusDistanceKm > 0;
                const hasPendingAppeal = act.appealStatus === 'PENDING';
                const isApprovedAppeal = act.appealStatus === 'APPROVED';

                return (
                  <tr key={act.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{act.isTrail ? '⛰️' : '🏃'}</span>
                        <div>
                          <div className="font-bold text-slate-900">{act.title}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {act.athleteName} • {new Date(act.startDate).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono">
                      <div className="font-bold text-slate-900 text-sm">
                        {act.finalDistanceKm > 0 ? `${act.finalDistanceKm.toFixed(1)} km` : '0.0 km'}
                      </div>
                      <div className="text-[10px] text-slate-400">Gốc: {act.distanceKm.toFixed(1)} km</div>
                    </td>

                    <td className="py-3 px-3 font-mono">
                      <div className="font-semibold text-slate-800">{act.paceStr} /km</div>
                      <div className="text-[10px] text-slate-400">Gain: {act.elevationGainM}m</div>
                    </td>

                    <td className="py-3 px-3">
                      {act.isValid ? (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ✓ Hợp lệ
                          </span>
                          {hasTrailBonus && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-[#FF5B26] border border-orange-200">
                              +{act.bonusDistanceKm}km Trail
                            </span>
                          )}
                          {isApprovedAppeal && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              Đã duyệt khiếu nại
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              ✕ Bị từ chối
                            </span>
                            {hasPendingAppeal && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                                Chờ duyệt khiếu nại
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-rose-600 max-w-xs truncate" title={act.rejectReason}>
                            {act.rejectReason}
                          </div>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right">
                      {isRejected && !hasPendingAppeal && !isApprovedAppeal && (
                        <button
                          onClick={() => setAppealTargetActivity(act)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-orange-50 hover:bg-orange-100 text-[#FF5B26] border border-orange-200 transition"
                        >
                          Khiếu nại
                        </button>
                      )}
                      {hasPendingAppeal && (
                        <span className="text-[11px] text-amber-600 font-semibold">Đang xử lý...</span>
                      )}
                      {act.isValid && (
                        <span className="text-[11px] text-slate-400 font-mono">Đã lưu sổ cái</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ADD ACTIVITY MODAL */}
      <AddActivityModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={(msg) => showToast(msg)}
      />

      {/* SUBMIT APPEAL MODAL */}
      <SubmitAppealModal
        activity={appealTargetActivity}
        isOpen={!!appealTargetActivity}
        onClose={() => setAppealTargetActivity(null)}
        onSuccess={(msg) => showToast(msg)}
      />
    </div>
  );
};
