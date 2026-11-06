'use client';

import React, { useState } from 'react';
import { useRace } from '../../context/RaceContext';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (msg: string) => void;
}

export function CreateTeamModal({ isOpen, onClose, onSuccess }: CreateTeamModalProps) {
  const { createTeam } = useRace();
  const [name, setName] = useState('');
  const [slogan, setSlogan] = useState('');
  const [maxMembers, setMaxMembers] = useState('16');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const max = parseInt(maxMembers, 10) || 16;
    const team = createTeam(name.trim(), slogan.trim(), max);

    if (onSuccess) {
      onSuccess(`Đã tạo thành công đội thi "${team.name}"!`);
    }

    setName('');
    setSlogan('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full border border-slate-200/80 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF5B26]">Quản Trị Đội Thi (M5)</span>
            <h3 className="text-lg font-black text-slate-900 mt-0.5">Tạo Đội Thi Mới</h3>
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
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Tên đội thi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Team Golden Eagles SADC"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Khẩu hiệu (Slogan)</label>
            <input
              type="text"
              placeholder="VD: Chạy hết mình, bứt phá giới hạn"
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Sức chứa tối đa (VĐV)</label>
            <input
              type="number"
              min="1"
              max="50"
              value={maxMembers}
              onChange={(e) => setMaxMembers(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900"
            />
            <span className="text-[10px] text-slate-400">Tiêu chuẩn giải: 16 VĐV / đội</span>
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
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#18181B] hover:bg-slate-800 text-white shadow-md transition"
            >
              Tạo Đội & Đưa Vào Sàn Đấu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

