import { InMemoryDataStore } from '../../infrastructure/repositories/in-memory-data.store';
import { AdminManagementUseCase } from './admin-management.use-case';

describe('System Monitoring & Operations Command Center (v3.14.0-PROD)', () => {
  let dataStore: InMemoryDataStore;
  let adminUseCase: AdminManagementUseCase;

  beforeEach(() => {
    dataStore = new InMemoryDataStore();
    adminUseCase = new AdminManagementUseCase(dataStore);
  });

  describe('AC-OPS-STRAVA-QUOTA-01: Strava API Quota Burn Rate & Token Rotation', () => {
    it('should calculate real-time quota burn rate, projected ceiling time, and toggle token rotation', () => {
      const quota = adminUseCase.getStravaQuotaForecast();
      expect(quota).toBeDefined();
      expect(quota.period15m.limit).toBe(600);
      expect(quota.period15m.usage).toBe(124);
      expect(quota.period15m.percentage).toBeCloseTo(20.67, 1);
      expect(quota.period15m.burnRatePerMin).toBeGreaterThan(0);
      expect(quota.period15m.projectedTimeToCeilingMin).toBeGreaterThan(0);

      expect(quota.periodDaily.limit).toBe(30000);
      expect(quota.periodDaily.usage).toBe(3450);
      expect(quota.periodDaily.burnRatePerHour).toBeGreaterThan(0);
      expect(quota.activeAppPool.length).toBeGreaterThanOrEqual(2);

      const toggled = adminUseCase.toggleTokenRotation(false);
      expect(toggled.tokenRotationEnabled).toBe(false);

      const reToggled = adminUseCase.toggleTokenRotation(true);
      expect(reToggled.tokenRotationEnabled).toBe(true);
    });
  });

  describe('AC-OPS-DLQ-SURGERY-02: DLQ Data Surgery Station & Exponential Retry', () => {
    it('should inspect failed payloads, edit malformed fields inline, and replay webhook', () => {
      const dlqItems = adminUseCase.getDlqSurgeryItems();
      expect(dlqItems.length).toBeGreaterThanOrEqual(2);

      const targetItem = dlqItems.find(item => item.id === 'dlq-strava-8801');
      expect(targetItem).toBeDefined();
      expect(targetItem!.nextRetryDelaySec).toBe(4); // Exponential delay
      expect(targetItem!.status).toBe('PENDING_SURGERY');

      // Inline surgery edit
      const patched = adminUseCase.editDlqPayload('dlq-strava-8801', {
        start_date_local: '2026-11-07T06:15:00.000Z'
      });
      expect(patched.surgeryPatchedFields?.start_date_local).toBe('2026-11-07T06:15:00.000Z');
      expect(patched.rawPayload.start_date_local).toBe('2026-11-07T06:15:00.000Z');

      // Instant replay
      const replayResult = adminUseCase.replayDlqWebhook('dlq-strava-8801');
      expect(replayResult.success).toBe(true);
      expect(replayResult.status).toBe('RESOLVED');
      expect(replayResult.message).toContain('successfully patched and replayed');
    });
  });

  describe('AC-OPS-TENANT-HEALTH-03: Multi-Tenant Health Matrix & Policy Freeze', () => {
    it('should retrieve tenant health metrics and toggle tenant freeze status', () => {
      const matrix = adminUseCase.getTenantHealthMatrix();
      expect(matrix.totalTenants).toBeGreaterThanOrEqual(3);
      expect(matrix.totalActiveRunnersDau).toBeGreaterThan(0);
      expect(matrix.totalStorageUsedMb).toBeGreaterThan(0);

      const targetTenant = matrix.tenants.find(t => t.tenantId === 'tenant-vpr-prod-03');
      expect(targetTenant).toBeDefined();
      expect(targetTenant!.isFrozen).toBe(false);

      // Freeze tenant
      const frozen = adminUseCase.toggleTenantFreeze('tenant-vpr-prod-03', true, 'Tạm đóng băng kiểm tra hóa đơn');
      expect(frozen.isFrozen).toBe(true);
      expect(frozen.freezeReason).toBe('Tạm đóng băng kiểm tra hóa đơn');

      // Unfreeze tenant
      const unfrozen = adminUseCase.toggleTenantFreeze('tenant-vpr-prod-03', false);
      expect(unfrozen.isFrozen).toBe(false);
      expect(unfrozen.freezeReason).toBeUndefined();
    });
  });

  describe('AC-OPS-SCOPED-RECOMPUTE-04: Scoped Recomputation Engine with Audit Trail', () => {
    it('should execute scoped recompute and track progress with immutable audit log', () => {
      const result = adminUseCase.executeScopedRecompute({
        scopeType: 'TENANT',
        tenantId: 'tenant-sarc-prod-01',
        recalculatePaceAndDPlus: true,
        recomputeLeaderboardRankings: true,
        triggerActor: 'ops-admin@openrace.vn'
      });

      expect(result.jobId).toBeDefined();
      expect(result.scopeType).toBe('TENANT');
      expect(result.status).toBe('COMPLETED');
      expect(result.progressPercent).toBe(100);
      expect(result.auditLogId).toBeDefined();

      const status = adminUseCase.getScopedRecomputeStatus(result.jobId);
      expect(status.progressPercent).toBe(100);
    });
  });

  describe('AC-OPS-TRAFFIC-ANALYTICS-05: Real-Time Traffic & Concurrency Heatmap', () => {
    it('should track 24h concurrency heatmap with peak hours and edge network metrics', () => {
      const traffic = adminUseCase.getTrafficAnalytics();
      expect(traffic.currentConcurrentUsers).toBeGreaterThan(0);
      expect(traffic.peakConcurrentToday).toBe(710);
      expect(traffic.averageLatencyMs).toBeLessThan(100);
      expect(traffic.heatmap24h.length).toBe(24);

      // Peak hours verification: 05:00-07:00 and 18:00-21:00
      const hour5 = traffic.heatmap24h.find(h => h.hour === 5);
      const hour6 = traffic.heatmap24h.find(h => h.hour === 6);
      const hour19 = traffic.heatmap24h.find(h => h.hour === 19);
      const hour12 = traffic.heatmap24h.find(h => h.hour === 12);

      expect(hour5!.isPeakHour).toBe(true);
      expect(hour6!.isPeakHour).toBe(true);
      expect(hour19!.isPeakHour).toBe(true);
      expect(hour12!.isPeakHour).toBe(false);
    });
  });

  describe('AC-OPS-PARTNER-ECOSYSTEM-06: Partner Ecosystem Uptime & Scoped API Keys', () => {
    it('should monitor 99.9% uptime SLA and manage scoped developer API keys', () => {
      const ecosystem = adminUseCase.getPartnerEcosystem();
      expect(ecosystem.partners.length).toBe(5);
      expect(ecosystem.overallSlaUptimePercent).toBeGreaterThanOrEqual(99.8);
      expect(ecosystem.activeOutageCount).toBe(0);

      // Create new scoped developer API key
      const newKey = adminUseCase.generatePartnerApiKey({
        name: 'Ba Vi Ultra Trail Gate Scanner',
        scopes: ['read:races', 'write:activities']
      });
      expect(newKey.id).toBeDefined();
      expect(newKey.keyPrefix).toMatch(/^op_live_/);
      expect(newKey.scopes).toEqual(['read:races', 'write:activities']);
      expect(newKey.status).toBe('ACTIVE');

      // Revoke key
      const revoked = adminUseCase.revokePartnerApiKey(newKey.id);
      expect(revoked.status).toBe('REVOKED');
    });
  });

  describe('AC-OPS-BUSINESS-BILLING-07: SaaS Business & Billing Intelligence', () => {
    it('should calculate MRR, Churn Rate %, ARPU, and multi-tenant revenue streams', () => {
      const billing = adminUseCase.getSaasBillingIntelligence();
      expect(billing.monthlyRecurringRevenueVnd).toBe(42500000);
      expect(billing.annualRunRateVnd).toBe(510000000);
      expect(billing.churnRatePercent).toBe(1.2);
      expect(billing.arpuVnd).toBe(3540000);
      expect(billing.revenueBreakdown.tenantSubscriptionsVnd).toBeGreaterThan(0);
      expect(billing.revenueBreakdown.racePlatformFeeVnd).toBeGreaterThan(0);
      expect(billing.revenueBreakdown.ticketCommissionVnd).toBeGreaterThan(0);
      expect(billing.monthlyTrends.length).toBeGreaterThanOrEqual(6);
    });
  });

  describe('AC-OPS-SECURITY-AUDIT-08: Security Anomaly Detection & Immutable SHA-256 Audit Trail', () => {
    it('should report anomalies and maintain tamper-evident SHA-256 hash chains', () => {
      const sec = adminUseCase.getSecurityAuditHub();
      expect(sec.anomalies.length).toBeGreaterThanOrEqual(2);
      expect(sec.auditTrail.length).toBeGreaterThanOrEqual(2);
      expect(sec.tamperVerificationSummary.isCompromised).toBe(false);

      // Verify SHA-256 hash chain
      for (let i = 1; i < sec.auditTrail.length; i++) {
        expect(sec.auditTrail[i].previousRecordHash).toBe(sec.auditTrail[i - 1].payloadHashSha256);
        expect(sec.auditTrail[i].payloadHashSha256).toMatch(/^[0-9a-f]{64}$/);
      }
    });
  });
});
