/**
 * Acceptance Tests for Subsystem [1.0] Runner Dashboard (Personal Hub)
 * Verifies AC-018 through AC-022
 */

import { InMemoryDataStore } from '../../infrastructure/repositories/in-memory-data.store';
import { RunnerDashboardUseCase } from './runner-dashboard.use-case';
import { getFrontendHtml } from '../../main';

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

  // [AC-DASHBOARD-ENHANCE-01] Eliminate Chức Năng and Thao Tác Nhanh
  runner.test('AC-DASHBOARD-ENHANCE-01: Eliminate Chức Năng sub-nav and Thao Tác Nhanh priority bar from Dashboard', () => {
    const html = getFrontendHtml();
    if (html.includes('Thao Tác Nhanh (Runner Priority Actions):')) {
      throw new Error('Dashboard still contains Thao Tác Nhanh (Runner Priority Actions): priority bar');
    }
    // sub-nav-bar should be hidden
    if (!html.includes('id="sub-nav-bar" class="hidden')) {
      throw new Error('sub-nav-bar is not hidden by default');
    }
  });

  // [AC-DASHBOARD-ENHANCE-02] Interactive Multi-Race Selector for Team Leaderboard Widget
  runner.test('AC-DASHBOARD-ENHANCE-02: Interactive Multi-Race Selector for Team Leaderboard Widget', () => {
    const html = getFrontendHtml();
    if (!html.includes('id="dashboard-team-race-select"')) {
      throw new Error('Missing dashboard-team-race-select race selector in Team Leaderboard widget');
    }
    if (!html.includes('changeDashboardTeamRace(this.value)')) {
      throw new Error('Missing changeDashboardTeamRace handler on select');
    }
    if (!html.includes('id="dashboard-team-leaderboard-list"')) {
      throw new Error('Missing dynamic leaderboard list container dashboard-team-leaderboard-list');
    }
    if (!html.includes('race-season-10') || !html.includes('race-season-09') || !html.includes('race-internal-q3')) {
      throw new Error('Team Leaderboard dropdown missing athlete enrolled race options');
    }
  });

  // [AC-DASHBOARD-ENHANCE-03] Remove Quy Chế Card and Expand Recent Activities to Full Width
  runner.test('AC-DASHBOARD-ENHANCE-03: Remove Quy Chế & Vận Hành card and Expand Activities Table to Full Width', () => {
    const html = getFrontendHtml();
    if (html.includes('Quy Chế & Vận Hành Giải Chạy</h3>')) {
      throw new Error('Dashboard still contains Quy Chế & Vận Hành Giải Chạy card');
    }
    if (!html.includes('Nhật Ký Hoạt Động Mới Nhất')) {
      throw new Error('Missing Nhật Ký Hoạt Động Mới Nhất table');
    }
    if (!html.includes('Full-Width View')) {
      throw new Error('Recent activities table not expanded to full width');
    }
  });

  // [AC-DASHBOARD-ENHANCE-04] Interactive Controls in Hiệu Suất Chạy Bộ
  runner.test('AC-DASHBOARD-ENHANCE-04: Interactive Controls for Hiệu Suất Chạy Bộ & Cự Ly Đội Hàng Tuần', () => {
    const html = getFrontendHtml();
    if (!html.includes('id="btn-perf-week"') || !html.includes('id="btn-perf-season"')) {
      throw new Error('Missing interactive time range buttons btn-perf-week / btn-perf-season');
    }
    if (!html.includes('switchPerfTimeRange(\'week\')') || !html.includes('switchPerfTimeRange(\'season\')')) {
      throw new Error('Missing switchPerfTimeRange click handlers');
    }
    if (!html.includes('id="select-perf-metric"') || !html.includes('changePerfMetric(this.value)')) {
      throw new Error('Missing interactive metric select dropdown or changePerfMetric handler');
    }
    if (!html.includes('exportWeeklyPerfCsv()')) {
      throw new Error('Missing exportWeeklyPerfCsv export handler');
    }
  });

  // [AC-DASHBOARD-ENHANCE-05] Running Streak Displayed as Interactive Monthly Calendar Grid
  runner.test('AC-DASHBOARD-ENHANCE-05: Running Streak Displayed as Interactive Monthly Calendar Grid', () => {
    const html = getFrontendHtml();
    if (!html.includes('id="streak-calendar-grid"')) {
      throw new Error('Missing streak-calendar-grid dynamic calendar container');
    }
    if (!html.includes('id="streak-cal-month-display"')) {
      throw new Error('Missing streak-cal-month-display month indicator');
    }
    if (!html.includes('changeStreakCalendarMonth(-1)') || !html.includes('changeStreakCalendarMonth(1)')) {
      throw new Error('Missing changeStreakCalendarMonth month navigation controls');
    }
    if (!html.includes('renderStreakCalendar')) {
      throw new Error('Missing renderStreakCalendar client function');
    }
  });
}

