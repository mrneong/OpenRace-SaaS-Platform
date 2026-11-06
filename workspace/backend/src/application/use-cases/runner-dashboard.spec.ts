/**
 * Acceptance Tests for Subsystem [1.0] Runner Dashboard (Personal Hub)
 * Verifies AC-018 through AC-022
 */

import { InMemoryDataStore } from '../../infrastructure/repositories/in-memory-data.store';
import { RunnerDashboardUseCase } from './runner-dashboard.use-case';

export function runRunnerDashboardTests(runner: any): void {
  const dataStore = new InMemoryDataStore();
  const dashboardUseCase = new RunnerDashboardUseCase(dataStore);

  // [1.1] Strava Status and Webhook Ingestion
  runner.test('AC-Dashboard-1.1: Strava Connection Status & Webhook Connectivity', () => {
    const status = dashboardUseCase.getStravaStatus('user-01');
    runner.expect(status.connected).toBe(true);
    runner.expect(status.athleteId).toBe('94827103');
    runner.expect(status.webhookActive).toBe(true);
    runner.expect(typeof status.lastSyncAt).toBe('string');
  });

  // [1.1] Manual Sync execution
  runner.test('AC-Dashboard-1.1-Sync: On-Demand Strava Sync Execution', () => {
    const syncRes = dashboardUseCase.syncStravaActivities('user-01');
    runner.expect(syncRes.success).toBe(true);
    runner.expect(syncRes.syncedCount).toBe(1);
    runner.expect(syncRes.addedKm).toBe(2.5);
    runner.expect(syncRes.newCompletedKm).toBe(21.0); // 18.5 + 2.5
  });

  // [1.2] Weekly Cycle Progress with Proration
  runner.test('AC-Dashboard-1.2: Weekly Cycle Progress & Prorated Target', () => {
    const fullWeek = dashboardUseCase.getWeeklyProgress('user-01', 7, false);
    runner.expect(fullWeek.targetKm).toBe(20.0);
    runner.expect(fullWeek.isProrated).toBe(false);

    // Mid-week join: 4 active days left
    const midWeek = dashboardUseCase.getWeeklyProgress('user-01', 4, true);
    runner.expect(midWeek.targetKm).toBe(11.5); // ceil(20 * 4 / 7, 0.1) = 11.5 km
    runner.expect(midWeek.isProrated).toBe(true);
  });

  // [1.3] Early Penalty Warning Banner
  runner.test('AC-Dashboard-1.3: Penalty Warning Banner (< 48h and unfulfilled km)', () => {
    // Reset back to at-risk state with a new instance
    const freshUseCase = new RunnerDashboardUseCase(new InMemoryDataStore());
    const warning = freshUseCase.getPenaltyWarning('user-01');
    runner.expect(warning.active).toBe(true);
    runner.expect(warning.level).toBe('CRITICAL');
    runner.expect(warning.missingKm).toBe(1.5);
    runner.expect(warning.penaltyAmountVnd).toBe(50000);
  });

  // [1.4] Active Races Carousel
  runner.test('AC-Dashboard-1.4: Active Races Carousel List', () => {
    const races = dashboardUseCase.getEnrolledRaces('user-01');
    runner.expect(Array.isArray(races)).toBe(true);
    runner.expect(races.length >= 3).toBe(true);
    runner.expect(races[0].teamStanding).toBe(1);
    runner.expect(races[0].teamStandingLabel).toBe('#1 Dẫn đầu');
  });

  // [1.5] Quick QR / Link Entry Join
  runner.test('AC-Dashboard-1.5: Quick QR / Link Entry to Join Race', () => {
    // Valid code
    const joinRes = dashboardUseCase.joinRaceByCode('user-01', 'RUN-OPEN-77');
    runner.expect(joinRes.success).toBe(true);
    runner.expect(joinRes.race?.team).toBe('Warriors Team');

    // Invalid code
    const invalidRes = dashboardUseCase.joinRaceByCode('user-01', 'INVALID-CODE-99');
    runner.expect(invalidRes.success).toBe(false);
  });
}

