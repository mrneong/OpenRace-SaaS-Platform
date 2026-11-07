/**
 * Club Admin & Captain Dashboard (Club Admin Portal) Unit Tests
 * Implements Acceptance Criteria for:
 * - [AC-CLUB-ADMIN-01]: Action-First 4-Zone Dashboard Retrieval
 * - [AC-CLUB-ADMIN-02]: Real-time Health Metrics & Warning Thresholds (<70% completion, >24h dispute, >3d debt)
 * - [AC-CLUB-ADMIN-03]: Batch Approve Operations Queue (Trail, Treadmill HR, Coros/Garmin)
 * - [AC-CLUB-ADMIN-04]: Quick Dispute Resolver (+1km bonus on GPS drift vs retain reject)
 * - [AC-CLUB-ADMIN-05]: Dynamic VietQR Auto-Reconciliation & Dues Reminder
 * - [AC-CLUB-ADMIN-06]: Quick Broadcast Announcements with Markdown Templates
 * - [AC-CLUB-ADMIN-07]: Sunday Season Week Lock
 */

import { InMemoryDataStore } from '../../infrastructure/repositories/in-memory-data.store';
import { ClubHubUseCase } from './club-hub.use-case';

export function runClubAdminDashboardTests(runner: any) {
  runner.suite('Club Admin & Captain Dashboard (AC-CLUB-ADMIN-01 to AC-CLUB-ADMIN-07)', () => {
    const store = new InMemoryDataStore();
    const useCase = new ClubHubUseCase(store);

    runner.test('AC-CLUB-ADMIN-01: Action-First Dashboard retrieves 4 zones, season status and team standings', () => {
      const dash = useCase.getClubAdminDashboard('club-sarc-sadc');

      runner.expect(dash.clubName).toBe('CLB SARC');
      runner.expect(dash.seasonStatus).toBe('Đang chạy (Tuần 20)');
      runner.expect(dash.currentWeek).toBe(20);
      runner.expect(dash.teamStandings.length).toBe(3);
      runner.expect(dash.teamStandings[0].teamName).toBe('Team Phoenix SARC');
      runner.expect(dash.teamStandings[0].rank).toBe(1);
      runner.expect(dash.teamStandings[1].teamName).toBe('Team Dragons SADC');
      runner.expect(dash.teamStandings[2].teamName).toBe('Team Pegasus SARC');
    });

    runner.test('AC-CLUB-ADMIN-02: Real-time Health Metrics trigger warning flags on threshold violations', () => {
      const dash = useCase.getClubAdminDashboard('club-sarc-sadc');
      const kpis = dash.kpis;

      runner.expect(kpis.memberCount).toBe(48);
      runner.expect(kpis.targetMembers).toBe(50);
      runner.expect(kpis.treasuryCollectedVnd).toBe(4800000);
      runner.expect(kpis.pendingReviewCount).toBe(5);

      // Warning thresholds
      // 1. Weekly completion rate < 70% -> triggers warning
      runner.expect(kpis.weeklyCompletionRatePercent).toBe(68.5);
      runner.expect(kpis.weeklyCompletionWarning).toBe(true);

      // 2. Open dispute > 24h -> triggers warning
      runner.expect(kpis.openDisputesCount).toBe(1);
      runner.expect(kpis.openDisputesWarning).toBe(true);

      // 3. Overdue debt > 3 days -> triggers warning
      runner.expect(kpis.outstandingDebtVnd).toBe(50000);
      runner.expect(kpis.outstandingDebtWarning).toBe(true);
    });

    runner.test('AC-CLUB-ADMIN-03: Batch Approve processes all eligible pending runs in 1-touch', () => {
      const beforeDash = useCase.getClubAdminDashboard('club-sarc-sadc');
      runner.expect(beforeDash.pendingActivities.length).toBe(5);

      // 1-touch batch approve all 5
      const result = useCase.batchApproveActivities();
      runner.expect(result.approvedCount).toBe(5);
      runner.expect(result.remainingCount).toBe(0);

      const afterDash = useCase.getClubAdminDashboard('club-sarc-sadc');
      runner.expect(afterDash.pendingActivities.length).toBe(0);
      runner.expect(afterDash.kpis.pendingReviewCount).toBe(0);
    });

    runner.test('AC-CLUB-ADMIN-04: Dispute Resolver awards +1km bonus for GPS drift in tunnel and resolves appeal', () => {
      const dispute = useCase.resolveClubDispute('DISP_2026_001', 'bonus', 1.0, 'Duyệt thưởng +1.0km do hầm Royal City');

      runner.expect(dispute.id).toBe('DISP_2026_001');
      runner.expect(dispute.status).toBe('resolved_bonus');
      runner.expect(dispute.bonusKmGranted).toBe(1.0);
      runner.expect(typeof dispute.resolvedAt).toBe('string');
      runner.expect(dispute.resolutionNote!.includes('Royal City')).toBe(true);
    });

    runner.test('AC-CLUB-ADMIN-05: Dynamic VietQR Auto-Reconciliation settles member penalty dues and reminds', () => {
      // 1. Send reminder
      const reminded = useCase.reconcileLedger('LEDG_001', 'remind');
      runner.expect(reminded.status).toBe('reminded');
      runner.expect(typeof reminded.lastRemindedAt).toBe('string');

      // 2. Settle payment
      const settled = useCase.reconcileLedger('LEDG_001', 'manual_cash');
      runner.expect(settled.status).toBe('paid');
      runner.expect(typeof settled.settledAt).toBe('string');

      // Verification in dashboard
      const dash = useCase.getClubAdminDashboard('club-sarc-sadc');
      runner.expect(dash.kpis.outstandingDebtVnd).toBe(0);
      runner.expect(dash.kpis.outstandingDebtWarning).toBe(false);
    });

    runner.test('AC-CLUB-ADMIN-06: Quick Broadcast creates and dispatches emergency announcements with templates', () => {
      const broadcast = useCase.sendClubBroadcast({
        title: 'Nhắc nhở chốt cự ly trước 23:59 Chủ Nhật',
        content: '📢 Thông báo khẩn: Hãy hoàn thành tối thiểu 3km trước 23:59!',
        templateKey: 'sunday_deadline',
        targetChannel: 'all',
        senderName: 'Trưởng Ban Chuyên Môn SARC',
      });

      runner.expect(broadcast.title).toBe('Nhắc nhở chốt cự ly trước 23:59 Chủ Nhật');
      runner.expect(broadcast.deliveryCount).toBe(48);
      runner.expect(typeof broadcast.sentAt).toBe('string');

      // Validation check
      let threw = false;
      try {
        useCase.sendClubBroadcast({ title: '', content: '' });
      } catch (e) {
        threw = true;
      }
      runner.expect(threw).toBe(true);
    });

    runner.test('AC-CLUB-ADMIN-07: Lock Season Week 20 finalizes weekly progress and freezes ledger', () => {
      const lockResult = useCase.lockSeasonWeek(20);

      runner.expect(lockResult.week).toBe(20);
      runner.expect(lockResult.isLocked).toBe(true);
      runner.expect(typeof lockResult.lockedAt).toBe('string');
      runner.expect(lockResult.totalKm).toBe(3350.0);
    });

    runner.test('AC-CLUB-DASH-ACTION-01: Action-First 3-Queue Hub on Executive Dashboard', () => {
      const freshStore = new InMemoryDataStore();
      const freshUseCase = new ClubHubUseCase(freshStore);
      const dash = freshUseCase.getClubAdminDashboard('club-sarc-sadc');

      // 1. Urgent Review Queue
      runner.expect(dash.pendingActivities !== undefined).toBe(true);
      runner.expect(dash.pendingActivities.length >= 4).toBe(true);

      // 2. Treasury & Overdue Debt Alerts
      runner.expect(dash.reconciliations !== undefined).toBe(true);
      runner.expect(dash.reconciliations.length >= 1).toBe(true);
      runner.expect(dash.reconciliations[0].amountVnd).toBe(50000);

      // 3. Open Tournaments Roster
      runner.expect(dash.openRaces !== undefined).toBe(true);
      runner.expect(dash.openRaces!.length >= 3).toBe(true);
      const trailRace = dash.openRaces!.find(r => r.id === 'race-trail-bavi');
      runner.expect(trailRace !== undefined).toBe(true);
      runner.expect(trailRace!.enrolledCount).toBe(64);
      runner.expect(trailRace!.totalSlots).toBe(80);
      runner.expect(trailRace!.fillRatePercent).toBe(80.0);
    });

    runner.test('AC-CLUB-DASH-PULSE-02: Club Pulse Analytics: Activity Heatmap & Churn Risk Watchlist', () => {
      const pulse = useCase.getClubPulseAnalytics('club-sarc-sadc');

      // 1. Heatmap Grid
      runner.expect(pulse.totalActiveRunners).toBe(128);
      runner.expect(pulse.totalWeeklyRuns).toBe(512);
      runner.expect(pulse.daysHeader.length).toBe(7);
      runner.expect(pulse.blocks.length).toBe(4);
      runner.expect(pulse.blocks[0].dailyCounts.length).toBe(7);
      // Weekend peak check
      runner.expect(pulse.blocks[0].dailyCounts[5]).toBe(58); // T7
      runner.expect(pulse.blocks[0].dailyCounts[6]).toBe(62); // CN

      // 2. Churn Risk Watchlist
      runner.expect(pulse.churnWatchlist.length >= 4).toBe(true);
      const atRiskRunner = pulse.churnWatchlist[0];
      runner.expect(atRiskRunner.inactiveDays >= 14).toBe(true);
      runner.expect(atRiskRunner.status).toBe('pending_reminder');

      // 3. Remind At-Risk Runner
      const reminded = useCase.remindChurnRunner(atRiskRunner.id);
      runner.expect(reminded.status).toBe('reminded');
    });

    runner.test('AC-CLUB-DASH-BROADCAST-03: Quick Broadcast Hub & 2-Step Secure Sunday Week Lock', () => {
      // 1. Multi-Channel Quick Broadcast
      const broadcast = useCase.sendClubBroadcast({
        title: 'Bão số 7 - Cảnh báo an toàn chạy ngoài trời',
        content: 'Khuyến cáo các VĐV chuyển sang tập Treadmill trong nhà',
        targetChannel: 'all',
        channels: ['zalo', 'in_app', 'email'],
        deliveryCount: 128
      });
      runner.expect(broadcast.deliveryCount).toBe(128);
      runner.expect(broadcast.sentChannels!.length).toBe(3);

      // 2. 2-Step Secure Week Lock: Step 1 without confirmation must throw
      let threw = false;
      try {
        useCase.lockSeasonWeek(20, false);
      } catch (e: any) {
        threw = true;
        runner.expect(e.message.includes('xác nhận 2 bước')).toBe(true);
      }
      runner.expect(threw).toBe(true);

      // Step 2 with confirmation succeeds
      const confirmedLock = useCase.lockSeasonWeek(20, true);
      runner.expect(confirmedLock.isLocked).toBe(true);
      runner.expect(confirmedLock.penalizedRunnersCount).toBe(3);
      runner.expect(confirmedLock.totalPenaltyVnd).toBe(150000);
    });

    runner.test('AC-CLUB-DASH-ROLE-04: Role-Based Perspective Customization for Club Executive Committee', () => {
      const presPersp = useCase.getClubRolePerspective('president');
      runner.expect(presPersp.roleTitle).toBe('Chủ Nhiệm CLB');
      runner.expect(presPersp.priorityWidgets.includes('widget-kpis')).toBe(true);

      const techPersp = useCase.getClubRolePerspective('technical');
      runner.expect(techPersp.roleTitle).toBe('Trưởng Ban Chuyên Môn');
      runner.expect(techPersp.priorityWidgets.includes('widget-urgent-review-queue')).toBe(true);

      const treasPersp = useCase.getClubRolePerspective('treasurer');
      runner.expect(treasPersp.roleTitle).toBe('Thủ Quỹ CLB');
      runner.expect(treasPersp.priorityWidgets.includes('widget-reconciliation-queue')).toBe(true);
    });
  });
}

