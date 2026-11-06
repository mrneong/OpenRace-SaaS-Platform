'use client';

import React, { useState, useEffect } from 'react';
import { useRace } from '../../context/RaceContext';

export interface ClubHubOnboardingProps {
  onSuccess?: () => void;
}

export function ClubHubOnboarding({ onSuccess }: ClubHubOnboardingProps) {
  const { teams, joinTeam } = useRace();

  // US-ONB-01 / UI-4: Detect In-App Browser (Facebook, Zalo, Messenger, etc.)
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [shortCode, setShortCode] = useState('OR-8K2Q');
  const [copied, setCopied] = useState(false);

  // Form State
  const [selectedTeam, setSelectedTeam] = useState<string>(teams[1]?.id || teams[0]?.id || 'team-dragons');
  const [stravaConsent, setStravaConsent] = useState(false);
  const [financeConsent, setFinanceConsent] = useState(false);
  const [isConnectedStrava, setIsConnectedStrava] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    // Check user agent in browser environment
    if (typeof window !== 'undefined' && window.navigator) {
      const ua = window.navigator.userAgent.toLowerCase();
      const inApp = ua.includes('fban') || ua.includes('fbav') || ua.includes('zalo') || ua.includes('messenger');
      setIsInAppBrowser(inApp);
    }
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.origin + '/onboarding?code=' + shortCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const currentSelectedTeam = teams.find((t) => t.id === selectedTeam);
  const isSelectedTeamOpen = currentSelectedTeam ? currentSelectedTeam.currentMembers < currentSelectedTeam.maxMembers : false;
  const canSubmit = stravaConsent && financeConsent && isConnectedStrava && isSelectedTeamOpen;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const res = joinTeam(selectedTeam, 'Nguyễn Văn A');
    if (res.success) {
      setIsSubmitted(true);
      if (onSuccess) onSuccess();
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. IN-APP BROWSER DETOUR BANNER (US-ONB-01 / UI-4) */}
      {isInAppBrowser && (
        <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-3xl p-5 text-amber-900 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <strong className="text-sm font-bold">Phát hiện Trình duyệt In-App (Zalo / Facebook)</strong>
            </div>
            <p className="text-xs text-amber-800">
              Để tránh lỗi mất session khi kết nối Strava OAuth, vui lòng mở trang này bằng Chrome hoặc Safari.
            </p>
            <div className="text-[11px] font-mono text-amber-700 mt-1">
              Mã kết nối nhanh: <span className="font-extrabold bg-amber-100 px-2 py-0.5 rounded text-amber-900">{shortCode}</span>
            </div>
          </div>
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shrink-0 shadow-sm transition"
          >
            {copied ? '✓ Đã sao chép link' : 'Sao chép link mở ngoài'}
          </button>
        </div>
      )}

      {/* 2. ONBOARDING CARD */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-6">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF5B26]">Đăng ký tham gia (UI-4 / US-ONB-01)</span>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-orange-50 text-[#FF5B26] border border-orange-200">
              Mùa 10 Run to Techcombank
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 mt-1">Gia nhập Đội thi & Kết nối Strava</h2>
          <p className="text-xs text-slate-500 mt-1">
            Hoàn thành các bước dưới đây để được hệ thống tính điểm tự động và đồng bộ hoạt động chạy mỗi ngày.
          </p>
        </div>

        {/* STEP 1: STRAVA CONNECTION */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FC4C02] text-white flex items-center justify-center font-black text-sm shadow-sm">
                S
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">1. Kết nối Tài khoản Strava</h4>
                <p className="text-[11px] text-slate-500">Tự động đẩy webhook mỗi khi hoàn thành bài chạy</p>
              </div>
            </div>
            {isConnectedStrava ? (
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                ✓ Đã kết nối (Nguyen Van A)
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setIsConnectedStrava(true)}
                className="px-4 py-2 bg-[#FC4C02] hover:bg-[#e04300] text-white text-xs font-bold rounded-xl transition shadow-sm"
              >
                Kết nối Strava
              </button>
            )}
          </div>
        </div>

        {/* STEP 2: TEAM SELECTION WITH CAPACITY CHECK */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-800">2. Chọn Đội thi (Giới hạn tối đa 16 VĐV/đội)</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {teams.map((t) => {
              const isFull = t.currentMembers >= t.maxMembers;
              const isSelected = selectedTeam === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => !isFull && setSelectedTeam(t.id)}
                  className={`p-4 rounded-2xl border transition cursor-pointer relative ${
                    isFull
                      ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                      : isSelected
                      ? 'bg-orange-50/50 border-[#FF5B26] ring-2 ring-orange-500/20 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h5 className="text-xs font-bold text-slate-900">{t.name}</h5>
                    {isFull ? (
                      <span className="text-[9px] font-bold bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded">ĐÃ ĐẦY</span>
                    ) : (
                      <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">CÒN CHỖ</span>
                    )}
                  </div>
                  <div className="mt-2 text-[11px] text-slate-500">
                    Sĩ số: <strong className="text-slate-900 font-mono">{t.currentMembers}/{t.maxMembers}</strong> VĐV
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full ${isFull ? 'bg-rose-500' : 'bg-[#FF5B26]'}`}
                      style={{ width: `${(t.currentMembers / t.maxMembers) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP 3: DUAL REQUIRED CONSENTS (US-ONB-01) */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-800">3. Cam kết & Điều khoản bắt buộc</label>
          
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              id="consent-strava"
              checked={stravaConsent}
              onChange={(e) => setStravaConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#FF5B26] focus:ring-orange-500 cursor-pointer"
            />
            <span className="text-xs text-slate-600 leading-relaxed group-hover:text-slate-900">
              <strong>Điều khoản 1:</strong> Tôi đồng ý cấp quyền cho hệ thống OpenRace đọc các hoạt động chạy từ tài khoản Strava cá nhân để phục vụ việc tự động chấm điểm và kiểm duyệt hợp lệ.
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              id="consent-finance"
              checked={financeConsent}
              onChange={(e) => setFinanceConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#FF5B26] focus:ring-orange-500 cursor-pointer"
            />
            <span className="text-xs text-slate-600 leading-relaxed group-hover:text-slate-900">
              <strong>Điều khoản 2:</strong> Tôi đồng ý công khai thành tích chạy trên bảng xếp hạng nội bộ và chấp thuận nghĩa vụ đóng góp quỹ/phạt thiếu km (nếu có) theo quy chế tài chính minh bạch của giải.
            </span>
          </label>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="pt-2">
          {isSubmitted ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center text-xs font-bold text-emerald-700">
              🎉 Chúc mừng! Bạn đã gia nhập giải chạy thành công và sẵn sàng thi đấu.
            </div>
          ) : (
            <button
              type="button"
              disabled={!canSubmit}
              onClick={handleSubmit}
              className={`w-full py-3.5 rounded-2xl text-xs font-bold transition shadow-sm ${
                canSubmit
                  ? 'bg-[#18181B] hover:bg-slate-800 text-white cursor-pointer'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {!isConnectedStrava
                ? 'Vui lòng kết nối Strava để tiếp tục'
                : !stravaConsent || !financeConsent
                ? 'Vui lòng tích đủ 2 điều khoản bắt buộc'
                : 'Hoàn tất Đăng ký Gia nhập Giải Chạy'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

