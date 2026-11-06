'use client';

import React, { useState } from 'react';
import { useRace } from '../../context/RaceContext';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (msg: string) => void;
}

export function AddActivityModal({ isOpen, onClose, onSuccess }: AddActivityModalProps) {
  const { addActivity } = useRace();

  const [title, setTitle] = useState('');
  const [distanceKm, setDistanceKm] = useState('5.0');
  const [minutes, setMinutes] = useState('27');
  const [seconds, setSeconds] = useState('30');
  const [elevationGainM, setElevationGainM] = useState('35');
  const [isTrail, setIsTrail] = useState(false);
  const [resultPreview, setResultPreview] = useState<{
    isValid: boolean;
    message: string;
    finalKm: number;
    bonusKm: number;
    paceStr: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dist = parseFloat(distanceKm) || 0;
    const m = parseInt(minutes, 10) || 0;
    const s = parseInt(seconds, 10) || 0;
    const totalSec = m * 60 + s;
    const gain = parseFloat(elevationGainM) || 0;

    if (dist <= 0 || totalSec <= 0) {
      alert('Vui lòng nhập cự ly và thời gian hợp lệ!');
      return;
    }

    const res = addActivity({
      title: title.trim() || 'Bài chạy ghi nhận',
      distanceKm: dist,
      movingTimeSec: totalSec,
      elevationGainM: gain,
      isTrail,
    });

    setResultPreview({
      isValid: res.isValid,
      message: res.message,
      finalKm: res.activity.finalDistanceKm,
      bonusKm: res.activity.bonusDistanceKm,
      paceStr: res.activity.paceStr,
    });

    if (onSuccess) {
      onSuccess(res.message);
    }

    setTimeout(() => {
      onClose();
      setResultPreview(null);
      setTitle('');
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full border border-slate-200/80 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF5B26]">Nhật Ký & Thẩm Định (M6, M7)</span>
            <h3 className="text-lg font-black text-slate-900 mt-0.5">Thêm Bài Chạy / Mô Phỏng Strava</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-800 flex items-center justify-center font-bold text-sm"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tên bài chạy</label>
            <input
              type="text"
              required
              placeholder="VD: Chạy sáng quanh Hồ Gươm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Cự ly (km)</label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                required
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900"
              />
              <span className="text-[10px] text-slate-400">Tối thiểu: 3.0 km</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Độ cao Gain (m)</label>
              <input
                type="number"
                step="1"
                min="0"
                value={elevationGainM}
                onChange={(e) => setElevationGainM(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900"
              />
              <span className="text-[10px] text-slate-400">100m gain = +1km trail</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Thời gian di chuyển</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  className="w-full bg-transparent text-xs font-mono font-bold text-slate-900 focus:outline-hidden"
                />
                <span className="text-xs text-slate-400 font-semibold">phút</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={seconds}
                  onChange={(e) => setSeconds(e.target.value)}
                  className="w-full bg-transparent text-xs font-mono font-bold text-slate-900 focus:outline-hidden"
                />
                <span className="text-xs text-slate-400 font-semibold">giây</span>
              </div>
            </div>
            <span className="text-[10px] text-slate-400">
              Pace giới hạn: 4:00 - 10:00 min/km (Khóa sàn tuyệt đối 2:45 min/km)
            </span>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="modal-is-trail"
              checked={isTrail}
              onChange={(e) => setIsTrail(e.target.checked)}
              className="h-4 w-4 rounded text-[#FF5B26] focus:ring-orange-500 cursor-pointer"
            />
            <label htmlFor="modal-is-trail" className="text-xs text-slate-700 font-semibold cursor-pointer">
              Đánh dấu bài chạy Trail (Chấp nhận pace &gt; 10:00 nếu đủ độ dốc)
            </label>
          </div>

          {resultPreview && (
            <div
              className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
                resultPreview.isValid
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <div className="font-extrabold flex items-center justify-between">
                <span>{resultPreview.isValid ? '✓ THẨM ĐỊNH THÀNH CÔNG' : '✕ BÀI CHẠY BỊ TỪ CHỐI'}</span>
                <span className="font-mono">Pace: {resultPreview.paceStr}</span>
              </div>
              <p className="text-[11px] leading-relaxed">{resultPreview.message}</p>
            </div>
          )}

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
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#18181B] hover:bg-slate-800 text-white shadow-md transition flex items-center gap-2"
            >
              <span>⚡</span>
              <span>Thực thi kiểm tra & Ghi nhận</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

