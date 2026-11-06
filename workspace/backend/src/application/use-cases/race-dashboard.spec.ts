/**
 * Multi-Selection Tournament Dashboard Unit Test Suite
 * Tests AC-RACE-DASH-01 to AC-RACE-DASH-05
 */

import { InMemoryDataStore } from '../../infrastructure/repositories/in-memory-data.store';
import { RaceDashboardUseCase } from './race-dashboard.use-case';

export function runRaceDashboardTests(runner: any) {
  runner.suite('Multi-Selection Race Dashboard Ecosystem (AC-RACE-DASH-01 to AC-RACE-DASH-05)', () => {
    const dataStore = new InMemoryDataStore();
    const useCase = new RaceDashboardUseCase(dataStore);

    runner.test('AC-RACE-DASH-01: Global Race Selector Bar & Dynamic State Re-fetch', () => {
      const races = useCase.getRacesForSelector();
      if (!Array.isArray(races) || races.length < 4) {
        throw new Error(`Expected at least 4 races, got ${races?.length}`);
      }

      const raceIds = races.map(r => r.id);
      if (!raceIds.includes('race-season-10') || !raceIds.includes('race-season-09') || !raceIds.includes('race-internal-q3') || !raceIds.includes('race-trail-bavi')) {
        throw new Error(`Missing expected race IDs: ${JSON.stringify(raceIds)}`);
      }

      const season10 = races.find(r => r.id === 'race-season-10')!;
      if (!season10.name.includes('Mùa 10') || season10.status !== 'running' || season10.participantsCount !== 128) {
        throw new Error('Season 10 race selector metadata mismatch');
      }

      // Dynamic re-fetch verification
      const dashSeason10 = useCase.getRaceDashboardOverview('race-season-10');
      const dashSeason09 = useCase.getRaceDashboardOverview('season-09-run-to-techcombank');
      const dashInternalQ3 = useCase.getRaceDashboardOverview('race-internal-q3');
      const dashTrail = useCase.getRaceDashboardOverview('race-trail-bavi');

      if (dashSeason10.raceInfo.id !== 'race-season-10' || dashSeason09.raceInfo.id !== 'race-season-09') {
        throw new Error('Dynamic race overview fetching mismatch');
      }
      if (dashInternalQ3.kpis.totalAthletes !== 64 || dashTrail.kpis.totalAthletes !== 52) {
        throw new Error('Race participant count isolation mismatch');
      }

      // Fallback
      const dashFallback = useCase.getRaceDashboardOverview('unknown-race-id');
      if (dashFallback.raceInfo.id !== 'race-season-10') {
        throw new Error('Fallback to default race failed');
      }
    });

    runner.test('AC-RACE-DASH-02: Zone 1 - Race KPI Cards & Progress Tracking', () => {
      const dash = useCase.getRaceDashboardOverview('race-season-10');
      const { kpis } = dash;

      if (kpis.totalAthletes !== 128 || kpis.totalTeams !== 8) {
        throw new Error(`KPI totalAthletes/Teams mismatch: ${kpis.totalAthletes}/${kpis.totalTeams}`);
      }

      if (kpis.athletesByClubOrTeam.length !== 8 || kpis.athletesByClubOrTeam[0].name !== 'Team Phoenix SARC') {
        throw new Error('Athletes breakdown by team mismatch');
      }

      if (kpis.totalAccumulatedKm !== 15420.5 || kpis.targetKm !== 20000.0) {
        throw new Error(`KPI KM values mismatch: ${kpis.totalAccumulatedKm}/${kpis.targetKm}`);
      }

      if (kpis.progressPercent !== 77.1 || kpis.completionRatePercent !== 84.5) {
        throw new Error(`KPI percentages mismatch: ${kpis.progressPercent}% / ${kpis.completionRatePercent}%`);
      }

      if (kpis.totalPrizePoolVnd !== 25000000 || kpis.totalPenaltiesVnd !== 3200000 || kpis.unpaidDebtVnd !== 450000) {
        throw new Error('KPI Financial values mismatch');
      }

      // Completed race verification
      const dash09 = useCase.getRaceDashboardOverview('race-season-09');
      if (dash09.kpis.progressPercent !== 105.2 || dash09.kpis.unpaidDebtVnd !== 0) {
        throw new Error('Completed season 9 financial KPI mismatch');
      }
    });

    runner.test('AC-RACE-DASH-03: Zone 2 - Daily Distance Analytics Bar Chart & Activity Type Distribution', () => {
      const dash = useCase.getRaceDashboardOverview('race-season-10');
      const { dailyAnalytics, activityDistribution } = dash;

      if (dailyAnalytics.length !== 7) {
        throw new Error(`Expected 7 daily analytics points, got ${dailyAnalytics.length}`);
      }

      const saturday = dailyAnalytics.find(d => d.dayOfWeek.includes('Thứ 7'));
      const sunday = dailyAnalytics.find(d => d.dayOfWeek.includes('CN'));
      if (!saturday?.isPeakDay || !sunday?.isPeakDay) {
        throw new Error('Weekend Long Run peak days not correctly flagged');
      }

      if (saturday.distanceKm < 2800 || sunday.distanceKm !== 3420.5) {
        throw new Error('Peak day distance values mismatch');
      }

      // Activity distribution
      if (activityDistribution.roadPercent !== 68.0 || activityDistribution.trailPercent !== 22.0 || activityDistribution.treadmillPercent !== 10.0) {
        throw new Error('Activity percentage distribution mismatch');
      }
      if (activityDistribution.totalActivities !== 829) {
        throw new Error(`Expected 829 total activities, got ${activityDistribution.totalActivities}`);
      }

      const trailDash = useCase.getRaceDashboardOverview('race-trail-bavi');
      if (trailDash.activityDistribution.trailPercent !== 80.0) {
        throw new Error('Trail race trail activity % mismatch');
      }
    });

    runner.test('AC-RACE-DASH-04: Zone 3 - Live Race Leaderboards & Zone 4 - Referee Governance Queues', () => {
      const dash = useCase.getRaceDashboardOverview('race-season-10');
      const { top5Teams, top10Individuals, violationQueue } = dash;

      if (top5Teams.length !== 5) throw new Error(`Expected 5 teams, got ${top5Teams.length}`);
      if (top5Teams[0].rank !== 1 || top5Teams[0].medal !== 'GOLD' || top5Teams[0].medalIcon !== '🥇' || top5Teams[0].totalKm !== 2840.5) {
        throw new Error('Top 1 Gold medal team mismatch');
      }
      if (top5Teams[1].medal !== 'SILVER' || top5Teams[2].medal !== 'BRONZE') {
        throw new Error('Silver and Bronze medals mismatch');
      }

      if (top10Individuals.length !== 10) throw new Error(`Expected 10 individuals, got ${top10Individuals.length}`);
      if (top10Individuals[0].athleteName !== 'Nguyễn Văn A' || top10Individuals[0].totalKm !== 342.5 || top10Individuals[0].streakDays !== 28) {
        throw new Error('Top 1 individual runner mismatch');
      }

      // Zone 4: Violation Queues
      if (violationQueue.length !== 4) throw new Error(`Expected 4 violation queue items, got ${violationQueue.length}`);
      const motorViol = violationQueue.find(v => v.flagType === 'MOTORBIKE_SPEED');
      const trailViol = violationQueue.find(v => v.flagType === 'SUSPICIOUS_TRAIL_GAIN');
      if (!motorViol || !trailViol) throw new Error('Expected motor speed and trail gain violations');
      if (!motorViol.details.includes('cắt đuôi')) throw new Error('Motor speed violation details mismatch');
    });

    runner.test('AC-RACE-DASH-05: Optimal UX Workflow: Live SSE Ticker & 1-Touch Export', () => {
      const initialTotal = useCase.getRaceDashboardOverview('race-season-10').kpis.totalAccumulatedKm;
      const updatedTotal = useCase.incrementRaceDistance('race-season-10', 2.0);
      if (Math.abs(updatedTotal - (initialTotal + 2.0)) > 0.01) {
        throw new Error('incrementRaceDistance failed');
      }

      const report = useCase.exportRaceReport('race-season-10', 'Ban Trọng Tài SARC');
      if (report.raceId !== 'race-season-10' || !report.raceName.includes('Mùa 10')) {
        throw new Error('Export report metadata mismatch');
      }
      if (report.teamsRankings.length !== 5 || report.individualRankings.length !== 10) {
        throw new Error('Export report rankings counts mismatch');
      }
      if (report.auditLogsSummary.totalAudited !== 829 || report.auditLogsSummary.pendingViolations !== 4) {
        throw new Error('Export report audit log summary mismatch');
      }

      // Validate CSV content
      if (!report.csvFinisherContent.includes('BÁO CÁO TỔNG KẾT GIẢI ĐẤU') ||
          !report.csvFinisherContent.includes('BẢNG XẾP HẠNG ĐỘI ĐUA') ||
          !report.csvFinisherContent.includes('DANH SÁCH VẬN ĐỘNG VIÊN FINISHER XUẤT SẮC') ||
          !report.csvFinisherContent.includes('NHẬT KÝ KIỂM ĐỊNH & VI PHẠM TRỌNG TÀI')) {
        throw new Error('CSV Finisher content sections missing');
      }
    });
  });
}
