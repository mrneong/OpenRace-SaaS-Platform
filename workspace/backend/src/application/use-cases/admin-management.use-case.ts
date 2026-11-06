/**
 * Admin Management Use Case (TypeScript)
 * Handles race administration, appeals review, finance settlements, waivers, and audit trail
 */

import { InMemoryDataStore, AppealRecord, ParticipantLedgerRecord, PenaltyWaiverRecord, AuditRecord } from '../../infrastructure/repositories/in-memory-data.store';

export class AdminManagementUseCase {
  constructor(private readonly dataStore: InMemoryDataStore) {}

  getAppeals(): AppealRecord[] {
    return Array.from(this.dataStore.appeals.values());
  }

  approveAppeal(appealId: string, adminId: string, note: string): AppealRecord {
    const appeal = this.dataStore.approveAppeal(appealId, adminId, note);
    // Mark activity log as valid if present
    const existingLog = this.dataStore.getEvaluationLog(appeal.raceId, appeal.activityId);
    if (existingLog) {
      existingLog.isValid = true;
      existingLog.rejectCode = undefined;
      existingLog.rejectMessage = undefined;
    }
    return appeal;
  }

  rejectAppeal(appealId: string, adminId: string, note: string): AppealRecord {
    return this.dataStore.rejectAppeal(appealId, adminId, note);
  }

  reviewAppeal(
    appealId: string,
    adminId: string,
    status: 'APPROVED' | 'REJECTED',
    creditedKm?: number,
    note?: string
  ): AppealRecord {
    if (status === 'APPROVED') {
      const appeal = this.approveAppeal(appealId, adminId, note || 'Phê duyệt khiếu nại');
      if (creditedKm !== undefined) {
        const existingLog = this.dataStore.getEvaluationLog(appeal.raceId, appeal.activityId);
        if (existingLog) {
          existingLog.finalDistanceKm = creditedKm;
        }
      }
      return appeal;
    } else {
      return this.rejectAppeal(appealId, adminId, note || 'Từ chối khiếu nại');
    }
  }

  createRace(raceData: any): any {
    const slug = raceData.slug || `race-${Date.now()}`;
    const race = {
      id: `race-${Date.now()}`,
      slug,
      name: raceData.name || 'Giải chạy mới',
      status: 'active',
      startDate: raceData.startDate || new Date().toISOString(),
      endDate: raceData.endDate || new Date(Date.now() + 30 * 86400000).toISOString(),
      ruleSet: raceData.ruleSet || { minDistanceKm: 3.0, paceMinS: 165, targetKmPerCycle: 20 },
      topReward: raceData.topReward || { title: 'Áo thi đấu CLB SARC' },
      maxTeamMembers: raceData.maxTeamMembers || 16,
    };
    this.dataStore.raceStatus[race.id] = 'active';
    return race;
  }

  getParticipantLedgers(): ParticipantLedgerRecord[] {
    return Array.from(this.dataStore.participantLedgers.values());
  }

  settlePayment(participantId: string, adminId: string, note?: string): ParticipantLedgerRecord {
    return this.dataStore.settleParticipantPayment(participantId, adminId, note);
  }

  grantPenaltyWaiver(
    raceId: string,
    cycleId: string,
    userId: string,
    reason: string,
    adminId: string
  ): PenaltyWaiverRecord {
    return this.dataStore.grantPenaltyWaiver(raceId, cycleId, userId, reason, adminId);
  }

  updateRaceStatus(raceId: string, status: string, adminId: string): string {
    return this.dataStore.updateRaceStatus(raceId, status, adminId);
  }

  getAuditLogs(): AuditRecord[] {
    return [...this.dataStore.auditLogs].reverse();
  }

  getSystemMetrics() {
    return {
      activeClubs: 1,
      totalAthletes: 48,
      racesCount: 1,
      webhookEventsTotal: this.dataStore.webhookEvents.length,
      pendingAppeals: Array.from(this.dataStore.appeals.values()).filter((a) => a.status === 'OPEN').length,
      unpaidBalanceTotal: Array.from(this.dataStore.participantLedgers.values()).reduce(
        (acc, curr) => acc + (curr.status !== 'PAID' ? curr.totalDueVnd - curr.paidVnd : 0),
        0
      ),
      uptimeSeconds: Math.floor(process.uptime()),
    };
  }
}
