/**
 * Runner Dashboard (Personal Hub) Use Case
 * Subsystem [1.0] - Implements submenus [1.1] to [1.5]
 */

import { InMemoryDataStore } from '../../infrastructure/repositories/in-memory-data.store';
import { calculateCycleTarget, evaluateCyclePenalty } from '../../domain/cycle-penalty/cycle-penalty';
import { evaluateActivity } from '../../domain/rule-engine/rule-engine';
import {
  getDefaultRuleSet,
  type Activity,
  type Race,
  type HeartRateZone,
  type TrainingLoadRecovery,
  type RunningShoe,
  type NutritionPlanInput,
  type NutritionPlanResult,
  type DigitalBadge,
  type RunnerMilestonesStreak
} from '../../domain/models/models';

export interface StravaStatusDto {
  connected: boolean;
  athleteId: string;
  athleteName: string;
  username: string;
  avatarUrl: string;
  lastSyncAt: string;
  webhookActive: boolean;
  syncStatus: 'idle' | 'syncing' | 'error';
  totalSyncedRuns: number;
}

export interface WeeklyProgressDto {
  cycleId: string;
  weekNumber: number;
  cycleStart: string;
  cycleEnd: string;
  gracePeriodEnd: string;
  standardTargetKm: number;
  targetKm: number;
  completedKm: number;
  remainingKm: number;
  completionPercent: number;
  isProrated: boolean;
  activeDays: number;
  daysRemaining: number;
  hoursRemaining: number;
  graceHours: number;
  status: 'completed' | 'in_progress' | 'at_risk';
}

export interface PenaltyWarningDto {
  active: boolean;
  level: 'CRITICAL' | 'WARNING' | 'CLEAR';
  hoursRemaining: number;
  missingKm: number;
  penaltyAmountVnd: number;
  deadline: string;
  message: string;
  recommendation: string;
}

export interface EnrolledRaceDto {
  raceId: string;
  name: string;
  slug: string;
  club: string;
  team: string;
  teamStanding: number;
  teamStandingLabel: string;
  badgeColor: 'gold' | 'silver';
  personalContributedKm: number;
  teamTotalKm: number;
  status: string;
}

export class RunnerDashboardUseCase {
  private lastSyncTime: Date = new Date();
  private userRunsCount: number = 42;
  private userCompletedKm: number = 18.5;
  private enrolledRaces: EnrolledRaceDto[] = [
    {
      raceId: 'race-season-10',
      name: 'Mùa 10 Run to Techcombank 2026',
      slug: 'season-10-run-to-techcombank',
      club: 'SARC (Saigon Athletics Running Club)',
      team: 'Phoenix SARC',
      teamStanding: 1,
      teamStandingLabel: '#1 Dẫn đầu',
      badgeColor: 'gold',
      personalContributedKm: 125.0,
      teamTotalKm: 1250.0,
      status: 'running',
    },
    {
      raceId: 'race-trail-bavi-2026',
      name: 'SARC Trail Challenge Ba Vì 2026',
      slug: 'sarc-trail-challenge-bavi-2026',
      club: 'SARC Trail Division',
      team: 'Dragons Trail',
      teamStanding: 2,
      teamStandingLabel: 'Đồng hạng 2',
      badgeColor: 'silver',
      personalContributedKm: 42.0,
      teamTotalKm: 1000.0,
      status: 'running',
    },
    {
      raceId: 'race-vpbank-prep',
      name: 'VPBank Hanoi Marathon Prep 2026',
      slug: 'vpbank-hanoi-marathon-prep-2026',
      club: 'Hanoi Runners Union',
      team: 'Tigers Speed',
      teamStanding: 2,
      teamStandingLabel: 'Đồng hạng 2',
      badgeColor: 'silver',
      personalContributedKm: 68.0,
      teamTotalKm: 928.0,
      status: 'running',
    },
  ];

  constructor(private dataStore: InMemoryDataStore) {}

  /**
   * [1.1] Get Strava status and webhook connectivity
   */
  getStravaStatus(userId: string): StravaStatusDto {
    return {
      connected: true,
      athleteId: '94827103',
      athleteName: 'Nguyễn Văn A',
      username: 'athlete.nguyen@sarc.vn',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
      lastSyncAt: this.lastSyncTime.toISOString(),
      webhookActive: true,
      syncStatus: 'idle',
      totalSyncedRuns: this.userRunsCount,
    };
  }

  /**
   * [1.1] Manual / On-demand Strava sync
   */
  syncStravaActivities(userId: string): {
    success: boolean;
    syncedCount: number;
    message: string;
    lastSyncAt: string;
    addedKm: number;
    newCompletedKm: number;
  } {
    this.lastSyncTime = new Date();
    this.userRunsCount += 1;
    const addedKm = 2.5; // New run synced
    this.userCompletedKm = Math.round((this.userCompletedKm + addedKm) * 10) / 10;

    // Record activity in dataStore
    const newAct: Activity = {
      id: `act-strava-${Date.now()}`,
      userId,
      stravaActivityId: `s-${Date.now()}`,
      sportType: 'Run',
      startAt: new Date(),
      distanceM: addedKm * 1000,
      movingTimeS: 750,
      elapsedTimeS: 780,
      elevationGainM: 15,
      status: 'active',
    };
    this.dataStore.saveActivity(newAct);

    return {
      success: true,
      syncedCount: 1,
      message: `Đã đồng bộ 1 bài chạy mới từ Strava (+${addedKm} km)!`,
      lastSyncAt: this.lastSyncTime.toISOString(),
      addedKm,
      newCompletedKm: this.userCompletedKm,
    };
  }

  /**
   * [1.2] Weekly Cycle Progress with prorated targets and grace calculation
   */
  getWeeklyProgress(userId: string, activeDays = 7, isMidWeekJoin = false): WeeklyProgressDto {
    const standardTargetKm = 20.0;
    const targetKm = isMidWeekJoin ? calculateCycleTarget(standardTargetKm, activeDays, 7, 'prorate') : standardTargetKm;
    const completedKm = this.userCompletedKm;
    const remainingKm = Math.max(0, Math.round((targetKm - completedKm) * 10) / 10);
    const completionPercent = Math.min(100, Math.round((completedKm / targetKm) * 1000) / 10);

    const now = new Date();
    // Monday 06:00 grace cutoff
    const hoursRemaining = 41; // < 48 hours simulated window
    const daysRemaining = Math.floor(hoursRemaining / 24);

    return {
      cycleId: 'cycle-w1-2026',
      weekNumber: 1,
      cycleStart: '2026-11-02T00:00:00+07:00',
      cycleEnd: '2026-11-08T23:59:59+07:00',
      gracePeriodEnd: '2026-11-09T06:00:00+07:00',
      standardTargetKm,
      targetKm,
      completedKm,
      remainingKm,
      completionPercent,
      isProrated: isMidWeekJoin,
      activeDays,
      daysRemaining,
      hoursRemaining,
      graceHours: 6,
      status: remainingKm === 0 ? 'completed' : (hoursRemaining < 48 ? 'at_risk' : 'in_progress'),
    };
  }

  /**
   * [1.3] Penalty Warning Banner evaluation (< 48h and unfulfilled km)
   */
  getPenaltyWarning(userId: string): PenaltyWarningDto {
    const progress = this.getWeeklyProgress(userId);
    const isAtRisk = progress.hoursRemaining < 48 && progress.remainingKm > 0;
    const penaltyEval = evaluateCyclePenalty(progress.completedKm, progress.targetKm, 50000, false);

    if (isAtRisk) {
      return {
        active: true,
        level: 'CRITICAL',
        hoursRemaining: progress.hoursRemaining,
        missingKm: progress.remainingKm,
        penaltyAmountVnd: penaltyEval.penaltyAmountVnd,
        deadline: 'Thứ 2, 09/11/2026 lúc 06:00 sáng (sau 6h ân hạn)',
        message: `Cảnh báo phạt sớm: Bạn còn thiếu ${progress.remainingKm} km và thời gian chu kỳ chỉ còn ${progress.hoursRemaining} giờ!`,
        recommendation: `Chạy bù ngay tối thiểu ${progress.remainingKm} km trước hạn chót để tránh bị phạt ${penaltyEval.penaltyAmountVnd.toLocaleString('vi-VN')}đ!`,
      };
    }

    return {
      active: false,
      level: 'CLEAR',
      hoursRemaining: progress.hoursRemaining,
      missingKm: 0,
      penaltyAmountVnd: 0,
      deadline: 'Thứ 2, 09/11/2026 lúc 06:00 sáng',
      message: 'Chúc mừng! Bạn đã hoàn thành chỉ tiêu tuần, không có nguy cơ phạt.',
      recommendation: 'Duy trì phong độ để đóng góp điểm cho toàn đội!',
    };
  }

  /**
   * [1.4] Enrolled Races List for Carousel
   */
  getEnrolledRaces(userId: string): EnrolledRaceDto[] {
    return this.enrolledRaces;
  }

  /**
   * [1.5] Join race by invite code or QR link
   */
  joinRaceByCode(userId: string, rawCode: string): {
    success: boolean;
    message: string;
    race?: EnrolledRaceDto;
  } {
    const code = rawCode.trim().toUpperCase();

    const CODE_MAP: Record<string, { raceId: string; name: string; slug: string; club: string; team: string; teamStanding: number; teamStandingLabel: string; badgeColor: 'gold' | 'silver' }> = {
      'OR-8K2Q': {
        raceId: 'race-season-10',
        name: 'Mùa 10 Run to Techcombank 2026',
        slug: 'season-10-run-to-techcombank',
        club: 'SARC (Saigon Athletics Running Club)',
        team: 'Phoenix SARC',
        teamStanding: 1,
        teamStandingLabel: '#1 Dẫn đầu',
        badgeColor: 'gold',
      },
      'SARC-2026': {
        raceId: 'race-trail-bavi-2026',
        name: 'SARC Trail Challenge Ba Vì 2026',
        slug: 'sarc-trail-challenge-bavi-2026',
        club: 'SARC Trail Division',
        team: 'Dragons Trail',
        teamStanding: 2,
        teamStandingLabel: 'Đồng hạng 2',
        badgeColor: 'silver',
      },
      'VPBANK-MARATHON': {
        raceId: 'race-vpbank-prep',
        name: 'VPBank Hanoi Marathon Prep 2026',
        slug: 'vpbank-hanoi-marathon-prep-2026',
        club: 'Hanoi Runners Union',
        team: 'Tigers Speed',
        teamStanding: 2,
        teamStandingLabel: 'Đồng hạng 2',
        badgeColor: 'silver',
      },
      'RUN-OPEN-77': {
        raceId: 'race-open-fall',
        name: 'Giải Chạy Mở Rộng Mùa Thu 2026',
        slug: 'giai-chay-mo-rong-mua-thu-2026',
        club: 'OpenRace Community',
        team: 'Warriors Team',
        teamStanding: 1,
        teamStandingLabel: '#1 Dẫn đầu',
        badgeColor: 'gold',
      },
    };

    const target = CODE_MAP[code];
    if (!target) {
      return {
        success: false,
        message: `Mã mời hoặc mã QR "${code}" không hợp lệ hoặc đã hết hạn! Vui lòng kiểm tra lại.`,
      };
    }

    // Check if already enrolled
    const existing = this.enrolledRaces.find((r) => r.raceId === target.raceId);
    if (existing) {
      return {
        success: true,
        message: `Bạn đã tham gia giải "${target.name}" trước đó (Đội ${target.team})!`,
        race: existing,
      };
    }

    const newEnrolled: EnrolledRaceDto = {
      raceId: target.raceId,
      name: target.name,
      slug: target.slug,
      club: target.club,
      team: target.team,
      teamStanding: target.teamStanding,
      teamStandingLabel: target.teamStandingLabel,
      badgeColor: target.badgeColor,
      personalContributedKm: 0.0,
      teamTotalKm: 50.0,
      status: 'running',
    };

    this.enrolledRaces.push(newEnrolled);

    return {
      success: true,
      message: `Chào mừng bạn gia nhập giải "${target.name}"! Bạn đã được xếp vào ${target.team}.`,
      race: newEnrolled,
    };
  }

  /**
   * [Enterprise Layer I.2] GitHub-style Running Streak Contributions Heatmap
   * Returns 91 days (13 weeks x 7 days) of daily distance & streak tracking
   */
  getContributionsHeatmap(athleteId: string = 'user-01') {
    const today = new Date('2026-11-06T00:00:00Z');
    const days: Array<{
      date: string;
      distanceKm: number;
      level: number; // 0: 0km, 1: 3-5km, 2: 5-10km, 3: 10-15km, 4: >15km
      isDiligent: boolean;
      paceAvg?: string;
    }> = [];

    // Deterministic simulation based on athlete's active days
    const totalDays = 91; // 13 weeks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let activeDaysCount = 0;
    let totalKm = 0;

    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay(); // 0 is Sun, 6 is Sat

      // Athletes run mostly on Tue, Thu, Sat, Sun
      let km = 0;
      const seed = (d.getDate() * 17 + d.getMonth() * 31) % 100;
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        // Weekend long run
        km = seed > 20 ? Number((10 + (seed % 12)).toFixed(1)) : 0;
      } else if (dayOfWeek === 2 || dayOfWeek === 4) {
        // Midweek tempo
        km = seed > 30 ? Number((5 + (seed % 6)).toFixed(1)) : 0;
      } else if (dayOfWeek === 3 || dayOfWeek === 5) {
        // Recovery
        km = seed > 50 ? Number((3 + (seed % 4)).toFixed(1)) : 0;
      }

      // Recent 12 days continuous streak up to today
      if (i <= 12 && i > 0) {
        km = km > 0 ? km : Number((4.5 + (i % 3)).toFixed(1));
      } else if (i === 0) {
        km = 5.2; // Today run
      }

      let level = 0;
      if (km > 0 && km < 3.0) level = 0; // Below minimum
      else if (km >= 3.0 && km < 6.0) level = 1;
      else if (km >= 6.0 && km < 10.0) level = 2;
      else if (km >= 10.0 && km < 16.0) level = 3;
      else if (km >= 16.0) level = 4;

      const isDiligent = km >= 3.0;
      if (isDiligent) {
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
        activeDaysCount++;
        totalKm += km;
      } else {
        tempStreak = 0;
      }

      days.push({
        date: dateStr,
        distanceKm: km,
        level,
        isDiligent,
        paceAvg: km > 0 ? '5:24/km' : undefined,
      });
    }

    // Current streak from the end backwards
    currentStreak = 0;
    for (let j = days.length - 1; j >= 0; j--) {
      if (days[j].isDiligent) currentStreak++;
      else break;
    }

    return {
      athleteId,
      totalDays,
      activeDaysCount,
      currentStreak: Math.max(currentStreak, 12),
      longestStreak: Math.max(longestStreak, 18),
      totalDistanceKm: Number(totalKm.toFixed(1)),
      days,
    };
  }

  /**
   * [Enterprise Layer II.2] Dynamic VietQR with Unique Transaction Memo
   * Generates dynamic payment metadata with per-athlete memo for instant bank webhook settlement
   */
  getDynamicVietQr(athleteId: string = 'user-01', amountVnd: number = 100000, raceSlug: string = 'season-10-run-to-techcombank') {
    const memo = `SARC_${athleteId.toUpperCase().replace(/[^A-Z0-9]/g, '')}_${Math.round(amountVnd / 1000)}K_M10`;
    const bankAccount = '9988226688';
    const bankName = 'Techcombank (TCB)';
    const accountName = 'CLB CHAY BO SARC';
    const vietQrUrl = `https://img.vietqr.io/image/TCB-${bankAccount}-compact2.png?amount=${amountVnd}&addInfo=${encodeURIComponent(memo)}&accountName=${encodeURIComponent(accountName)}`;

    return {
      success: true,
      athleteId,
      raceSlug,
      amountVnd,
      memo,
      bankCode: 'TCB',
      bankName,
      bankAccount,
      accountName,
      vietQrUrl,
      status: 'PENDING_PAYMENT',
      expiresInMinutes: 30,
      instructions: `Quét mã VietQR bằng App Ngân hàng bất kỳ. Giữ nguyên nội dung chuyển khoản "${memo}" để hệ thống xóa nợ tự động trong 3 giây.`,
    };
  }

  // ========================================================
  // PRO RUNNER ENHANCEMENTS: 4 STRATEGIC WIDGETS
  // ========================================================

  /**
   * [Widget 1] Garmin / Coros Training Load & Recovery Tracker
   */
  getTrainingLoadAndRecovery(userId: string = 'user-01'): TrainingLoadRecovery {
    return this.dataStore.getTrainingLoad(userId);
  }

  refreshTrainingLoad(userId: string = 'user-01'): TrainingLoadRecovery {
    return this.dataStore.refreshTrainingLoad(userId);
  }

  /**
   * [Widget 2] Shoe Mileage Tracker
   */
  getRunningShoes(userId: string = 'user-01'): RunningShoe[] {
    return this.dataStore.getRunningShoes(userId);
  }

  createRunningShoe(userId: string, data: Partial<RunningShoe>): RunningShoe {
    return this.dataStore.createRunningShoe(userId, data);
  }

  updateRunningShoe(id: string, data: Partial<RunningShoe>): RunningShoe {
    return this.dataStore.updateRunningShoe(id, data);
  }

  setDefaultShoe(userId: string, shoeId: string): RunningShoe {
    return this.dataStore.setDefaultShoe(userId, shoeId);
  }

  /**
   * [Widget 3] Hydration & Nutrition Planner (Kế hoạch dinh dưỡng & bù nước cho Long Run)
   */
  calculateNutritionPlan(input: NutritionPlanInput): NutritionPlanResult {
    const distanceKm = Math.max(1, Number(input.distanceKm) || 21.1);
    const paceMinPerKm = Math.max(3.0, Number(input.paceMinPerKm) || 5.5);
    const weightKg = Number(input.runnerWeightKg) || 65;
    const tempC = Number(input.temperatureC) !== undefined ? Number(input.temperatureC) : 28;
    const humidity = Number(input.humidity) !== undefined ? Number(input.humidity) : 75;

    // 1. Duration calculation
    const totalMinutes = Math.round(distanceKm * paceMinPerKm);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const durationFormatted = hours > 0 ? `${hours} giờ ${mins} phút` : `${mins} phút`;

    // 2. Calorie Burned (Standard Running Formula: MET ~ 1.036 kcal/kg/km)
    const caloriesBurned = Math.round(distanceKm * weightKg * 1.036);

    // 3. Hydration Volume (Base sweat rate 600 - 750 ml/h + weather heat coefficient)
    // If temp > 25°C, sweat rate increases ~ 15-20 ml per degree C per hour
    const heatExcess = Math.max(0, tempC - 24);
    const hourlyFluidRateMl = Math.min(1000, Math.round(650 + heatExcess * 20 + (humidity > 70 ? 50 : 0)));
    const totalFluidMl = Math.round((totalMinutes / 60) * hourlyFluidRateMl);

    // 4. Energy Gel Count
    // Under 60 min: 0-1 gel. Above 60 min: first gel at 45 min, then 1 gel every 40-45 min
    let gelCount = 0;
    if (totalMinutes >= 60) {
      gelCount = 1 + Math.floor((totalMinutes - 45) / 45);
    } else if (totalMinutes >= 45) {
      gelCount = 1;
    }

    // 5. Electrolyte (Sodium)
    // Average 500-700 mg sodium per 1,000 ml sweat
    const recommendedElectrolyteMg = Math.round((totalFluidMl / 1000) * 650);

    const tips = [
      `Uống từng ngụm nhỏ 150-200ml mỗi 20 phút (tổng ${totalFluidMl} ml) để ruột hấp thu tối ưu.`,
      gelCount > 0 ? `Nạp gói Gel đầu tiên tại phút thứ 40-45, kèm theo ít nhất 100ml nước lọc.` : `Bài chạy ngắn dưới 45 phút không cần nạp năng lượng trong khi chạy.`,
      tempC >= 30 ? `Thời tiết nóng ${tempC}°C: Bổ sung viên muối điện giải (SaltStick) trước khi chạy 15 phút.` : `Thời tiết lý tưởng (${tempC}°C): Duy trì nhịp uống đều đặn.`,
    ];

    const weatherNote = `Nhiệt độ ${tempC}°C • Độ ẩm ${humidity}% • Điều kiện chạy ${tempC > 28 ? 'Nóng ẩm (Cần chú ý bù khoáng)' : 'Mát mẻ lý tưởng'}`;

    return {
      estimatedDurationMinutes: totalMinutes,
      estimatedDurationFormatted: durationFormatted,
      estimatedCaloriesBurned: caloriesBurned,
      recommendedWaterMl: totalFluidMl,
      recommendedElectrolyteMg,
      recommendedGelCount: gelCount,
      intakeSchedule: {
        hydrationIntervalMin: 20,
        waterPerIntervalMl: Math.round(hourlyFluidRateMl / 3),
        gelIntervalMin: 45,
        tips,
      },
      weatherAdjustmentNote: weatherNote,
    };
  }

  /**
   * [Widget 4] Personal Milestones & Running Streak Dashboard
   */
  getMilestonesAndStreak(userId: string = 'user-01'): RunnerMilestonesStreak {
    return this.dataStore.getMilestones(userId);
  }

  /**
   * [Widget 4 Action] Generate Digital Mini Certificate & Social Share Content
   */
  generateDigitalCertificate(userId: string = 'user-01', badgeCode: string = 'HM_SUB_145') {
    const milestones = this.dataStore.getMilestones(userId);
    const badge = milestones.recentBadges.find(b => b.code === badgeCode || b.id === badgeCode) || milestones.recentBadges[0];

    const certificateId = badge.verificationHash || `OR-CERT-${Date.now().toString().slice(-6)}`;
    const issueDate = badge.achievedAt;
    const athleteName = 'Nguyễn Văn A';
    const clubName = 'Saigon Athletics Running Club (SARC)';

    const shareContent = `🏆 [OpenRace 2026] Vừa đạt được thành tích: "${badge.title}"!\n` +
      `🔥 Chuỗi chạy: ${milestones.currentStreakDays} ngày liên tiếp • Tổng cự ly mùa: ${milestones.seasonTotalKm} KM.\n` +
      `Đồng hành cùng CLB ${clubName}.\n` +
      `Xác thực số: ${certificateId} #OpenRace #RunningStreak #Marathon`;

    return {
      success: true,
      badge,
      certificate: {
        certificateId,
        athleteName,
        clubName,
        badgeTitle: badge.title,
        badgeCategory: badge.category,
        rarity: badge.rarity,
        issueDate,
        qrVerificationUrl: `https://openrace.vn/verify-cert/${certificateId}`,
        issuer: 'OpenRace SaaS Athletic Federation',
      },
      shareContent,
    };
  }
}
