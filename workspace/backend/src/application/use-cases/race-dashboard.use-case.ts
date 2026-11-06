/**
 * Multi-Selection Tournament Dashboard Use Case (AC-RACE-DASH-01 to AC-RACE-DASH-05)
 * Coordinates race overview metrics across 4 central information zones:
 * - Zone 1: Race KPI Cards (Participants, Total KM vs Goal, Completion Rate, Prize/Penalty ledger)
 * - Zone 2: Race Analytics & Trend (Daily distance bar chart with peaks, Activity distribution: Road/Trail/Treadmill)
 * - Zone 3: Live Race Leaderboard Preview (Top 5 teams with Gold/Silver/Bronze medals, Top 10 individual breakout runners)
 * - Zone 4: Race Governance & Violation Queues (Suspicious/pending runs for referee review)
 * - Global Race Selector & UX Workflow (Ctrl+Shift+R shortcut, real-time SSE ticker, 1-touch CSV export)
 */

import { InMemoryDataStore } from '../../infrastructure/repositories/in-memory-data.store';
import {
  RaceSelectorItem,
  RaceKpiSummary,
  RaceDailyDistancePoint,
  RaceActivityTypeDistribution,
  RaceTeamStanding,
  RaceIndividualLeader,
  RaceSuspiciousViolationQueueItem,
  RaceDashboardOverviewDto,
  RaceExportReportDto
} from '../../domain/models/models';

export class RaceDashboardUseCase {
  constructor(private readonly dataStore: InMemoryDataStore) {}

  /**
   * AC-RACE-DASH-01: Retrieves all active and historical races for Global Race Selector Bar
   */
  getRacesForSelector(): RaceSelectorItem[] {
    return this.dataStore.getRacesForSelector();
  }

  /**
   * AC-RACE-DASH-01, AC-RACE-DASH-02, AC-RACE-DASH-03, AC-RACE-DASH-04:
   * Retrieves 4-Zone Dashboard Overview for the selected race
   */
  getRaceDashboardOverview(raceIdOrSlug: string = 'race-season-10'): RaceDashboardOverviewDto {
    return this.dataStore.getRaceDashboardOverview(raceIdOrSlug);
  }

  /**
   * AC-RACE-DASH-05: 1-Touch Export of tournament summary (Finishers, rankings, governance audit log)
   */
  exportRaceReport(raceIdOrSlug: string = 'race-season-10', generatedBy: string = 'Nguyễn Văn A (Admin)'): RaceExportReportDto {
    return this.dataStore.exportRaceReport(raceIdOrSlug, generatedBy);
  }

  /**
   * AC-RACE-DASH-05: Real-time SSE live ticker increment
   */
  incrementRaceDistance(raceIdOrSlug: string = 'race-season-10', deltaKm: number = 0.5): number {
    return this.dataStore.incrementRaceDistance(raceIdOrSlug, deltaKm);
  }
}
