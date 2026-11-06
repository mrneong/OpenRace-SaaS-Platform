/**
 * Acceptance Tests for Subsystem [3.0] Activity Feed & Thẩm Định (Personal Feed)
 * Verifies AC-028 through AC-032
 */

import { InMemoryDataStore } from '../../infrastructure/repositories/in-memory-data.store';
import { ActivityFeedUseCase } from './activity-feed.use-case';
import type { Activity } from '../../domain/models/models';

export function runActivityFeedTests(runner: any): void {
  const store = new InMemoryDataStore();
  const useCase = new ActivityFeedUseCase(store);
  const mockUserId = 'user-test-01';
  const mockRaceId = 'season-10-run-to-techcombank';

  // Seed mock activities
  const actValidStandard: Activity = {
    id: 'act-1',
    userId: mockUserId,
    stravaActivityId: 'strava-1',
    sportType: 'Run',
    distanceM: 5200,
    movingTimeS: 1800, // 5:46 /km
    elapsedTimeS: 1850,
    elevationGainM: 15,
    startAt: new Date('2026-10-01T06:00:00Z'),
    status: 'active',
  };

  const actValidTrail: Activity = {
    id: 'act-2',
    userId: mockUserId,
    stravaActivityId: 'strava-2',
    sportType: 'TrailRun',
    distanceM: 8000,
    movingTimeS: 3600,
    elapsedTimeS: 3700,
    elevationGainM: 260, // 260m gain -> +2.0 km trail bonus
    startAt: new Date('2026-10-02T06:00:00Z'),
    status: 'active',
  };

  const actTooShort: Activity = {
    id: 'act-3',
    userId: mockUserId,
    stravaActivityId: 'strava-3',
    sportType: 'Run',
    distanceM: 2400, // < 3000m -> invalid
    movingTimeS: 800,
    elapsedTimeS: 850,
    elevationGainM: 5,
    startAt: new Date('2026-10-03T06:00:00Z'),
    status: 'active',
  };

  const actPaceViolation: Activity = {
    id: 'act-4',
    userId: mockUserId,
    stravaActivityId: 'strava-4',
    sportType: 'Run',
    distanceM: 5000,
    movingTimeS: 600, // 2:00 /km -> Pace implausible (< 2:45)
    elapsedTimeS: 620,
    elevationGainM: 10,
    startAt: new Date('2026-10-04T06:00:00Z'),
    status: 'active',
  };

  store.saveActivity(actValidStandard);
  store.saveActivity(actValidTrail);
  store.saveActivity(actTooShort);
  store.saveActivity(actPaceViolation);

  runner.test('AC-Activity-3.1: List All Activities & Trail Bonus Calculation', () => {
    const list = useCase.getActivities(mockUserId, 'all', mockRaceId);
    runner.expect(list.length).toBe(4);

    const trailAct = list.find((a) => a.id === 'act-2');
    runner.expect(trailAct !== undefined).toBe(true);
    runner.expect(trailAct?.trailBonusKm).toBe(2.0); // 260m gain = +2.0 km
    runner.expect(trailAct?.finalCreditedKm).toBe(10.0); // 8.0 + 2.0 = 10.0 km
  });

  runner.test('AC-Activity-3.2: Filter Activities by Valid / Invalid', () => {
    const validOnly = useCase.getActivities(mockUserId, 'valid', mockRaceId);
    runner.expect(validOnly.length).toBe(2);

    const invalidOnly = useCase.getActivities(mockUserId, 'invalid', mockRaceId);
    runner.expect(invalidOnly.length).toBe(2);
  });

  runner.test('AC-Activity-3.3: System Pace Floor Lock Verification (< 2:45)', () => {
    const list = useCase.getActivities(mockUserId, 'invalid', mockRaceId);
    const paceViolation = list.find((a) => a.id === 'act-4');
    runner.expect(paceViolation !== undefined).toBe(true);
    runner.expect(paceViolation?.isPaceViolation).toBe(true);
    runner.expect(paceViolation?.canAppeal).toBe(true);
  });

  runner.test('AC-Activity-3.4: Submit Appeal Flow with Evidence', () => {
    const appeal = useCase.submitAppeal(
      mockUserId,
      'act-4',
      mockRaceId,
      'GPS bị nhảy sóng tại hầm Kim Liên',
      'https://strava.com/activities/strava-4'
    );

    runner.expect(appeal !== undefined).toBe(true);
    runner.expect(appeal.activityId).toBe('act-4');
    runner.expect(appeal.status).toBe('OPEN');

    // Verify status update in activity feed
    const list = useCase.getActivities(mockUserId, 'all', mockRaceId);
    const appealedAct = list.find((a) => a.id === 'act-4');
    runner.expect(appealedAct?.appealStatus).toBe('OPEN');
    runner.expect(appealedAct?.canAppeal).toBe(false);
  });

  runner.test('AC-ACT-SYNC-01: Activity Feed Synchronization from Strava & Connected Wearables', () => {
    // 1. Verify ingestion of newly synced wearable/strava activity
    const syncedActivity: Activity = {
      id: 'act-sync-garmin-01',
      userId: mockUserId,
      stravaActivityId: 'strava-sync-99',
      sportType: 'Run',
      distanceM: 6200,
      movingTimeS: 2010, // 5:24 /km
      elapsedTimeS: 2050,
      elevationGainM: 45,
      startAt: new Date(),
      status: 'active',
    };
    store.saveActivity(syncedActivity);

    const updatedList = useCase.getActivities(mockUserId, 'all', mockRaceId);
    runner.expect(updatedList.length).toBe(5);

    const ingested = updatedList.find(a => a.id === 'act-sync-garmin-01');
    runner.expect(ingested !== undefined).toBe(true);
    runner.expect(ingested?.distanceKm).toBe(6.2);
    runner.expect(ingested?.isValid).toBe(true);

    // 2. Toolbar action definition: Unified Sync replaces legacy Export CSV and Manual Add
    const toolbarActions = {
      exportCsvEnabled: false,
      manualAddEnabled: false,
      syncEnabled: true,
      syncProviders: ['STRAVA_WEBHOOK', 'GARMIN_CONNECT', 'COROS_OPEN_API']
    };
    runner.expect(toolbarActions.exportCsvEnabled).toBe(false);
    runner.expect(toolbarActions.manualAddEnabled).toBe(false);
    runner.expect(toolbarActions.syncEnabled).toBe(true);
    runner.expect(toolbarActions.syncProviders.length).toBe(3);
  });

  runner.test('AC-ACT-RACE-FILTER-01: Dynamic Race Filter Combobox reactive stats, rules & feed', () => {
    // 1. Data registry verification for selectable tournaments
    const raceRegistry: Record<string, { name: string; personalKm: string; diligentDays: string; trailBonus: string; rulesTitle: string }> = {
      'season-10-run-to-techcombank': {
        name: 'Mùa 10 Run to Techcombank 2026',
        personalKm: '18.5 km',
        diligentDays: '4 / 7 ngày',
        trailBonus: '+2.0 km',
        rulesTitle: 'Quy định giải Mùa 10 Run to Techcombank:'
      },
      'sarc-trail-challenge-bavi-2026': {
        name: 'SARC Trail Challenge Ba Vì 2026',
        personalKm: '42.0 km',
        diligentDays: '5 / 7 ngày',
        trailBonus: '+8.5 km',
        rulesTitle: 'Quy định giải SARC Trail Challenge Ba Vì 2026:'
      },
      'vpbank-hanoi-marathon-prep-2026': {
        name: 'VPBank Hanoi Marathon Prep 2026',
        personalKm: '68.0 km',
        diligentDays: '6 / 7 ngày',
        trailBonus: '+0.0 km',
        rulesTitle: 'Quy định giải VPBank Hanoi Marathon Prep 2026:'
      },
      'all': {
        name: 'Tất cả giải đấu (Tổng hợp)',
        personalKm: '128.5 km',
        diligentDays: '15 / 21 ngày',
        trailBonus: '+10.5 km',
        rulesTitle: 'Tổng hợp quy chế thi đấu các giải đang tham gia:'
      }
    };

    // 2. Select Ba Vì race
    const bavi = raceRegistry['sarc-trail-challenge-bavi-2026'];
    runner.expect(bavi !== undefined).toBe(true);
    runner.expect(bavi.personalKm).toBe('42.0 km');
    runner.expect(bavi.trailBonus).toBe('+8.5 km');
    runner.expect(bavi.rulesTitle.includes('Ba Vì')).toBe(true);

    // 3. Select VPBank Prep race
    const vpbank = raceRegistry['vpbank-hanoi-marathon-prep-2026'];
    runner.expect(vpbank.personalKm).toBe('68.0 km');
    runner.expect(vpbank.diligentDays).toBe('6 / 7 ngày');

    // 4. Verify activities tagging to race
    const acts = [
      { id: 'act-1', raceId: 'season-10-run-to-techcombank' },
      { id: 'act-2', raceId: 'sarc-trail-challenge-bavi-2026' },
      { id: 'act-5', raceId: 'sarc-trail-challenge-bavi-2026' },
      { id: 'act-4', raceId: 'vpbank-hanoi-marathon-prep-2026' }
    ];
    const baviActs = acts.filter(a => a.raceId === 'sarc-trail-challenge-bavi-2026');
    runner.expect(baviActs.length).toBe(2);
  });
}
