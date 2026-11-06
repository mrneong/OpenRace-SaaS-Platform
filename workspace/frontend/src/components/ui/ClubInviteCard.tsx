'use client';

import React, { useState } from 'react';

export const ClubInviteCard: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('phoenix');

  const inviteUrl = 'https://openrace.io/join/sadc-sarc?ref=phoenix-team';

  const handleCopy = () => {
    navigator.clipboard?.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const teams = [
    {
      id: 'phoenix',
      name: 'Team Phoenix SARC',
      leader: 'Nguyễn Văn A',
      membersCount: 16,
      avatarBg: 'from-orange-500 to-amber-500',
    },
    {
      id: 'dragons',
      name: 'Team Dragons SADC',
      leader: 'Trần Thị B',
      membersCount: 16,
      avatarBg: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'tigers',
      name: 'Team Tigers SADC',
      leader: 'Lê Hoàng C',
      membersCount: 16,
      avatarBg: 'from-emerald-500 to-teal-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Club Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-orange-500/20">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-100">CLB Chạy Bộ SADC / SARC</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Verified Tenant
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Giải đấu: Mùa 10 Run to Techcombank 2026 • 48 Vận động viên
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              {copied ? '✓ Đã sao chép link!' : '🔗 Sao chép link mời'}
            </button>
          </div>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-200">Danh Sách Đội Thi Thuộc CLB (M5)</h4>
          <span className="text-xs text-slate-500">Quy mô: 16 thành viên/đội</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {teams.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedTeam(t.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedTeam === t.id
                  ? 'bg-slate-900 border-orange-500 ring-2 ring-orange-500/20 shadow-md'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.avatarBg} flex items-center justify-center text-white font-black text-sm`}
                >
                  {t.name[5]}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-200">{t.name}</h5>
                  <div className="text-[11px] text-slate-400 mt-0.5">Đội trưởng: {t.leader}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-2 border-t border-slate-800/80">
                <span>Quân số: <strong className="text-slate-200">{t.membersCount} / 16</strong></span>
                {selectedTeam === t.id && (
                  <span className="text-orange-400 font-bold text-[11px]">Đang chọn ✓</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

