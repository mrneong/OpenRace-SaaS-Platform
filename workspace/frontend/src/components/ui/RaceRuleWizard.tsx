'use client';

import React, { useState } from 'react';
import { useRace } from '../../context/RaceContext';

export const RaceRuleWizard: React.FC<{
  onPublishSuccess?: () => void;
  onPublish?: () => void;
}> = ({ onPublishSuccess, onPublish }) => {
  const { rules, publishRuleSet } = useRace();
  const [step, setStep] = useState(1);
  const [raceName, setRaceName] = useState('Mùa 10 Run to Techcombank 2026');
  const [raceSlug, setRaceSlug] = useState('season-10-run-to-techcombank');
  const [timezone, setTimezone] = useState('Asia/Ho_Chi_Minh');
  const [format, setFormat] = useState('combined');

  // Step 2
  const [minDistanceKm, setMinDistanceKm] = useState(rules.minDistanceKm || 3.0);
  const [dailyLimit, setDailyLimit] = useState(rules.maxActivitiesPerDay || 2);
  const [paceMin, setPaceMin] = useState(rules.paceMin || 4.0); // 4:00 min/km
  const [paceMax, setPaceMax] = useState(rules.paceMax || 10.0); // 10:00 min/km
  const [trailBonus, setTrailBonus] = useState(true);
  const SYSTEM_PACE_FLOOR = 2.75; // 2:45 min/km lock

  // Step 3
  const [enablePenalty, setEnablePenalty] = useState(true);
  const [targetKm, setTargetKm] = useState(rules.targetKmPerCycle || 20.0);
  const [penaltyAmount, setPenaltyAmount] = useState(rules.penaltyPerMissVnd || 50000);
  const [graceHours, setGraceHours] = useState(rules.graceHours || 6);
  const [partialWeekPolicy, setPartialWeekPolicy] = useState('prorate');

  // Step 4
  const [distanceWeight, setDistanceWeight] = useState(50);
  const [diligentCapDays, setDiligentCapDays] = useState(rules.capDaysTeam || 140);
  const [tierRank1, setTierRank1] = useState(100000);
  const [tierOther, setTierOther] = useState(200000);

  // Step 5
  const [rewardTitle, setRewardTitle] = useState('Áo thi đấu CLB SARC chính hãng');

  // Step 6
  const [teamCapacity, setTeamCapacity] = useState(16);

  // Step 7: Simulation results
  const [dryRunExecuted, setDryRunExecuted] = useState(false);
  const [dryRunStats, setDryRunStats] = useState<any>(null);
  const [financeVisibility, setFinanceVisibility] = useState<'all_members' | 'admin_only'>('all_members');

  const handlePaceMinChange = (val: number) => {
    if (val < SYSTEM_PACE_FLOOR) {
      alert('Pace tối thiểu không được nhanh hơn sàn hệ thống 2:45 min/km để phòng chống gian lận xe máy!');
      setPaceMin(SYSTEM_PACE_FLOOR);
    } else {
      setPaceMin(val);
    }
  };

  const executeDryRun = () => {
    setDryRunExecuted(true);
    setDryRunStats({
      totalSampleRuns: 500,
      validCount: 462,
      validRatePct: 92.4,
      trailBonusCount: 58,
      trailBonusKm: 116.0,
      rejectedBelowDist: 18,
      rejectedPaceFast: 8,
      rejectedPaceSlowNoGain: 12,
      projectedPenaltiesCount: 4,
      projectedPenaltyVnd: 200000,
    });
  };

  const handlePublish = () => {
    publishRuleSet({
      minDistanceKm,
      paceMin,
      paceMax,
      maxActivitiesPerDay: dailyLimit,
      targetKmPerCycle: targetKm,
      penaltyPerMissVnd: penaltyAmount,
      graceHours,
      capDaysTeam: diligentCapDays,
    });
    alert('Xuất bản giải đấu thành công! Quy tắc thể lệ đã được khóa phiên bản bất biến (v1.0.0).');
    if (onPublishSuccess) onPublishSuccess();
    if (onPublish) onPublish();
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_25px_rgb(0,0,0,0.03)] space-y-6">
      {/* Wizard Step Indicator Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>BỘ ĐIỀU HÀNH THỂ LỆ GIẢI ĐẤU (WIZARD 7 BƯỚC)</span>
          <span className="font-mono text-[#FF5B26]">Bước {step} / 7</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
          <div
            className="bg-[#FF5B26] h-full transition-all duration-300"
            style={{ width: `${(step / 7) * 100}%` }}
          ></div>
        </div>
        <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 overflow-x-auto gap-2 pt-1">
          <span className={step === 1 ? 'text-[#FF5B26] font-bold' : ''}>1. Cơ bản</span>
          <span>•</span>
          <span className={step === 2 ? 'text-[#FF5B26] font-bold' : ''}>2. Bài chạy</span>
          <span>•</span>
          <span className={step === 3 ? 'text-[#FF5B26] font-bold' : ''}>3. Phạt tuần</span>
          <span>•</span>
          <span className={step === 4 ? 'text-[#FF5B26] font-bold' : ''}>4. Điểm & Quỹ</span>
          <span>•</span>
          <span className={step === 5 ? 'text-[#FF5B26] font-bold' : ''}>5. Thưởng</span>
          <span>•</span>
          <span className={step === 6 ? 'text-[#FF5B26] font-bold' : ''}>6. Đội</span>
          <span>•</span>
          <span className={step === 7 ? 'text-[#FF5B26] font-bold' : ''}>7. Mô phỏng</span>
        </div>
      </div>

      {/* STEP 1: Cơ bản */}
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900">Bước 1: Thông tin cơ bản & Múi giờ</h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tên giải đấu</label>
              <input
                type="text"
                value={raceName}
                onChange={(e) => setRaceName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Đường dẫn slug</label>
              <input
                type="text"
                value={raceSlug}
                onChange={(e) => setRaceSlug(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Múi giờ chuẩn</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                >
                  <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (GMT+7)</option>
                  <option value="UTC">UTC (GMT+0)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Thể thức thi đấu</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                >
                  <option value="combined">Kết hợp Đội & Cá nhân</option>
                  <option value="team_only">Đồng đội thuần túy</option>
                  <option value="individual">Cá nhân thuần túy</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Bài chạy & Chống gian lận */}
      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900">Bước 2: Bộ lọc bài chạy & Chốt chặn chống gian lận</h3>
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cự ly tối thiểu (km)</label>
                <input
                  type="number"
                  step="0.5"
                  value={minDistanceKm}
                  onChange={(e) => setMinDistanceKm(parseFloat(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Giới hạn bài hợp lệ / ngày</label>
                <input
                  type="number"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(parseInt(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono"
                />
              </div>
            </div>

            {/* Sàn Pace hệ thống lock 2:45 */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900">Khóa Cứng Sàn Pace Hệ Thống: 2:45 min/km</span>
                <span className="text-[10px] bg-amber-200/80 px-2 py-0.5 rounded-full font-bold text-amber-800">
                  CHỐT CHẶN AN NINH
                </span>
              </div>
              <p className="text-[11px] text-amber-800">
                Hệ thống cấm đặt Pace tối thiểu nhanh hơn 2:45 min/km để chống gian lận xe máy và phương tiện cơ giới.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pace tối thiểu cho phép (min/km)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="2.75"
                    value={paceMin}
                    onChange={(e) => handlePaceMinChange(parseFloat(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pace tối đa cho phép (min/km)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={paceMax}
                    onChange={(e) => setPaceMax(parseFloat(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <div className="font-semibold text-slate-800">Cộng thưởng leo dốc Trail Bonus</div>
                <div className="text-[11px] text-slate-500">Mỗi 100m Gain đạt chuẩn tặng +1.0 km cự ly</div>
              </div>
              <input
                type="checkbox"
                checked={trailBonus}
                onChange={(e) => setTrailBonus(e.target.checked)}
                className="w-5 h-5 text-[#FF5B26] rounded focus:ring-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Phạt tuần */}
      {step === 3 && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900">Bước 3: Chỉ tiêu chu kỳ tuần & Mức phạt</h3>
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chỉ tiêu cự ly / tuần (km)</label>
                <input
                  type="number"
                  value={targetKm}
                  onChange={(e) => setTargetKm(parseFloat(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mức phạt mỗi tuần vi phạm (VND)</label>
                <input
                  type="number"
                  step="10000"
                  value={penaltyAmount}
                  onChange={(e) => setPenaltyAmount(parseInt(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-red-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Thời gian ân hạn chốt tuần (giờ)</label>
                <input
                  type="number"
                  value={graceHours}
                  onChange={(e) => setGraceHours(parseInt(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono"
                />
                <span className="text-[10px] text-slate-400">Mặc định 6h để phòng Strava đồng bộ trễ</span>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chính sách tuần lẻ / vào giữa chừng</label>
                <select
                  value={partialWeekPolicy}
                  onChange={(e) => setPartialWeekPolicy(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                >
                  <option value="prorate">Tính theo tỷ lệ ngày tham gia (Prorate)</option>
                  <option value="skip">Bỏ qua phạt tuần đầu</option>
                  <option value="full">Áp dụng đủ chỉ tiêu</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Điểm & Quỹ */}
      {step === 4 && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900">Bước 4: Tỷ trọng điểm & Bậc đóng quỹ</h3>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Tỷ trọng Cự ly / Chuyên cần:</span>
                <span className="font-mono text-[#FF5B26]">{distanceWeight}% Cự ly / {100 - distanceWeight}% Chuyên cần</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={distanceWeight}
                onChange={(e) => setDistanceWeight(parseInt(e.target.value))}
                className="w-full accent-[#FF5B26]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Trần ngày chuyên cần (ngày)</label>
              <input
                type="number"
                value={diligentCapDays}
                onChange={(e) => setDiligentCapDays(parseInt(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <label className="block font-bold text-amber-900 mb-1">Mức đóng quỹ Đội Hạng 1</label>
                <input
                  type="number"
                  step="10000"
                  value={tierRank1}
                  onChange={(e) => setTierRank1(parseInt(e.target.value))}
                  className="w-full p-2 rounded-lg border border-amber-300 bg-white font-mono font-bold"
                />
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <label className="block font-bold text-slate-800 mb-1">Mức đóng quỹ Đội Đồng Hạng 2</label>
                <input
                  type="number"
                  step="10000"
                  value={tierOther}
                  onChange={(e) => setTierOther(parseInt(e.target.value))}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white font-mono font-bold"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: Thưởng */}
      {step === 5 && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900">Bước 5: Khen thưởng cá nhân Top 1</h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tên phần thưởng hiện vật cho Top 1 cá nhân</label>
              <input
                type="text"
                value={rewardTitle}
                onChange={(e) => setRewardTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
              />
            </div>
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-center gap-3">
              <span className="text-2xl">🎽</span>
              <div>
                <div className="font-bold text-amber-900">Huy hiệu vinh danh hiển thị trên Bảng xếp hạng</div>
                <div className="text-[11px] text-amber-800">Runner dẫn đầu bảng cá nhân sẽ được phát sáng viền Volt và gắn nhãn phần thưởng này.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 6: Đội */}
      {step === 6 && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900">Bước 6: Thiết lập Đội thi đấu</h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Sức chứa tối đa mỗi đội (người)</label>
              <input
                type="number"
                value={teamCapacity}
                onChange={(e) => setTeamCapacity(parseInt(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold"
              />
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="font-bold text-slate-800">Danh sách 3 Đội khởi tạo:</div>
              <div className="grid grid-cols-3 gap-2 text-center font-semibold">
                <div className="p-2 bg-white rounded-xl border border-slate-200">Team Phoenix (SARC)</div>
                <div className="p-2 bg-white rounded-xl border border-slate-200">Team Dragons (SADC)</div>
                <div className="p-2 bg-white rounded-xl border border-slate-200">Team Tigers (SADC)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 7: Mô phỏng Dry-Run & Xuất bản */}
      {step === 7 && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900">Bước 7: Xem lại, Chạy mô phỏng (Dry-run) & Xuất bản</h3>
          
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Mức độ hiển thị tài chính giải đấu:</span>
              <select
                value={financeVisibility}
                onChange={(e) => setFinanceVisibility(e.target.value as any)}
                className="p-1.5 rounded-lg border border-slate-300 bg-white font-medium"
              >
                <option value="all_members">Công khai toàn bộ thành viên (all_members)</option>
                <option value="admin_only">Chỉ Ban quản trị (admin_only)</option>
              </select>
            </div>

            <button
              onClick={executeDryRun}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#18181B] hover:bg-slate-800 text-white transition shadow-sm"
            >
              🧪 Chạy Mô Phỏng Thể Lệ (Dry-Run trên 500 bài chạy mẫu)
            </button>

            {dryRunExecuted && dryRunStats && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="flex justify-between font-bold text-emerald-900">
                  <span>Kết Quả Mô Phỏng Thẩm Định (500 bài):</span>
                  <span>Tỷ lệ hợp lệ: {dryRunStats.validRatePct}%</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-emerald-800">
                  <div>• Hợp lệ: <strong>{dryRunStats.validCount} bài</strong></div>
                  <div>• Thưởng Trail: <strong>{dryRunStats.trailBonusCount} bài (+{dryRunStats.trailBonusKm} km)</strong></div>
                  <div>• Loại cự ly ngắn: <strong>{dryRunStats.rejectedBelowDist} bài</strong></div>
                  <div>• Loại pace quá nhanh: <strong>{dryRunStats.rejectedPaceFast} bài</strong></div>
                  <div>• Dự kiến phạt tuần: <strong>{dryRunStats.projectedPenaltiesCount} lượt ({dryRunStats.projectedPenaltyVnd.toLocaleString('vi-VN')}đ)</strong></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Wizard Step Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          onClick={() => setStep((prev) => Math.max(1, prev - 1))}
          disabled={step === 1}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
            step === 1 ? 'opacity-40 cursor-not-allowed text-slate-400' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          ← Quay lại
        </button>

        {step < 7 ? (
          <button
            onClick={() => setStep((prev) => Math.min(7, prev + 1))}
            className="px-5 py-2 rounded-full text-xs font-bold bg-[#FF5B26] hover:bg-[#e04800] text-white shadow-md transition"
          >
            Tiếp tục →
          </button>
        ) : (
          <button
            onClick={handlePublish}
            className="px-6 py-2.5 rounded-full text-xs font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition"
          >
            ✓ Xuất Bản Giải Đấu
          </button>
        )}
      </div>
    </div>
  );
};

