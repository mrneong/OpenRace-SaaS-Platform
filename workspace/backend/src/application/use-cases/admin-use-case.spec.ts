import { InMemoryDataStore } from '../../infrastructure/repositories/in-memory-data.store';
import { AdminManagementUseCase } from './admin-management.use-case';

export function runAdminUseCaseTests(runner: any) {
  runner.test('AC-014: Admin Appeals Review and Approval', () => {
    const store = new InMemoryDataStore();
    const useCase = new AdminManagementUseCase(store);

    const appeal = store.createAppeal('race-10', 'user-02', 'act-01', 'GPS lost in forest');
    const approved = useCase.approveAppeal(appeal.id, 'admin-chief', 'Approved after checking strava stream');

    runner.expect(approved.status).toBe('APPROVED');
    runner.expect(approved.resolvedBy).toBe('admin-chief');

    const rejectedAppeal = store.createAppeal('race-10', 'user-03', 'act-02', 'Vehicle pace');
    const rejected = useCase.rejectAppeal(rejectedAppeal.id, 'admin-chief', 'Pace 2:10 min/km too fast');
    runner.expect(rejected.status).toBe('REJECTED');
  });

  runner.test('AC-015: Admin Financial Payment Settlement', () => {
    const store = new InMemoryDataStore();
    const useCase = new AdminManagementUseCase(store);

    const settled = useCase.settlePayment('p-02', 'admin-treasurer', 'Received VietQR transfer 250k');
    runner.expect(settled.status).toBe('PAID');
    runner.expect(settled.paidVnd).toBe(settled.totalDueVnd);
  });

  runner.test('AC-016: Admin Penalty Waiver Granting', () => {
    const store = new InMemoryDataStore();
    const useCase = new AdminManagementUseCase(store);

    const waiver = useCase.grantPenaltyWaiver('race-season-10', 'cycle-w1', 'user-02', 'Knee injury cert', 'admin-chief');
    runner.expect(waiver.reason).toBe('Knee injury cert');
  });

  runner.test('AC-017: Admin Race Lifecycle and System Metrics', () => {
    const store = new InMemoryDataStore();
    const useCase = new AdminManagementUseCase(store);

    const newStatus = useCase.updateRaceStatus('race-season-10', 'finalizing', 'admin-chief');
    runner.expect(newStatus).toBe('finalizing');

    const logs = useCase.getAuditLogs();
    runner.expect(logs.length > 0).toBe(true);

    const metrics = useCase.getSystemMetrics();
    runner.expect(metrics.activeClubs).toBe(1);
    runner.expect(metrics.totalAthletes).toBe(48);
  });

  runner.test('AC-032: Review Appeal with Credited KM', () => {
    const store = new InMemoryDataStore();
    const useCase = new AdminManagementUseCase(store);

    const appeal = store.createAppeal('race-10', 'user-02', 'act-01', 'Tunnel GPS glitch');
    const reviewed = useCase.reviewAppeal(appeal.id, 'admin-chief', 'APPROVED', 7.5, 'GPS rechecked');
    runner.expect(reviewed.status).toBe('APPROVED');
  });

  runner.test('AC-033: Race Setup & Rule Configurator Creation', () => {
    const store = new InMemoryDataStore();
    const useCase = new AdminManagementUseCase(store);

    const newRace = useCase.createRace({
      name: 'Giải Thử Thách Mùa Đông 2026',
      slug: 'winter-challenge-2026',
      ruleSet: { minDistanceKm: 3.0, paceMinS: 165, targetKmPerCycle: 20 },
    });
    runner.expect(newRace.name).toBe('Giải Thử Thách Mùa Đông 2026');
    runner.expect(newRace.slug).toBe('winter-challenge-2026');
    runner.expect(newRace.ruleSet.paceMinS).toBe(165);
  });
}
