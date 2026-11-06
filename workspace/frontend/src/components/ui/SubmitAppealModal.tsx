'use client';

import React, { useState } from 'react';
import { useRace, type ActivityItem } from '../../context/RaceContext';

interface SubmitAppealModalProps {
  activity: ActivityItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (msg: string) => void;
}

export function SubmitAppealModal({ activity, isOpen, onClose, onSuccess }: SubmitAppealModalProps) {
  const { submitAppeal } = useRace();
  const [reason, setReason] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !activity) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Vui lòng nêu rõ lý do khiếu nại!');
      return;
    }

    setIsSubmitting(true);
    submitAppeal(activity.id, reason.trim(), evidenceUrl.trim());
    setIsSubmitting(false);

    if (onSuccess) {
      onSuccess(`Đã nộp đơn khiếu nại bài "${activity.title}". Ban tổ chức sẽ đối soát.`);
    }

    setReason('');
    setEvidenceUrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full border border-slate-200/80 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF5B26]">Quy Trình Khiếu Nại (M11)</span>
            <h3 className="text-lg font-black text-slate-900 mt-0.5">Gửi Đơn Khiếu Nại Hoạt Động</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-800 flex items-center justify-center font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Target Activity Summary */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
          <div className="font-extrabold text-slate-900">{activity.title}</div>
          <div className="text-slate-500 font-mono">
            Cự ly: <span className="font-bold text-slate-800">{activity.distanceKm} km</span> • Pace:{' '}
            <span className="font-bold text-slate-800">{activity.paceStr}</span> • Gain:{' '}
            <span className="font-bold text-slate-800">{activity.elevationGainM}m</span>
          </div>
          <div className="text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded-xl text-[11px] font-semibold mt-1">
            Lý do bị từ chối: {activity.rejectReason || 'Không đáp ứng thể lệ giải'}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Lý do khiếu nại chi tiết <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="VD: Đoạn đường có hầm Kim Liên mất GPS khiến cự ly bị co lại, thực tế tôi chạy đúng tốc độ..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Đường dẫn bằng chứng (Link Strava / Garmin / Ảnh đồng hồ)
            </label>
            <input
              type="url"
              placeholder="https://strava.com/activities/..."
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#FF5B26] hover:bg-[#e04800] text-white shadow-md transition flex items-center gap-2"
            >
              <span>📨</span>
              <span>Gửi Đơn Lên Ban Tổ Chức</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

