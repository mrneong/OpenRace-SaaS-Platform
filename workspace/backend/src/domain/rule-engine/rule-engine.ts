/**
 * Pure Functional Rule Engine (TypeScript)
 * Evaluates activities against Race RuleSet with strict determinism.
 */

import type { Activity, RuleSet, Race, EvaluationResult } from '../models/models';

export function checkTimeOverlap(
  act1: Activity,
  act2: Activity,
  overlapRatioThreshold = 0.5
): boolean {
  const start1 = act1.startAt.getTime();
  const end1 = start1 + act1.elapsedTimeS * 1000;
  const start2 = act2.startAt.getTime();
  const end2 = start2 + act2.elapsedTimeS * 1000;

  const overlapStart = Math.max(start1, start2);
  const overlapEnd = Math.min(end1, end2);
  const overlapDurationMs = Math.max(0, overlapEnd - overlapStart);

  const duration1Ms = Math.max(1000, end1 - start1);
  const duration2Ms = Math.max(1000, end2 - start2);
  const shorterDurationMs = Math.min(duration1Ms, duration2Ms);

  return overlapDurationMs / shorterDurationMs >= overlapRatioThreshold;
}

export function evaluateActivity(
  activity: Activity,
  rules: RuleSet,
  race: Race,
  acceptedActivities?: Activity[]
): EvaluationResult {
  const distanceKm = activity.distanceM / 1000.0;
  const localDate = activity.startAt.toISOString().split('T')[0];

  const result: EvaluationResult = {
    activityId: activity.id,
    raceId: race.id,
    userId: activity.userId,
    isValid: false,
    rawDistanceKm: Math.round(distanceKm * 100) / 100,
    bonusDistanceKm: 0.0,
    finalDistanceKm: 0.0,
    startAt: activity.startAt,
    localDate,
  };

  // Bước 0: Nguồn & Trạng thái
  if (activity.status !== 'active') {
    result.rejectCode = 'ACTIVITY_DELETED';
    result.rejectMessage = 'Hoạt động đã bị xóa hoặc không còn hiệu lực.';
    return result;
  }

  // [AC-050] Hỗ trợ máy chạy bộ TreadmillRun kèm kiểm chứng sinh trắc học
  if (activity.sportType === 'TreadmillRun') {
    if (activity.avgHeartRate !== undefined && activity.avgHeartRate < 120) {
      result.rejectCode = 'TREADMILL_HR_TOO_LOW';
      result.rejectMessage = `Nhịp tim trung bình (${activity.avgHeartRate} bpm) dưới ngưỡng tối thiểu 120 bpm, không đủ chứng minh nỗ lực vận động.`;
      return result;
    }
    if (activity.avgCadence !== undefined && activity.avgCadence < 150) {
      result.rejectCode = 'TREADMILL_CADENCE_TOO_LOW';
      result.rejectMessage = `Nhịp chân trung bình (${activity.avgCadence} spm) dưới ngưỡng 150 spm, không đạt chuẩn sải bước chạy trên máy.`;
      return result;
    }
  } else if (!rules.allowedTypes.includes(activity.sportType)) {
    result.rejectCode = 'TYPE_NOT_ALLOWED';
    result.rejectMessage = `Kiểu hoạt động '${activity.sportType}' không nằm trong danh sách cho phép.`;
    return result;
  }

  if (activity.isManual && !rules.allowManual) {
    result.rejectCode = 'MANUAL_ENTRY';
    result.rejectMessage = 'Bài chạy nhập tay không được chấp nhận.';
    return result;
  }

  if (activity.isTrainer && !rules.allowTrainer && activity.sportType !== 'TreadmillRun') {
    result.rejectCode = 'TRAINER_ENTRY';
    result.rejectMessage = 'Bài tập máy chạy không được chấp nhận.';
    return result;
  }

  // Bước 1: Khung thời gian giải
  const actTime = activity.startAt.getTime();
  if (actTime < race.startAt.getTime() || actTime >= race.endAt.getTime()) {
    result.rejectCode = 'OUT_OF_RACE_WINDOW';
    result.rejectMessage = 'Thời gian bài chạy nằm ngoài khung thời gian diễn ra giải đấu.';
    return result;
  }

  // Bước 2: Cự ly tối thiểu
  if (distanceKm < rules.minDistanceKm) {
    result.rejectCode = 'BELOW_MIN_DISTANCE';
    result.rejectMessage = `Cự ly ${distanceKm.toFixed(2)} km chưa đạt mức tối thiểu ${rules.minDistanceKm.toFixed(2)} km.`;
    return result;
  }

  // Bước 3: Dải Pace và Trail Bonus (Quy Chuẩn Hai Tầng: Nền Tảng vs Giải Đấu)
  const paceMinPerKm = distanceKm > 0 ? (activity.movingTimeS / 60.0) / distanceKm : 9999;

  // [AC-RULE-DECOUPLING-01 & 03] TIER 1: PLATFORM GLOBAL ANTI-CHEAT HARD FLOOR
  const platformHardFloor = rules.hardAntiCheatFloorPaceMinKm || rules.paceFloor || 2.25;
  if (paceMinPerKm < platformHardFloor) {
    result.rejectCode = 'PACE_IMPLAUSIBLE';
    result.rejectMessage = `Pace ${paceMinPerKm.toFixed(2)} phút/km vi phạm sàn an toàn sinh học nền tảng (${platformHardFloor.toFixed(2)} min/km), nghi vấn gian lận phương tiện cơ giới.`;
    return result;
  }

  // [AC-RULE-DECOUPLING-01 & 03] TIER 2: TOURNAMENT-SPECIFIC RULES & PACE GATE
  if (paceMinPerKm < rules.paceMin) {
    result.rejectCode = 'PACE_TOO_FAST';
    result.rejectMessage = `Pace ${paceMinPerKm.toFixed(2)} phút/km nhanh hơn pace tối thiểu cho phép ${rules.paceMin.toFixed(2)}.`;
    return result;
  }

  let bonusKm = 0.0;
  const isTrailEnabled = rules.trailElevationBonusEnabled !== false;

  if (paceMinPerKm <= rules.paceMax) {
    // Pace hợp lệ tiêu chuẩn
    if (
      isTrailEnabled &&
      (rules.bonusMode === 'always' || (rules.bonusMode === 'trail_only' && activity.sportType === 'TrailRun')) &&
      activity.elevationGainM >= rules.trailGainMinM
    ) {
      const rawBonus = Math.floor(activity.elevationGainM / rules.gainUnitM) * rules.distanceUnitKm;
      bonusKm = rules.maxBonusKmPerActivity ? Math.min(rawBonus, rules.maxBonusKmPerActivity) : rawBonus;
    }
  } else {
    // Pace > paceMax -> Kiểm tra độ dốc Trail nếu giải đấu bật tính năng thưởng độ cao
    if (isTrailEnabled && activity.elevationGainM >= rules.trailGainMinM) {
      const rawBonus = Math.floor(activity.elevationGainM / rules.gainUnitM) * rules.distanceUnitKm;
      bonusKm = rules.maxBonusKmPerActivity ? Math.min(rawBonus, rules.maxBonusKmPerActivity) : rawBonus;
    } else {
      result.rejectCode = 'PACE_TOO_SLOW_NO_GAIN';
      result.rejectMessage = `Pace ${paceMinPerKm.toFixed(2)} phút/km vượt trần giải đấu (${rules.paceMax.toFixed(2)}) và ${!isTrailEnabled ? 'giải không áp dụng hệ số Trail D+' : `độ cao tích lũy (${activity.elevationGainM}m) không đạt chuẩn Trail`}.`;
      return result;
    }
  }

  // Bước 4: Chống trùng lặp (Overlap check)
  if (acceptedActivities && acceptedActivities.length > 0) {
    for (const prev of acceptedActivities) {
      if (prev.id !== activity.id && checkTimeOverlap(activity, prev, 0.5)) {
        result.rejectCode = 'DUPLICATE_OVERLAP';
        result.rejectMessage = `Bài chạy bị trùng lặp thời gian quá 50% với bài ${prev.id}.`;
        return result;
      }
    }
  }

  // Hợp lệ
  result.isValid = true;
  result.bonusDistanceKm = Math.round(bonusKm * 100) / 100;
  result.finalDistanceKm = Math.round((distanceKm + bonusKm) * 100) / 100;
  return result;
}

export function applyDailyLimit(
  results: EvaluationResult[],
  maxPerDay = 2
): EvaluationResult[] {
  const grouped: Record<string, EvaluationResult[]> = {};
  for (const r of results) {
    const key = r.localDate || 'unknown';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  }

  const finalResults: EvaluationResult[] = [];

  for (const dateKey of Object.keys(grouped)) {
    const dayResults = grouped[dateKey];
    dayResults.sort((a, b) => a.startAt.getTime() - b.startAt.getTime());

    let validCount = 0;
    for (const r of dayResults) {
      if (r.isValid) {
        validCount++;
        if (validCount > maxPerDay) {
          r.isValid = false;
          r.rejectCode = 'DAILY_LIMIT_EXCEEDED';
          r.rejectMessage = `Đã vượt quá giới hạn tối đa ${maxPerDay} bài chạy hợp lệ trong một ngày.`;
          r.finalDistanceKm = 0.0;
        }
      }
      finalResults.push(r);
    }
  }

  return finalResults;
}

/**
 * [AC-048] Phát Hiện và Cắt Bỏ Đoạn Đuôi Phương Tiện (Auto-Trim Vehicle Tail Algorithm)
 * Tự động cắt bỏ đoạn đuôi xe máy/ô tô khi runner quên bấm dừng đồng hồ sau buổi chạy.
 */
export function detectAndTrimVehicleTail(activity: Activity): {
  trimmed: boolean;
  trimmedActivity: Activity;
  trimmedDistanceKm: number;
  originalDistanceKm: number;
  cleanDistanceKm: number;
  reason?: string;
} {
  const originalDistanceKm = activity.distanceM / 1000.0;
  const isVehicleTail = Boolean(
    (activity.maxSpeedKmH && activity.maxSpeedKmH > 25.0) ||
    (activity.avgCadence && activity.avgCadence < 120) ||
    activity.autoTrimmed ||
    (activity.distanceM > 10000 && activity.elapsedTimeS > 0 && ((activity.movingTimeS / 60) / (activity.distanceM / 1000)) < 2.75)
  );

  if (isVehicleTail || activity.autoTrimmed) {
    const trimmedDistanceKm = activity.trimmedDistanceKm || 1.5;
    const cleanDistanceKm = Math.max(3.0, parseFloat((originalDistanceKm - trimmedDistanceKm).toFixed(2)));
    const cleanTimeS = Math.round(activity.movingTimeS * (cleanDistanceKm / originalDistanceKm));

    const trimmedActivity: Activity = {
      ...activity,
      distanceM: cleanDistanceKm * 1000.0,
      movingTimeS: cleanTimeS,
      elapsedTimeS: cleanTimeS,
      autoTrimmed: true,
      trimmedDistanceKm,
      originalDistanceKm,
      autoTrimReason: 'AUTO_TRIMMED_VEHICLE_TAIL'
    };

    return {
      trimmed: true,
      trimmedActivity,
      trimmedDistanceKm,
      originalDistanceKm,
      cleanDistanceKm,
      reason: `Phát hiện đoạn đuôi vận tốc xe máy/ô tô, tự động cắt bỏ ${trimmedDistanceKm} km và bảo toàn ${cleanDistanceKm} km chạy thực tế.`
    };
  }

  return {
    trimmed: false,
    trimmedActivity: activity,
    trimmedDistanceKm: 0,
    originalDistanceKm,
    cleanDistanceKm: originalDistanceKm
  };
}
