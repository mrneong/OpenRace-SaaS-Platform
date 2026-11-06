/**
 * Jest Unit Tests for Rule Engine (AC-001 through AC-007)
 */

import { evaluateActivity, applyDailyLimit, detectAndTrimVehicleTail } from './rule-engine';
import { getDefaultRuleSet } from '../models/models';
import type { Activity, Race } from '../models/models';

export function runRuleEngineTests(runner: any) {
  const rules = getDefaultRuleSet();
  const race: Race = {
    id: 'race-01',
    clubId: 'club-01',
    name: 'OpenRace Season 10',
    slug: 'openrace-season-10',
    startAt: new Date('2026-11-01T00:00:00Z'),
    endAt: new Date('2026-11-30T23:59:59Z'),
    status: 'running',
    rules,
  };

  runner.test('AC-001: Valid Standard Run Activity', () => {
    const act: Activity = {
      id: 'act-001',
      userId: 'user-01',
      stravaActivityId: 'strava-001',
      sportType: 'Run',
      startAt: new Date('2026-11-04T06:00:00Z'),
      distanceM: 5200.0,
      movingTimeS: 1716, // pace = (1716/60)/5.2 = 5.5 (5:30 min/km)
      elapsedTimeS: 1750,
      elevationGainM: 40.0,
      status: 'active',
    };

    const res = evaluateActivity(act, rules, race);
    runner.expect(res.isValid).toBe(true);
    runner.expect(res.finalDistanceKm).toBe(5.2);
    runner.expect(res.bonusDistanceKm).toBe(0.0);
  });

  runner.test('AC-002: Distance Below Minimum Threshold', () => {
    const act: Activity = {
      id: 'act-002',
      userId: 'user-01',
      stravaActivityId: 'strava-002',
      sportType: 'Run',
      startAt: new Date('2026-11-04T06:00:00Z'),
      distanceM: 2800.0, // below 3.0 km
      movingTimeS: 1008,
      elapsedTimeS: 1020,
      elevationGainM: 20.0,
      status: 'active',
    };

    const res = evaluateActivity(act, rules, race);
    runner.expect(res.isValid).toBe(false);
    runner.expect(res.rejectCode).toBe('BELOW_MIN_DISTANCE');
    runner.expect(res.finalDistanceKm).toBe(0.0);
  });

  runner.test('AC-003: Pace Exceeding Max Limit with Valid Trail Elevation Gain', () => {
    const act: Activity = {
      id: 'act-003',
      userId: 'user-01',
      stravaActivityId: 'strava-003',
      sportType: 'TrailRun',
      startAt: new Date('2026-11-04T07:00:00Z'),
      distanceM: 6000.0,
      movingTimeS: 4380, // pace = (4380/60)/6.0 = 12.16 min/km (> 10:00)
      elapsedTimeS: 4500,
      elevationGainM: 260.0, // bonus = floor(260/100) * 1.0 = 2.0 km
      status: 'active',
    };

    const res = evaluateActivity(act, rules, race);
    runner.expect(res.isValid).toBe(true);
    runner.expect(res.bonusDistanceKm).toBe(2.0);
    runner.expect(res.finalDistanceKm).toBe(8.0);
  });

  runner.test('AC-004: Pace Exceeding Max Limit without Sufficient Gain', () => {
    const act: Activity = {
      id: 'act-004',
      userId: 'user-01',
      stravaActivityId: 'strava-004',
      sportType: 'Run',
      startAt: new Date('2026-11-04T08:00:00Z'),
      distanceM: 4000.0,
      movingTimeS: 2640, // pace 11:00 min/km
      elapsedTimeS: 2700,
      elevationGainM: 60.0, // < 100m
      status: 'active',
    };

    const res = evaluateActivity(act, rules, race);
    runner.expect(res.isValid).toBe(false);
    runner.expect(res.rejectCode).toBe('PACE_TOO_SLOW_NO_GAIN');
    runner.expect(res.finalDistanceKm).toBe(0.0);
  });

  runner.test('AC-005: Pace Too Fast (Suspected Vehicle / Fraud)', () => {
    const act: Activity = {
      id: 'act-005',
      userId: 'user-01',
      stravaActivityId: 'strava-005',
      sportType: 'Run',
      startAt: new Date('2026-11-04T06:00:00Z'),
      distanceM: 10000.0,
      movingTimeS: 2000, // pace = 3.33 min/km (3:20 min/km < 4:00)
      elapsedTimeS: 2000,
      elevationGainM: 10.0,
      status: 'active',
    };

    const res = evaluateActivity(act, rules, race);
    runner.expect(res.isValid).toBe(false);
    runner.expect(res.rejectCode).toBe('PACE_TOO_FAST');
    runner.expect(res.finalDistanceKm).toBe(0.0);

    // US-ENG-04: Test System Pace Floor lock (2:45 min/km = 2.75)
    const vehicleAct: Activity = {
      ...act,
      id: 'act-vehicle-01',
      movingTimeS: 1500, // pace = 2.5 min/km (2:30 min/km < 2:45)
    };
    const vehicleRes = evaluateActivity(vehicleAct, rules, race);
    runner.expect(vehicleRes.isValid).toBe(false);
    runner.expect(vehicleRes.rejectCode).toBe('PACE_IMPLAUSIBLE');
  });

  runner.test('AC-006: Daily Activity Limit Enforcement', () => {
    const act1: Activity = {
      id: 'act-006a',
      userId: 'user-01',
      stravaActivityId: 's-006a',
      sportType: 'Run',
      startAt: new Date('2026-11-04T06:00:00Z'),
      distanceM: 4000.0,
      movingTimeS: 1440,
      elapsedTimeS: 1500,
      elevationGainM: 20.0,
      status: 'active',
    };
    const act2: Activity = {
      id: 'act-006b',
      userId: 'user-01',
      stravaActivityId: 's-006b',
      sportType: 'Run',
      startAt: new Date('2026-11-04T12:00:00Z'),
      distanceM: 5000.0,
      movingTimeS: 1800,
      elapsedTimeS: 1850,
      elevationGainM: 20.0,
      status: 'active',
    };
    const act3: Activity = {
      id: 'act-006c',
      userId: 'user-01',
      stravaActivityId: 's-006c',
      sportType: 'Run',
      startAt: new Date('2026-11-04T18:00:00Z'),
      distanceM: 6000.0,
      movingTimeS: 2160,
      elapsedTimeS: 2200,
      elevationGainM: 20.0,
      status: 'active',
    };

    const r1 = evaluateActivity(act1, rules, race);
    const r2 = evaluateActivity(act2, rules, race);
    const r3 = evaluateActivity(act3, rules, race);

    const limited = applyDailyLimit([r1, r2, r3], 2);
    runner.expect(limited[0].isValid).toBe(true);
    runner.expect(limited[0].finalDistanceKm).toBe(4.0);

    runner.expect(limited[1].isValid).toBe(true);
    runner.expect(limited[1].finalDistanceKm).toBe(5.0);

    runner.expect(limited[2].isValid).toBe(false);
    runner.expect(limited[2].rejectCode).toBe('DAILY_LIMIT_EXCEEDED');
  });

  runner.test('AC-007: Overlapping Activities Detection', () => {
    const baseTime = new Date('2026-11-04T06:00:00Z');
    const act1: Activity = {
      id: 'act-007a',
      userId: 'user-01',
      stravaActivityId: 's-007a',
      sportType: 'Run',
      startAt: baseTime,
      distanceM: 5000.0,
      movingTimeS: 1800,
      elapsedTimeS: 1800,
      elevationGainM: 20.0,
      status: 'active',
    };
    const act2: Activity = {
      id: 'act-007b',
      userId: 'user-01',
      stravaActivityId: 's-007b',
      sportType: 'Run',
      startAt: new Date(baseTime.getTime() + 10 * 60 * 1000), // starts 10m later, overlaps 20m/30m = 66.7%
      distanceM: 5000.0,
      movingTimeS: 1800,
      elapsedTimeS: 1800,
      elevationGainM: 20.0,
      status: 'active',
    };

    const r1 = evaluateActivity(act1, rules, race);
    runner.expect(r1.isValid).toBe(true);

    const r2 = evaluateActivity(act2, rules, race, [act1]);
    runner.expect(r2.isValid).toBe(false);
    runner.expect(r2.rejectCode).toBe('DUPLICATE_OVERLAP');
  });

  runner.test('AC-048: Auto-Trim Vehicle Tail on Forgot-to-Stop Running Watch', () => {
    const actWithVehicleTail: Activity = {
      id: 'act-048-tail',
      userId: 'user-01',
      stravaActivityId: 's-048',
      sportType: 'Run',
      startAt: new Date('2026-11-04T06:00:00Z'),
      distanceM: 11500.0, // 10.0km run + 1.5km motorbike
      movingTimeS: 3450,
      elapsedTimeS: 3600,
      elevationGainM: 35.0,
      maxSpeedKmH: 42.0, // vehicle speed
      avgCadence: 168,
      status: 'active',
    };

    const trimResult = detectAndTrimVehicleTail(actWithVehicleTail);
    runner.expect(trimResult.trimmed).toBe(true);
    runner.expect(trimResult.cleanDistanceKm).toBe(10.0);
    runner.expect(trimResult.trimmedDistanceKm).toBe(1.5);
    runner.expect(trimResult.trimmedActivity.autoTrimmed).toBe(true);

    // Evaluate trimmed activity -> Must be VALID with 10.0 km
    const evalRes = evaluateActivity(trimResult.trimmedActivity, rules, race);
    runner.expect(evalRes.isValid).toBe(true);
    runner.expect(evalRes.finalDistanceKm).toBe(10.0);
  });

  runner.test('AC-049: Direct Device Sync Provider Ecosystem', () => {
    const garminAct: Activity = {
      id: 'act-049-garmin',
      userId: 'user-01',
      stravaActivityId: '',
      deviceSource: 'GARMIN_CONNECT',
      sportType: 'Run',
      startAt: new Date('2026-11-04T06:00:00Z'),
      distanceM: 8000.0,
      movingTimeS: 2640,
      elapsedTimeS: 2650,
      elevationGainM: 25.0,
      status: 'active',
    };

    runner.expect(garminAct.deviceSource).toBe('GARMIN_CONNECT');
    const evalRes = evaluateActivity(garminAct, rules, race);
    runner.expect(evalRes.isValid).toBe(true);
    runner.expect(evalRes.finalDistanceKm).toBe(8.0);
  });

  runner.test('AC-050: Indoor Treadmill Run Validation with Continuous Heart Rate & Cadence', () => {
    // 1. Valid Treadmill run with HR 152 bpm (>= 120) and Cadence 168 spm (>= 150)
    const validTreadmill: Activity = {
      id: 'act-050-valid',
      userId: 'user-01',
      stravaActivityId: '',
      sportType: 'TreadmillRun',
      startAt: new Date('2026-11-04T06:00:00Z'),
      distanceM: 6000.0,
      movingTimeS: 2160, // pace 6:00
      elapsedTimeS: 2200,
      elevationGainM: 0,
      avgHeartRate: 152,
      avgCadence: 168,
      status: 'active',
    };

    const evalValid = evaluateActivity(validTreadmill, rules, race);
    runner.expect(evalValid.isValid).toBe(true);
    runner.expect(evalValid.finalDistanceKm).toBe(6.0);

    // 2. Fraudulent/Low-effort run with HR 95 bpm (< 120)
    const lazyTreadmill: Activity = {
      ...validTreadmill,
      id: 'act-050-lazy',
      avgHeartRate: 95,
    };

    const evalLazy = evaluateActivity(lazyTreadmill, rules, race);
    runner.expect(evalLazy.isValid).toBe(false);
    runner.expect(evalLazy.rejectCode).toBe('TREADMILL_HR_TOO_LOW');
  });
}
