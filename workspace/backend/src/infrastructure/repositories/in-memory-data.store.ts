/**
 * In-Memory Data Store simulating Supabase PostgreSQL with RLS semantics
 */

import type { Activity, EvaluationResult } from '../../domain/models/models';

export interface WebhookEventRecord {
  id: string;
  source: string;
  eventKey: string;
  payload: any;
  receivedAt: string;
  status: 'QUEUED' | 'PROCESSED';
}

export interface AppealRecord {
  id: string;
  raceId: string;
  userId: string;
  athleteName?: string;
  activityId: string;
  activityTitle?: string;
  distanceKm?: number;
  reason: string;
  evidenceUrl?: string;
  status: 'OPEN' | 'APPROVED' | 'REJECTED';
  resolvedBy?: string;
  resolutionNote?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface ParticipantLedgerRecord {
  participantId: string;
  userId: string;
  athleteName: string;
  teamId: string;
  teamName: string;
  rank: number;
  baseContributionVnd: number;
  penaltyVnd: number;
  totalDueVnd: number;
  paidVnd: number;
  status: 'UNPAID' | 'PARTIAL' | 'PAID';
  paymentReference: string;
  lastUpdated: string;
}

export interface PenaltyWaiverRecord {
  id: string;
  raceId: string;
  cycleId: string;
  userId: string;
  reason: string;
  grantedBy: string;
  grantedAt: string;
}

export interface AuditRecord {
  id: string;
  action: string;
  actorId: string;
  details: any;
  timestamp: string;
}

export class InMemoryDataStore {
  public activities: Map<string, Activity> = new Map();
  public webhookEvents: WebhookEventRecord[] = [];
  public raceLogs: Map<string, EvaluationResult> = new Map();
  public appeals: Map<string, AppealRecord> = new Map();
  public participantLedgers: Map<string, ParticipantLedgerRecord> = new Map();
  public penaltyWaivers: PenaltyWaiverRecord[] = [];
  public manualAdjustments: any[] = [];
  public auditLogs: AuditRecord[] = [];
  public raceStatus: Record<string, string> = {
    'race-season-10': 'running',
  };

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData(): void {
    // Seed sample appeal
    const appeal1: AppealRecord = {
      id: 'app-1001',
      raceId: 'race-season-10',
      userId: 'user-02',
      athleteName: 'Trần Thị B',
      activityId: 'act-strava-7788',
      activityTitle: 'Chạy Trail Đền Gióng Sóc Sơn',
      distanceKm: 6.0,
      reason: 'Đoạn leo dốc dốc đá GPS mất tín hiệu 200m dẫn đến pace 12:15, tổng gain 260m đạt chuẩn Trail',
      status: 'OPEN',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    };
    this.appeals.set(appeal1.id, appeal1);

    // Seed participant ledgers
    this.participantLedgers.set('p-01', {
      participantId: 'p-01',
      userId: 'user-01',
      athleteName: 'Nguyễn Văn A',
      teamId: 'team-phoenix',
      teamName: 'Team Phoenix SARC',
      rank: 1,
      baseContributionVnd: 100000,
      penaltyVnd: 0,
      totalDueVnd: 100000,
      paidVnd: 100000,
      status: 'PAID',
      paymentReference: 'OR10-P01-A',
      lastUpdated: new Date().toISOString(),
    });

    this.participantLedgers.set('p-02', {
      participantId: 'p-02',
      userId: 'user-02',
      athleteName: 'Trần Thị B',
      teamId: 'team-dragons',
      teamName: 'Team Dragons SADC',
      rank: 2,
      baseContributionVnd: 200000,
      penaltyVnd: 50000,
      totalDueVnd: 250000,
      paidVnd: 0,
      status: 'UNPAID',
      paymentReference: 'OR10-P02-B',
      lastUpdated: new Date().toISOString(),
    });

    this.participantLedgers.set('p-03', {
      participantId: 'p-03',
      userId: 'user-03',
      athleteName: 'Lê Hoàng C',
      teamId: 'team-tigers',
      teamName: 'Team Tigers SADC',
      rank: 2,
      baseContributionVnd: 200000,
      penaltyVnd: 0,
      totalDueVnd: 200000,
      paidVnd: 0,
      status: 'UNPAID',
      paymentReference: 'OR10-P03-C',
      lastUpdated: new Date().toISOString(),
    });

    // Seed audit log
    this.auditLogs.push({
      id: 'aud-001',
      action: 'SYSTEM_BOOTSTRAP',
      actorId: 'system',
      details: { message: 'OpenRace SaaS Engine initialized with Supabase Schema' },
      timestamp: new Date().toISOString(),
    });

    // Seed activities for user-01 (Nguyen Van A)
    this.activities.set('act-000076', {
      id: 'act-000076',
      userId: 'user-01',
      stravaActivityId: 'strava-889976',
      sportType: 'Run',
      distanceM: 5200,
      movingTimeS: 1800,
      elapsedTimeS: 1850,
      elevationGainM: 15,
      startAt: new Date(Date.now() - 3600000 * 2),
      status: 'active',
    });

    this.activities.set('act-000075', {
      id: 'act-000075',
      userId: 'user-01',
      stravaActivityId: 'strava-889975',
      sportType: 'TrailRun',
      distanceM: 8000,
      movingTimeS: 3600,
      elapsedTimeS: 3700,
      elevationGainM: 260,
      startAt: new Date(Date.now() - 3600000 * 24),
      status: 'active',
    });

    this.activities.set('act-000074', {
      id: 'act-000074',
      userId: 'user-01',
      stravaActivityId: 'strava-889974',
      sportType: 'Run',
      distanceM: 10000,
      movingTimeS: 3300,
      elapsedTimeS: 3400,
      elevationGainM: 20,
      startAt: new Date(Date.now() - 3600000 * 48),
      status: 'active',
    });

    this.activities.set('act-000073', {
      id: 'act-000073',
      userId: 'user-01',
      stravaActivityId: 'strava-889973',
      sportType: 'Run',
      distanceM: 2400,
      movingTimeS: 750,
      elapsedTimeS: 800,
      elevationGainM: 5,
      startAt: new Date(Date.now() - 3600000 * 72),
      status: 'active',
    });

    this.activities.set('act-000072', {
      id: 'act-000072',
      userId: 'user-01',
      stravaActivityId: 'strava-889972',
      sportType: 'Run',
      distanceM: 6000,
      movingTimeS: 900, // 2:30 min/km -> Pace violation (< 2:45)
      elapsedTimeS: 920,
      elevationGainM: 10,
      startAt: new Date(Date.now() - 3600000 * 96),
      status: 'active',
    });
  }

  saveWebhookEvent(source: string, eventKey: string, payload: any): WebhookEventRecord {
    const existing = this.webhookEvents.find((e) => e.eventKey === eventKey);
    if (existing) return existing;

    const record: WebhookEventRecord = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      source,
      eventKey,
      payload,
      receivedAt: new Date().toISOString(),
      status: 'QUEUED',
    };
    this.webhookEvents.push(record);
    return record;
  }

  saveActivity(activity: Activity): void {
    this.activities.set(activity.id, activity);
  }

  getActivity(id: string): Activity | undefined {
    return this.activities.get(id);
  }

  saveEvaluationLog(log: EvaluationResult): void {
    this.raceLogs.set(`${log.raceId}:${log.activityId}`, log);
  }

  getEvaluationLog(raceId: string, activityId: string): EvaluationResult | undefined {
    return this.raceLogs.get(`${raceId}:${activityId}`);
  }

  createAppeal(
    raceId: string,
    userId: string,
    activityId: string,
    reason: string,
    athleteName?: string,
    distanceKm?: number
  ): AppealRecord {
    const id = `app-${Date.now()}`;
    const appeal: AppealRecord = {
      id,
      raceId,
      userId,
      athleteName: athleteName || 'Vận động viên',
      activityId,
      distanceKm: distanceKm || 5.0,
      reason,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    };
    this.appeals.set(id, appeal);

    this.auditLogs.push({
      id: `aud-${Date.now()}`,
      action: 'APPEAL_CREATED',
      actorId: userId,
      details: { appealId: id, raceId, activityId, reason },
      timestamp: new Date().toISOString(),
    });

    return appeal;
  }

  approveAppeal(appealId: string, adminId: string, note: string): AppealRecord {
    const appeal = this.appeals.get(appealId);
    if (!appeal) throw new Error(`Appeal ${appealId} not found`);

    appeal.status = 'APPROVED';
    appeal.resolvedBy = adminId;
    appeal.resolutionNote = note;
    appeal.resolvedAt = new Date().toISOString();

    this.auditLogs.push({
      id: `aud-${Date.now()}`,
      action: 'APPEAL_APPROVED',
      actorId: adminId,
      details: { appealId, note },
      timestamp: new Date().toISOString(),
    });

    return appeal;
  }

  rejectAppeal(appealId: string, adminId: string, note: string): AppealRecord {
    const appeal = this.appeals.get(appealId);
    if (!appeal) throw new Error(`Appeal ${appealId} not found`);

    appeal.status = 'REJECTED';
    appeal.resolvedBy = adminId;
    appeal.resolutionNote = note;
    appeal.resolvedAt = new Date().toISOString();

    this.auditLogs.push({
      id: `aud-${Date.now()}`,
      action: 'APPEAL_REJECTED',
      actorId: adminId,
      details: { appealId, note },
      timestamp: new Date().toISOString(),
    });

    return appeal;
  }

  settleParticipantPayment(participantId: string, adminId: string, note?: string): ParticipantLedgerRecord {
    const record = this.participantLedgers.get(participantId);
    if (!record) throw new Error(`Participant ledger ${participantId} not found`);

    record.paidVnd = record.totalDueVnd;
    record.status = 'PAID';
    record.lastUpdated = new Date().toISOString();

    this.auditLogs.push({
      id: `aud-${Date.now()}`,
      action: 'FINANCE_PAYMENT_CONFIRMED',
      actorId: adminId,
      details: { participantId, athleteName: record.athleteName, settledAmount: record.totalDueVnd, note },
      timestamp: new Date().toISOString(),
    });

    return record;
  }

  grantPenaltyWaiver(raceId: string, cycleId: string, userId: string, reason: string, adminId: string): PenaltyWaiverRecord {
    const record: PenaltyWaiverRecord = {
      id: `wvr-${Date.now()}`,
      raceId,
      cycleId,
      userId,
      reason,
      grantedBy: adminId,
      grantedAt: new Date().toISOString(),
    };
    this.penaltyWaivers.push(record);

    this.auditLogs.push({
      id: `aud-${Date.now()}`,
      action: 'PENALTY_WAIVER_GRANTED',
      actorId: adminId,
      details: record,
      timestamp: new Date().toISOString(),
    });

    return record;
  }

  updateRaceStatus(raceId: string, status: string, adminId: string): string {
    this.raceStatus[raceId] = status;
    this.auditLogs.push({
      id: `aud-${Date.now()}`,
      action: 'RACE_STATUS_UPDATED',
      actorId: adminId,
      details: { raceId, newStatus: status },
      timestamp: new Date().toISOString(),
    });
    return status;
  }

  addManualAdjustment(
    raceId: string,
    userId: string,
    activityId: string,
    adjType: string,
    reason: string,
    adminId: string
  ): void {
    const record = {
      id: `adj-${Date.now()}`,
      raceId,
      userId,
      activityId,
      type: adjType,
      reason,
      approvedBy: adminId,
      createdAt: new Date().toISOString(),
    };
    this.manualAdjustments.push(record);
    this.auditLogs.push({
      id: `aud-${Date.now()}`,
      action: 'MANUAL_ADJUSTMENT',
      actorId: adminId,
      details: record,
      timestamp: new Date().toISOString(),
    });
  }
}
