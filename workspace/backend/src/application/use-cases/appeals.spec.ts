/**
 * Jest Integration Tests for Appeals & Manual Adjustment (AC-012)
 */

import { AppealsUseCase } from './appeals.use-case';
import { InMemoryDataStore } from '../../infrastructure/repositories/in-memory-data.store';
import type { Activity } from '../../domain/models/models';

export function runAppealsTests(runner: any) {
  runner.test('AC-012: Manual Adjustment on Approved Appeal', () => {
    const store = new InMemoryDataStore();
    const useCase = new AppealsUseCase(store);

    const act: Activity = {
      id: 'act-appeal-01',
      userId: 'user-02',
      stravaActivityId: 's-appeal-01',
      sportType: 'Run',
      startAt: new Date('2026-11-04T09:00:00Z'),
      distanceM: 5000.0,
      movingTimeS: 1800,
      elapsedTimeS: 1800,
      elevationGainM: 20.0,
      status: 'active',
    };
    store.saveActivity(act);

    // Runner nộp khiếu nại
    const appeal = useCase.submitAppeal(
      'race-01',
      'user-02',
      'act-appeal-01',
      'GPS glitch at bridge caused inaccurate pace reading'
    );
    runner.expect(appeal.status).toBe('OPEN');

    // Admin duyệt khiếu nại
    const override = useCase.approveAndOverride(
      appeal.id,
      'admin-01',
      'Verified GPX track and approved override'
    );

    runner.expect(override.isValid).toBe(true);
    runner.expect(override.finalDistanceKm).toBe(5.0);
    runner.expect(store.manualAdjustments.length).toBe(1);
    const manualAudit = store.auditLogs.find((a) => a.action === 'MANUAL_ADJUSTMENT');
    runner.expect(manualAudit !== undefined).toBe(true);
    runner.expect(manualAudit.actorId).toBe('admin-01');
  });
}
