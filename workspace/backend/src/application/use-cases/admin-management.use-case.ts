/**
 * Admin Management Use Case (TypeScript)
 * Handles race administration, appeals review, finance settlements, waivers, and audit trail
 */

import { InMemoryDataStore, AppealRecord, ParticipantLedgerRecord, PenaltyWaiverRecord, AuditRecord } from '../../infrastructure/repositories/in-memory-data.store';
import type { SystemUser, SystemRole, SystemConfigCategory, SystemConfigParameter, PlatformConfig, CustomPlatformParam, DynamicRaceSetupConfig } from '../../domain/models/models';

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

  // ==========================================
  // SYSTEM ADMIN: USER MANAGEMENT (CRUD + SOFT TOGGLE)
  // ==========================================
  getSystemUsers(filter?: { status?: string; roleId?: string; search?: string }): SystemUser[] {
    return this.dataStore.getSystemUsers(filter);
  }

  getSystemUserById(id: string): SystemUser | undefined {
    return this.dataStore.getSystemUserById(id);
  }

  createSystemUser(data: Partial<SystemUser>, actorId?: string): SystemUser {
    return this.dataStore.createSystemUser(data, actorId);
  }

  updateSystemUser(id: string, data: Partial<SystemUser>, actorId?: string): SystemUser {
    return this.dataStore.updateSystemUser(id, data, actorId);
  }

  toggleSystemUserStatus(id: string, actorId?: string, reason?: string): SystemUser {
    return this.dataStore.toggleSystemUserStatus(id, actorId, reason);
  }

  // ==========================================
  // SYSTEM ADMIN: ROLE & PERMISSION (RBAC)
  // ==========================================
  getSystemRoles(): SystemRole[] {
    return this.dataStore.getSystemRoles();
  }

  getSystemRoleById(id: string): SystemRole | undefined {
    return this.dataStore.getSystemRoleById(id);
  }

  createSystemRole(data: Partial<SystemRole>, actorId?: string): SystemRole {
    return this.dataStore.createSystemRole(data, actorId);
  }

  updateSystemRole(id: string, data: Partial<SystemRole>, actorId?: string): SystemRole {
    return this.dataStore.updateSystemRole(id, data, actorId);
  }

  toggleSystemRoleStatus(id: string, actorId?: string): SystemRole {
    return this.dataStore.toggleSystemRoleStatus(id, actorId);
  }

  // ==========================================
  // SYSTEM ADMIN: CONFIG CATALOGS (4 BỘ DANH MỤC)
  // ==========================================
  getSystemCatalogs(): SystemConfigCategory[] {
    return this.dataStore.getSystemCatalogs();
  }

  getSystemConfigs(catalogCode?: string): SystemConfigParameter[] {
    return this.dataStore.getSystemConfigs(catalogCode);
  }

  createSystemConfig(data: Partial<SystemConfigParameter>, actorId?: string): SystemConfigParameter {
    return this.dataStore.createSystemConfig(data, actorId);
  }

  updateSystemConfig(id: string, data: Partial<SystemConfigParameter>, actorId?: string): SystemConfigParameter {
    return this.dataStore.updateSystemConfig(id, data, actorId);
  }

  toggleSystemConfigStatus(id: string, actorId?: string): SystemConfigParameter {
    return this.dataStore.toggleSystemConfigStatus(id, actorId);
  }

  // ==========================================
  // [AC-PLATFORM-CONFIG-01..04] PLATFORM CONFIGURATION & BRANDING
  // ==========================================
  getPlatformConfig(): PlatformConfig {
    return this.dataStore.getPlatformConfig();
  }

  updatePlatformConfig(updates: Partial<PlatformConfig>, actorId?: string): PlatformConfig {
    return this.dataStore.updatePlatformConfig(updates, actorId);
  }

  toggleCustomPlatformParam(paramId: string, actorId?: string): PlatformConfig {
    return this.dataStore.toggleCustomPlatformParam(paramId, actorId);
  }

  addCustomPlatformParam(param: Partial<CustomPlatformParam>, actorId?: string): PlatformConfig {
    return this.dataStore.addCustomPlatformParam(param, actorId);
  }

  // ==========================================
  // [AC-RACE-WIZARD-STEP1..05] DYNAMIC SETUP WIZARD & PLATFORM CATALOGS
  // ==========================================
  getRaceWizardCatalogs() {
    return this.dataStore.getRaceWizardCatalogs();
  }

  createDynamicRace(config: Partial<DynamicRaceSetupConfig>): DynamicRaceSetupConfig {
    return this.dataStore.createDynamicRace(config);
  }

  getDynamicRaceSetup(raceIdOrSlug: string): DynamicRaceSetupConfig {
    return this.dataStore.getDynamicRaceSetup(raceIdOrSlug);
  }

  calculateRaceAwards(raceIdOrSlug: string) {
    return this.dataStore.calculateRaceAwards(raceIdOrSlug);
  }
}
