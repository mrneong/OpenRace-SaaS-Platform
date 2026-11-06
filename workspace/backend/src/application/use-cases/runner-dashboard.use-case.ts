/**
 * Runner Dashboard (Personal Hub) Use Case
 * Subsystem [1.0] - Implements submenus [1.1] to [1.5]
 */

import { InMemoryDataStore } from '../../infrastructure/repositories/in-memory-data.store';
import { calculateCycleTarget, evaluateCyclePenalty } from '../../domain/cycle-penalty/cycle-penalty';
import { evaluateActivity } from '../../domain/rule-engine/rule-engine';
import { getDefaultRuleSet, type Activity, type Race } from '../../domain/models/models';

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
}
