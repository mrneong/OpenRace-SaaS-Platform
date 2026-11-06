/**
 * Activity Feed & Thẩm Định Use Case (TypeScript)
 * Subsystem [3.0] NHẬT KÝ BÀI CHẠY & THẨM ĐỊNH (ACTIVITY FEED)
 * - [3.1] Toàn bộ bài chạy cá nhân (All / Valid / Invalid filter)
 * - [3.2] Bộ lọc theo Giải đấu cụ thể (Race Activity Feed)
 * - [3.3] Chi tiết thẩm định (Pace, Moving Time, Elevation Gain, Trail bonus calculation, Mã lý do)
 * - [3.4] Gửi đơn khiếu nại bài chạy lỗi (Submit Appeal Drawer)
 */

import { InMemoryDataStore, AppealRecord } from '../../infrastructure/repositories/in-memory-data.store';
import { evaluateActivity } from '../../domain/rule-engine/rule-engine';
import { getDefaultRuleSet } from '../../domain/models/models';
import type { Activity, Race } from '../../domain/models/models';

export interface ActivityDetailView {
  id: string;
  stravaId: string;
  title: string;
  sportType: string;
  startAt: string;
  distanceKm: number;
  movingTimeSec: number;
  movingTimeFormatted: string;
  avgPaceSec: number;
  avgPaceFormatted: string;
  elevationGainM: number;
  trailBonusKm: number;
  finalCreditedKm: number;
  isValid: boolean;
  statusText: string;
  rejectCode?: string;
  rejectMessage?: string;
  canAppeal: boolean;
  appealStatus?: 'OPEN' | 'APPROVED' | 'REJECTED';
  isPaceViolation: boolean;
}

export class ActivityFeedUseCase {
  private readonly store: InMemoryDataStore;

  constructor(store: InMemoryDataStore) {
    this.store = store;
  }

  /**
   * Helper to format seconds to mm:ss or hh:mm:ss
   */
  private formatSeconds(sec: number): string {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = Math.floor(sec % 60);
    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Helper to format pace (seconds per km) to mm:ss/km
   */
  private formatPace(secPerKm: number): string {
    if (!secPerKm || secPerKm <= 0 || !isFinite(secPerKm)) return '--:--';
    const minutes = Math.floor(secPerKm / 60);
    const seconds = Math.round(secPerKm % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')} /km`;
  }

  /**
   * [3.1] & [3.2] Get activity feed with filter: 'all' | 'valid' | 'invalid' and optional race
   */
  getActivities(
    userId: string,
    filter: 'all' | 'valid' | 'invalid' = 'all',
    raceId = 'season-10-run-to-techcombank'
  ): ActivityDetailView[] {
    const defaultRules = getDefaultRuleSet();
    const defaultRace: Race = {
      id: raceId,
      clubId: 'sarc-club',
      name: 'Mùa 10 Run to Techcombank 2026',
      slug: raceId,
      startAt: new Date('2026-08-01T00:00:00Z'),
      endAt: new Date('2026-12-31T23:59:59Z'),
      status: 'running',
      rules: defaultRules,
    };

    const userActivities: Activity[] = [];
    for (const act of this.store.activities.values()) {
      if (act.userId === userId) {
        userActivities.push(act);
      }
    }

    const appealsList: AppealRecord[] = Array.from(this.store.appeals.values()).filter(
      (a) => a.userId === userId
    );

    const results: ActivityDetailView[] = [];

    for (const act of userActivities) {
      const distKm = act.distanceM / 1000.0;
      const paceSec = distKm > 0 ? act.movingTimeS / distKm : 0;

      // Evaluation using domain rule-engine
      const evalRes = evaluateActivity(act, defaultRace.rules, defaultRace, userActivities);
      const isPaceViolation = paceSec < 165; // < 2:45 min/km

      const userAppeal = appealsList.find((a) => a.activityId === act.id);

      let statusText = 'HỢP LỆ';
      if (!evalRes.isValid) {
        if (evalRes.rejectCode === 'PACE_IMPLAUSIBLE' || isPaceViolation) {
          statusText = 'CẦN XÁC MINH (Pace < 2:45)';
        } else if (evalRes.rejectCode === 'BELOW_MIN_DISTANCE') {
          statusText = 'BỊ LOẠI (< 3.0 km)';
        } else if (evalRes.rejectCode === 'DAILY_LIMIT_EXCEEDED') {
          statusText = 'VƯỢT TRẦN (2 bài/ngày)';
        } else {
          statusText = `BỊ TỪ CHỐI (${evalRes.rejectCode || 'Không hợp lệ'})`;
        }
      } else if (evalRes.bonusDistanceKm > 0) {
        statusText = `TRAIL BONUS (+${evalRes.bonusDistanceKm.toFixed(1)} km)`;
      }

      // Apply filter
      if (filter === 'valid' && !evalRes.isValid) continue;
      if (filter === 'invalid' && evalRes.isValid) continue;

      results.push({
        id: act.id,
        stravaId: act.stravaActivityId,
        title: `Bài chạy ${act.sportType} #${act.stravaActivityId}`,
        sportType: act.sportType,
        startAt: act.startAt.toISOString(),
        distanceKm: evalRes.rawDistanceKm,
        movingTimeSec: act.movingTimeS,
        movingTimeFormatted: this.formatSeconds(act.movingTimeS),
        avgPaceSec: Math.round(paceSec),
        avgPaceFormatted: this.formatPace(paceSec),
        elevationGainM: act.elevationGainM,
        trailBonusKm: evalRes.bonusDistanceKm,
        finalCreditedKm: evalRes.finalDistanceKm,
        isValid: evalRes.isValid,
        statusText,
        rejectCode: evalRes.rejectCode,
        rejectMessage: evalRes.rejectMessage,
        canAppeal: !evalRes.isValid && (!userAppeal || userAppeal.status === 'REJECTED'),
        appealStatus: userAppeal ? userAppeal.status : undefined,
        isPaceViolation,
      });
    }

    return results;
  }

  /**
   * [3.3] Get single activity audit detail
   */
  getActivityDetail(activityId: string, userId: string, raceId?: string): ActivityDetailView | null {
    const list = this.getActivities(userId, 'all', raceId);
    return list.find((a) => a.id === activityId) || null;
  }

  /**
   * [3.4] Submit appeal for an invalid activity
   */
  submitAppeal(userId: string, activityId: string, raceId: string, reason: string, evidenceUrl?: string): AppealRecord {
    const activity = this.store.getActivity(activityId);
    if (!activity) {
      throw new Error(`Hoạt động ${activityId} không tồn tại.`);
    }

    const fullReason = evidenceUrl ? `${reason} (Bằng chứng: ${evidenceUrl})` : reason;
    return this.store.createAppeal(raceId, userId, activityId, fullReason);
  }
}
