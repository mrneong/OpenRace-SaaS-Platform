'use client';

import React, { createContext, useContext, useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { evaluateActivity } from '../../../backend/src/domain/rule-engine/rule-engine';
import { computeTeamScore, rankTeams } from '../../../backend/src/domain/scoring/scoring-leaderboard';
import { evaluateCyclePenalty } from '../../../backend/src/domain/cycle-penalty/cycle-penalty';
import { getDefaultRuleSet } from '../../../backend/src/domain/models/models';
import type { RuleSet, Activity, Race, EvaluationResult } from '../../../backend/src/domain/models/models';

export interface ActivityItem {
  id: string;
  athleteId: string;
  athleteName: string;
  title: string;
  distanceKm: number;
  movingTimeSec: number;
  elevationGainM: number;
  startDate: string;
  isValid: boolean;
  rejectReason?: string;
  rejectCode?: string;
  bonusDistanceKm: number;
  finalDistanceKm: number;
  paceStr: string;
  isTrail: boolean;
  appealStatus?: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
  appealId?: string;
}

export interface TeamItem {
  id: string;
  name: string;
  slogan: string;
  currentMembers: number;
  maxMembers: number;
  totalKm: number;
  diligentDays: number;
  score: number;
  rank: number;
}

export interface AppealItem {
  id: string;
  activityId: string;
  activityTitle: string;
  runnerName: string;
  runnerId: string;
  originalKm: number;
  reason: string;
  evidenceUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adjustedKm?: number;
  adminNote?: string;
  createdAt: string;
}

export interface FinanceLedgerItem {
  id: string;
  runnerName: string;
  runnerId: string;
  teamName: string;
  tieredFee: number;
  penaltyFee: number;
  totalDue: number;
  status: 'UNPAID' | 'PENDING_CONFIRMATION' | 'PAID' | 'WAIVED';
  waiverReason?: string;
  referenceCode: string;
}

export interface AuditLogItem {
  id: string;
  action: string;
  actor: string;
  details: string;
  timestamp: string;
}

interface RaceContextType {
  race: Race;
  rules: RuleSet;
  activities: ActivityItem[];
  teams: TeamItem[];
  appeals: AppealItem[];
  financeLedger: FinanceLedgerItem[];
  auditLogs: AuditLogItem[];
  // Interactive Actions (CRUD & Execution)
  addActivity: (data: {
    title: string;
    distanceKm: number;
    movingTimeSec: number;
    elevationGainM: number;
    isTrail: boolean;
    startDate?: string;
  }) => { success: boolean; isValid: boolean; message: string; activity: ActivityItem };
  submitAppeal: (activityId: string, reason: string, evidenceUrl?: string) => boolean;
  reviewAppeal: (appealId: string, status: 'APPROVED' | 'REJECTED', adjustedKm?: number, adminNote?: string) => void;
  createTeam: (name: string, slogan: string, maxMembers?: number) => TeamItem;
  joinTeam: (teamId: string, runnerName?: string) => { success: boolean; message: string };
  updateRuleSet: (updates: Partial<RuleSet>) => { success: boolean; message: string };
  publishRuleSet: (updates: Partial<RuleSet>) => void;
  confirmPayment: (ledgerId: string) => void;
  waivePenalty: (ledgerId: string, reason: string) => void;
  runnerMarkPaid: (ledgerId: string) => void;
  setRaceLifecycle: (status: 'draft' | 'open' | 'running' | 'finalizing' | 'closed') => void;
  recalculateAll: () => { totalActivities: number; validCount: number; rejectedCount: number };
  exportData: (type: 'activities' | 'finance' | 'leaderboard', format: 'csv' | 'json') => void;
}

const RaceContext = createContext<RaceContextType | undefined>(undefined);

export function RaceProvider({ children }: { children: ReactNode }) {
  const defaultRules = getDefaultRuleSet();
  const [rules, setRules] = useState<RuleSet>(defaultRules);

  const [race, setRace] = useState<Race>({
    id: 'race-m10',
    clubId: 'club-sadc',
    name: 'Mùa 10 Run to Techcombank 2026 – SADC/SARC',
    slug: 'mua-10-run-to-techcombank',
    startAt: new Date('2026-10-01T00:00:00+07:00'),
    endAt: new Date('2026-12-15T23:59:59+07:00'),
    status: 'running',
    rules: defaultRules,
  });

  const [teams, setTeams] = useState<TeamItem[]>([
    {
      id: 'team-phoenix',
      name: 'Team Phoenix SARC',
      slogan: 'Vươn cao đôi cánh phụng hoàng',
      currentMembers: 16,
      maxMembers: 16,
      totalKm: 1250.0,
      diligentDays: 118,
      score: 18.4,
      rank: 1,
    },
    {
      id: 'team-dragons',
      name: 'Team Dragons SADC',
      slogan: 'Mãnh long vượt ải',
      currentMembers: 14,
      maxMembers: 16,
      totalKm: 1000.0,
      diligentDays: 140,
      score: 18.0,
      rank: 2,
    },
    {
      id: 'team-tigers',
      name: 'Team Tigers SADC',
      slogan: 'Mãnh hổ xuất sơn',
      currentMembers: 15,
      maxMembers: 16,
      totalKm: 920.0,
      diligentDays: 110,
      score: 15.22,
      rank: 2,
    },
  ]);

  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: 'act-1',
      athleteId: 'runner-self',
      athleteName: 'Nguyễn Văn A',
      title: 'Chạy sáng Hồ Tây đón bình minh',
      distanceKm: 5.2,
      movingTimeSec: 1716,
      elevationGainM: 40,
      startDate: new Date(Date.now() - 3600000 * 4).toISOString(),
      isValid: true,
      bonusDistanceKm: 0,
      finalDistanceKm: 5.2,
      paceStr: '5:30',
      isTrail: false,
      appealStatus: 'NONE',
    },
    {
      id: 'act-2',
      athleteId: 'runner-self',
      athleteName: 'Nguyễn Văn A',
      title: 'Chạy Trail Đền Gióng Sóc Sơn',
      distanceKm: 6.0,
      movingTimeSec: 4380,
      elevationGainM: 260,
      startDate: new Date(Date.now() - 86400000).toISOString(),
      isValid: true,
      bonusDistanceKm: 2.0,
      finalDistanceKm: 8.0,
      paceStr: '12:10',
      isTrail: true,
      appealStatus: 'NONE',
    },
    {
      id: 'act-3',
      athleteId: 'runner-self',
      athleteName: 'Nguyễn Văn A',
      title: 'Khởi động ngắn công viên Thống Nhất',
      distanceKm: 2.4,
      movingTimeSec: 864,
      elevationGainM: 10,
      startDate: new Date(Date.now() - 86400000 * 2).toISOString(),
      isValid: false,
      rejectCode: 'BELOW_MIN_DISTANCE',
      rejectReason: 'Cự ly 2.4 km nhỏ hơn mức tối thiểu 3.0 km',
      bonusDistanceKm: 0,
      finalDistanceKm: 0,
      paceStr: '6:00',
      isTrail: false,
      appealStatus: 'NONE',
    },
    {
      id: 'act-4',
      athleteId: 'runner-b',
      athleteName: 'Trần Thị B',
      title: 'Chạy nhanh cầu Nhật Tân',
      distanceKm: 6.0,
      movingTimeSec: 840,
      elevationGainM: 20,
      startDate: new Date(Date.now() - 86400000 * 3).toISOString(),
      isValid: false,
      rejectCode: 'PACE_IMPLAUSIBLE',
      rejectReason: 'Pace 2:20 min/km vượt ngưỡng sàn 2:45 min/km (nghi vấn xe máy)',
      bonusDistanceKm: 0,
      finalDistanceKm: 0,
      paceStr: '2:20',
      isTrail: false,
      appealStatus: 'PENDING',
      appealId: 'app-1',
    },
  ]);

  const [appeals, setAppeals] = useState<AppealItem[]>([
    {
      id: 'app-1',
      activityId: 'act-4',
      activityTitle: 'Chạy nhanh cầu Nhật Tân (6.0 km)',
      runnerName: 'Trần Thị B',
      runnerId: 'runner-b',
      originalKm: 6.0,
      reason: 'Đoạn đổ dốc cầu Nhật Tân gió xuôi và lỗi GPS làm quãng đường bị co ngắn.',
      evidenceUrl: 'https://strava.com/activities/123456789',
      status: 'PENDING',
      createdAt: '2026-11-04T18:30:00Z',
    },
  ]);

  const [financeLedger, setFinanceLedger] = useState<FinanceLedgerItem[]>([
    {
      id: 'fin-1',
      runnerName: 'Nguyễn Văn A (Bạn)',
      runnerId: 'runner-self',
      teamName: 'Team Phoenix SARC',
      tieredFee: 100000,
      penaltyFee: 0,
      totalDue: 100000,
      status: 'UNPAID',
      referenceCode: 'OR10-K7Q2',
    },
    {
      id: 'fin-2',
      runnerName: 'Lê Hoàng Yến',
      runnerId: 'runner-y',
      teamName: 'Team Dragons SADC',
      tieredFee: 200000,
      penaltyFee: 50000,
      totalDue: 250000,
      status: 'PAID',
      referenceCode: 'OR10-Y9P1',
    },
    {
      id: 'fin-3',
      runnerName: 'Phạm Minh Đức',
      runnerId: 'runner-d',
      teamName: 'Team Tigers SADC',
      tieredFee: 200000,
      penaltyFee: 50000,
      totalDue: 250000,
      status: 'PENDING_CONFIRMATION',
      referenceCode: 'OR10-D4M8',
    },
  ]);

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([
    {
      id: 'log-1',
      action: 'SYSTEM_BOOT',
      actor: 'System Orchestrator',
      details: 'Khởi tạo hệ thống OpenRace Mùa 10 với Rule Set v1',
      timestamp: '2026-11-05T08:00:00Z',
    },
  ]);

  // 1. ADD ACTIVITY (CRUD - CREATE & EXECUTE)
  const addActivity = (data: {
    title: string;
    distanceKm: number;
    movingTimeSec: number;
    elevationGainM: number;
    isTrail: boolean;
    startDate?: string;
  }) => {
    const paceMin = data.movingTimeSec / 60 / data.distanceKm;
    const paceSec = Math.round((paceMin * 60) % 60);
    const paceStr = `${Math.floor(paceMin)}:${paceSec < 10 ? '0' : ''}${paceSec}`;
    const startAtDate = data.startDate ? new Date(data.startDate) : new Date();

    // Domain Activity entity
    const activityEntity: Activity = {
      id: `act-${Date.now()}`,
      userId: 'runner-self',
      stravaActivityId: `str-${Date.now()}`,
      sportType: data.isTrail ? 'TrailRun' : 'Run',
      startAt: startAtDate,
      elapsedTimeS: data.movingTimeSec + 60,
      movingTimeS: data.movingTimeSec,
      distanceM: Math.round(data.distanceKm * 1000),
      elevationGainM: data.elevationGainM,
      status: 'active',
    };

    // Execute through Domain Rule Engine (Including 2:45 min/km Pace Floor Lock)
    const evalResult = evaluateActivity(activityEntity, rules, race);

    const newActItem: ActivityItem = {
      id: activityEntity.id,
      athleteId: activityEntity.userId,
      athleteName: 'Nguyễn Văn A',
      title: data.title,
      distanceKm: data.distanceKm,
      movingTimeSec: data.movingTimeSec,
      elevationGainM: data.elevationGainM,
      startDate: activityEntity.startAt.toISOString(),
      isValid: evalResult.isValid,
      rejectCode: evalResult.rejectCode,
      rejectReason: evalResult.rejectMessage,
      bonusDistanceKm: evalResult.bonusDistanceKm,
      finalDistanceKm: evalResult.finalDistanceKm,
      paceStr,
      isTrail: data.isTrail,
      appealStatus: 'NONE',
    };

    setActivities((prev) => [newActItem, ...prev]);

    // Update Team km and score if valid
    if (evalResult.isValid && evalResult.finalDistanceKm > 0) {
      setTeams((prev) =>
        prev.map((t) => {
          if (t.id === 'team-phoenix') {
            const newTotalKm = t.totalKm + evalResult.finalDistanceKm;
            return {
              ...t,
              totalKm: Math.round(newTotalKm * 10) / 10,
              score: Math.round((t.score + (evalResult.finalDistanceKm / 1000) * 10) * 100) / 100,
            };
          }
          return t;
        })
      );
    }

    // Add Audit Log
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        action: 'ACTIVITY_INGESTED',
        actor: 'Nguyễn Văn A',
        details: `Ghi nhận bài chạy "${data.title}" - ${data.distanceKm}km: ${
          evalResult.isValid ? `HỢP LỆ (+${evalResult.finalDistanceKm}km)` : `TỪ CHỐI (${evalResult.rejectCode})`
        }`,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);

    return {
      success: true,
      isValid: evalResult.isValid,
      message: evalResult.isValid
        ? `Đã ghi nhận ${evalResult.finalDistanceKm} km hợp lệ${
            evalResult.bonusDistanceKm > 0 ? ` (bao gồm +${evalResult.bonusDistanceKm}km thưởng Trail)` : ''
          }!`
        : `Bài chạy bị từ chối: ${evalResult.rejectMessage}`,
      activity: newActItem,
    };
  };

  // 2. SUBMIT APPEAL (CRUD - CREATE)
  const submitAppeal = (activityId: string, reason: string, evidenceUrl?: string) => {
    const act = activities.find((a) => a.id === activityId);
    if (!act) return false;

    const appealId = `app-${Date.now()}`;
    const newAppeal: AppealItem = {
      id: appealId,
      activityId,
      activityTitle: `${act.title} (${act.distanceKm} km)`,
      runnerName: act.athleteName,
      runnerId: act.athleteId,
      originalKm: act.distanceKm,
      reason,
      evidenceUrl,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    setAppeals((prev) => [newAppeal, ...prev]);

    setActivities((prev) =>
      prev.map((a) => (a.id === activityId ? { ...a, appealStatus: 'PENDING', appealId } : a))
    );

    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        action: 'APPEAL_SUBMITTED',
        actor: act.athleteName,
        details: `Nộp đơn khiếu nại cho bài: "${act.title}" - Lý do: ${reason}`,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);

    return true;
  };

  // 3. ADMIN REVIEW APPEAL (CRUD - UPDATE & EXECUTE ADJUSTMENT)
  const reviewAppeal = (
    appealId: string,
    status: 'APPROVED' | 'REJECTED',
    adjustedKm?: number,
    adminNote?: string
  ) => {
    const targetAppeal = appeals.find((a) => a.id === appealId);
    if (!targetAppeal) return;

    setAppeals((prev) =>
      prev.map((app) =>
        app.id === appealId
          ? {
              ...app,
              status,
              adjustedKm: status === 'APPROVED' ? adjustedKm ?? targetAppeal.originalKm : 0,
              adminNote: adminNote || (status === 'APPROVED' ? 'Chấp thuận khiếu nại' : 'Từ chối khiếu nại'),
            }
          : app
      )
    );

    const kmToAdd = status === 'APPROVED' ? adjustedKm ?? targetAppeal.originalKm : 0;

    // Update Activity
    setActivities((prev) =>
      prev.map((act) => {
        if (act.id === targetAppeal.activityId) {
          return {
            ...act,
            appealStatus: status,
            isValid: status === 'APPROVED' ? true : act.isValid,
            finalDistanceKm: status === 'APPROVED' ? kmToAdd : act.finalDistanceKm,
          };
        }
        return act;
      })
    );

    // If approved, adjust Team score & km
    if (status === 'APPROVED' && kmToAdd > 0) {
      setTeams((prev) =>
        prev.map((t) => {
          if (t.id === 'team-phoenix') {
            return {
              ...t,
              totalKm: Math.round((t.totalKm + kmToAdd) * 10) / 10,
              score: Math.round((t.score + (kmToAdd / 1000) * 10) * 100) / 100,
            };
          }
          return t;
        })
      );
    }

    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        action: 'APPEAL_REVIEWED',
        actor: 'Admin',
        details: `Duyệt khiếu nại #${appealId}: ${status} - Điều chỉnh: +${kmToAdd} km - Ghi chú: ${adminNote || ''}`,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  // 4. CREATE TEAM (CRUD - CREATE)
  const createTeam = (name: string, slogan: string, maxMembers = 16) => {
    const newTeam: TeamItem = {
      id: `team-${Date.now()}`,
      name,
      slogan,
      currentMembers: 1,
      maxMembers,
      totalKm: 0,
      diligentDays: 0,
      score: 0,
      rank: teams.length + 1,
    };

    setTeams((prev) => [...prev, newTeam]);

    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        action: 'TEAM_CREATED',
        actor: 'Admin',
        details: `Tạo đội thi mới: "${name}" (Sức chứa tối đa: ${maxMembers})`,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);

    return newTeam;
  };

  // 5. JOIN TEAM (CRUD - UPDATE)
  const joinTeam = (teamId: string, runnerName = 'Nguyễn Văn A') => {
    const targetTeam = teams.find((t) => t.id === teamId);
    if (!targetTeam) return { success: false, message: 'Đội thi không tồn tại!' };
    if (targetTeam.currentMembers >= targetTeam.maxMembers) {
      return { success: false, message: `Đội ${targetTeam.name} đã đủ sĩ số tối đa (${targetTeam.maxMembers} VĐV)!` };
    }

    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, currentMembers: t.currentMembers + 1 } : t))
    );

    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        action: 'TEAM_JOINED',
        actor: runnerName,
        details: `VĐV ${runnerName} đã gia nhập "${targetTeam.name}"`,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);

    return { success: true, message: `Chúc mừng bạn đã gia nhập đội ${targetTeam.name}!` };
  };

  // 6. UPDATE / PUBLISH RULES (CRUD - UPDATE & VERSIONING)
  const updateRuleSet = (updates: Partial<RuleSet>) => {
    // Invariant: System absolute pace floor lock at 2:45 min/km (2.75)
    if (updates.paceMin && updates.paceMin < 2.75) {
      return {
        success: false,
        message: 'LỖI: Không thể đặt pace tối thiểu nhanh hơn sàn tuyệt đối 2:45 min/km (2.75 min/km)!',
      };
    }

    setRules((prev) => ({ ...prev, ...updates }));
    return { success: true, message: 'Cập nhật cấu hình nháp thành công!' };
  };

  const publishRuleSet = (updates: Partial<RuleSet>) => {
    const newVersion = (rules.version || 1) + 1;
    const publishedRules: RuleSet = {
      ...rules,
      ...updates,
      version: newVersion,
    };

    setRules(publishedRules);

    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        action: 'RULES_PUBLISHED',
        actor: 'Admin',
        details: `Ban hành quy chế phiên bản mới [v${newVersion}] - Pace sàn: 2:45 min/km`,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  // 7. FINANCE ACTIONS (CRUD - UPDATE)
  const confirmPayment = (ledgerId: string) => {
    setFinanceLedger((prev) =>
      prev.map((item) => (item.id === ledgerId ? { ...item, status: 'PAID' } : item))
    );

    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        action: 'PAYMENT_CONFIRMED',
        actor: 'Admin',
        details: `Xác nhận thu nộp quỹ thành công cho mục #${ledgerId}`,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const waivePenalty = (ledgerId: string, reason: string) => {
    setFinanceLedger((prev) =>
      prev.map((item) =>
        item.id === ledgerId
          ? {
              ...item,
              penaltyFee: 0,
              totalDue: item.tieredFee,
              status: 'WAIVED',
              waiverReason: reason,
            }
          : item
      )
    );

    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        action: 'PENALTY_WAIVED',
        actor: 'Admin',
        details: `Miễn trừ tiền phạt mục #${ledgerId} - Lý do: ${reason}`,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const runnerMarkPaid = (ledgerId: string) => {
    setFinanceLedger((prev) =>
      prev.map((item) => (item.id === ledgerId ? { ...item, status: 'PENDING_CONFIRMATION' } : item))
    );
  };

  // 8. RACE LIFECYCLE (EXECUTE)
  const setRaceLifecycle = (status: 'draft' | 'open' | 'running' | 'finalizing' | 'closed') => {
    setRace((prev) => ({ ...prev, status }));

    // If transitioning to closed, freeze dues
    if (status === 'closed') {
      setFinanceLedger((prev) =>
        prev.map((item) => {
          const isWinner = item.teamName.includes('Phoenix');
          return {
            ...item,
            tieredFee: isWinner ? 100000 : 200000,
            totalDue: (isWinner ? 100000 : 200000) + item.penaltyFee,
          };
        })
      );
    }

    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        action: 'RACE_LIFECYCLE_CHANGED',
        actor: 'Admin',
        details: `Chuyển trạng thái giải đấu sang "${status.toUpperCase()}"`,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  // 9. RECALCULATE ALL ACTIVITIES (EXECUTE)
  const recalculateAll = () => {
    let valid = 0;
    let rejected = 0;
    let addedKm = 0;

    const reEvaluated = activities.map((act) => {
      const paceMin = act.movingTimeSec / 60 / act.distanceKm;
      const paceSec = Math.round((paceMin * 60) % 60);
      const paceStr = `${Math.floor(paceMin)}:${paceSec < 10 ? '0' : ''}${paceSec}`;
      const startAtDate = new Date(act.startDate);

      const entity: Activity = {
        id: act.id,
        userId: act.athleteId,
        stravaActivityId: `str-${act.id}`,
        sportType: act.isTrail ? 'TrailRun' : 'Run',
        startAt: startAtDate,
        elapsedTimeS: act.movingTimeSec + 60,
        movingTimeS: act.movingTimeSec,
        distanceM: Math.round(act.distanceKm * 1000),
        elevationGainM: act.elevationGainM,
        status: 'active',
      };

      const result = evaluateActivity(entity, rules, race);
      if (result.isValid) {
        valid++;
        addedKm += result.finalDistanceKm;
      } else {
        rejected++;
      }

      return {
        ...act,
        isValid: result.isValid,
        rejectCode: result.rejectCode,
        rejectReason: result.rejectMessage,
        bonusDistanceKm: result.bonusDistanceKm,
        finalDistanceKm: result.finalDistanceKm,
        paceStr,
      };
    });

    setActivities(reEvaluated);

    // Update Team standings
    setTeams((prev) => {
      const updated = prev.map((t) => {
        if (t.id === 'team-phoenix') {
          return { ...t, totalKm: Math.round((1200 + addedKm) * 10) / 10 };
        }
        return t;
      });
      return updated;
    });

    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        action: 'BATCH_RECALCULATED',
        actor: 'Admin',
        details: `Tính lại toàn bộ ${activities.length} bài chạy: ${valid} Hợp lệ, ${rejected} Bị loại`,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);

    return { totalActivities: activities.length, validCount: valid, rejectedCount: rejected };
  };

  // 10. EXPORT DATA (CSV / JSON)
  const exportData = (type: 'activities' | 'finance' | 'leaderboard', format: 'csv' | 'json') => {
    let dataToExport: any[] = [];
    let filename = `openrace-${type}-${Date.now()}.${format}`;

    if (type === 'activities') {
      dataToExport = activities.map((a) => ({
        ID: a.id,
        VĐV: a.athleteName,
        Tên_bài: a.title,
        Cự_ly_km: a.distanceKm,
        Thời_gian_giây: a.movingTimeSec,
        Pace: a.paceStr,
        Gain_m: a.elevationGainM,
        Hợp_lệ: a.isValid ? 'YES' : 'NO',
        Lý_do_loại: a.rejectReason || '',
        Thưởng_trail_km: a.bonusDistanceKm,
        Cự_ly_chốt_km: a.finalDistanceKm,
        Ngày_chạy: a.startDate,
      }));
    } else if (type === 'finance') {
      dataToExport = financeLedger.map((f) => ({
        VĐV: f.runnerName,
        Đội: f.teamName,
        Phí_quỹ: f.tieredFee,
        Phạt_thiếu_km: f.penaltyFee,
        Tổng_nộp: f.totalDue,
        Trạng_thái: f.status,
        Mã_tham_chiếu: f.referenceCode,
      }));
    } else {
      dataToExport = teams.map((t) => ({
        Hạng: t.rank,
        Tên_đội: t.name,
        Sĩ_số: `${t.currentMembers}/${t.maxMembers}`,
        Tổng_km: t.totalKm,
        Ngày_chuyên_cần: t.diligentDays,
        Tổng_điểm: t.score,
      }));
    }

    if (typeof window !== 'undefined') {
      let content = '';
      let mimeType = 'text/plain';

      if (format === 'json') {
        content = JSON.stringify(dataToExport, null, 2);
        mimeType = 'application/json';
      } else {
        if (dataToExport.length > 0) {
          const headers = Object.keys(dataToExport[0]).join(',');
          const rows = dataToExport.map((row) =>
            Object.values(row)
              .map((val) => `"${val}"`)
              .join(',')
          );
          content = [headers, ...rows].join('\n');
          mimeType = 'text/csv';
        }
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const value = useMemo(
    () => ({
      race,
      rules,
      activities,
      teams,
      appeals,
      financeLedger,
      auditLogs,
      addActivity,
      submitAppeal,
      reviewAppeal,
      createTeam,
      joinTeam,
      updateRuleSet,
      publishRuleSet,
      confirmPayment,
      waivePenalty,
      runnerMarkPaid,
      setRaceLifecycle,
      recalculateAll,
      exportData,
    }),
    [race, rules, activities, teams, appeals, financeLedger, auditLogs]
  );

  return <RaceContext.Provider value={value}>{children}</RaceContext.Provider>;
}

export function useRace() {
  const context = useContext(RaceContext);
  if (!context) {
    throw new Error('useRace must be used within a RaceProvider');
  }
  return context;
}
