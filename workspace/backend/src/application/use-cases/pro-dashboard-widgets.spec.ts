/**
 * Pro Runner Dashboard Strategic Widgets Unit Tests
 * Implements Acceptance Criteria for:
 * - [AC-PRO-DASH-01]: Garmin/Coros Training Load & Recovery Tracker
 * - [AC-PRO-DASH-02]: On-demand Wearable Data Sync & Metric Refresh
 * - [AC-PRO-DASH-03]: Shoe Mileage Tracker (Lifespan % & Warning Colors, CRUD, Default)
 * - [AC-PRO-DASH-04]: Hydration & Energy Gel Nutrition Planner
 * - [AC-PRO-DASH-05]: Personal Milestones, Streak & Digital Badge Certificate
 */

import { InMemoryDataStore } from '../../infrastructure/repositories/in-memory-data.store';
import { RunnerDashboardUseCase } from './runner-dashboard.use-case';

export function runProDashboardWidgetsTests(runner: any) {
  runner.suite('Pro Runner Dashboard Strategic Widgets (AC-PRO-DASH-01 to AC-PRO-DASH-05)', () => {
    const store = new InMemoryDataStore();
    const useCase = new RunnerDashboardUseCase(store);

    runner.test('AC-PRO-DASH-01: Training Load & Recovery Tracker (ACWR ratio, recovery hours, VO2 max, race predictions, HR zones)', () => {
      const load = useCase.getTrainingLoadAndRecovery('user-01');

      runner.expect(load.athleteId).toBe('user-01');
      runner.expect(load.trainingStatus).toBe('Productive');
      runner.expect(load.loadRatioStatus).toBe('optimal');
      runner.expect(load.loadRatio >= 0.8 && load.loadRatio <= 1.3).toBe(true);
      runner.expect(load.recoveryHours).toBe(18);
      runner.expect(load.vo2Max).toBe(52.4);
      runner.expect(load.predictedRaceTimes.race5k).toBe('21:45');
      runner.expect(load.predictedRaceTimes.race10k).toBe('45:30');
      runner.expect(load.predictedRaceTimes.halfMarathon21k).toBe('01:42:15');
      runner.expect(load.predictedRaceTimes.marathon42k).toBe('03:36:20');
      runner.expect(load.hrZonesLast7Days.length).toBe(5);
      runner.expect(load.sourceDevice).toBe('Garmin Forerunner 965');
    });

    runner.test('AC-PRO-DASH-02: Wearable Data On-Demand Refresh updates metrics & timestamp', () => {
      const refreshed = useCase.refreshTrainingLoad('user-01');

      runner.expect(refreshed.athleteId).toBe('user-01');
      runner.expect(typeof refreshed.lastSyncAt).toBe('string');
      runner.expect(refreshed.acuteLoad > 0).toBe(true);
      runner.expect(refreshed.chronicLoad).toBe(600);
      runner.expect(refreshed.recoveryHours >= 0).toBe(true);
    });

    runner.test('AC-PRO-DASH-03: Shoe Mileage Tracker (CRUD, warning levels, setting default shoe)', () => {
      const shoes = useCase.getRunningShoes('user-01');
      runner.expect(shoes.length >= 4).toBe(true);

      const alphafly = shoes.find(s => s.name.includes('Alphafly'));
      runner.expect(alphafly !== undefined).toBe(true);
      runner.expect(alphafly?.warningLevel).toBe('CAUTION');
      runner.expect(alphafly?.isDefault).toBe(true);
      runner.expect(alphafly?.percentUsed >= 70).toBe(true);

      const adiosPro = shoes.find(s => s.name.includes('Adios Pro'));
      runner.expect(adiosPro !== undefined).toBe(true);
      runner.expect(adiosPro?.warningLevel).toBe('REPLACE');
      runner.expect(adiosPro?.percentUsed >= 90).toBe(true);

      // Create new shoe
      const newShoe = useCase.createRunningShoe('user-01', {
        name: 'Puma Deviate Nitro Elite 3',
        brand: 'Puma',
        category: 'race_day',
        currentDistanceKm: 15.0,
        maxDistanceKm: 500.0,
        isDefault: false,
      });

      runner.expect(newShoe.name).toBe('Puma Deviate Nitro Elite 3');
      runner.expect(newShoe.warningLevel).toBe('SAFE');
      runner.expect(newShoe.percentUsed).toBe(3);

      // Set new shoe as default
      const defaultUpdated = useCase.setDefaultShoe('user-01', newShoe.id);
      runner.expect(defaultUpdated.isDefault).toBe(true);

      // Old default should now be false
      const updatedAlphafly = useCase.getRunningShoes('user-01').find(s => s.id === alphafly?.id);
      runner.expect(updatedAlphafly?.isDefault).toBe(false);

      // Update shoe mileage to trigger REPLACE warning
      const updatedShoe = useCase.updateRunningShoe(newShoe.id, {
        currentDistanceKm: 460.0,
      });
      runner.expect(updatedShoe.warningLevel).toBe('REPLACE');
      runner.expect(updatedShoe.status).toBe('WARNING_REPLACE');
    });

    runner.test('AC-PRO-DASH-04: Hydration & Nutrition Planner for Long Runs', () => {
      // 21.1 km Half Marathon at 5:30/km pace (Pace 5.5), 28C, 75% humidity
      const plan = useCase.calculateNutritionPlan({
        distanceKm: 21.1,
        paceMinPerKm: 5.5,
        temperatureC: 28,
        humidity: 75,
        runnerWeightKg: 65,
      });

      runner.expect(plan.estimatedDurationMinutes).toBe(116);
      runner.expect(plan.estimatedDurationFormatted).toBe('1 giờ 56 phút');
      runner.expect(plan.estimatedCaloriesBurned > 1300).toBe(true);
      runner.expect(plan.recommendedWaterMl > 1000).toBe(true);
      runner.expect(plan.recommendedGelCount >= 2).toBe(true);
      runner.expect(plan.intakeSchedule.hydrationIntervalMin).toBe(20);
      runner.expect(plan.intakeSchedule.tips.length >= 3).toBe(true);
      runner.expect(plan.weatherAdjustmentNote.includes('28°C')).toBe(true);

      // Short 5K run test (under 45 min): 0 gels
      const shortPlan = useCase.calculateNutritionPlan({
        distanceKm: 5.0,
        paceMinPerKm: 5.0,
        temperatureC: 22,
      });
      runner.expect(shortPlan.recommendedGelCount).toBe(0);
    });

    runner.test('AC-PRO-DASH-05: Personal Milestones, Streak & Digital Badge Certificate with social share', () => {
      const milestones = useCase.getMilestonesAndStreak('user-01');

      runner.expect(milestones.athleteId).toBe('user-01');
      runner.expect(milestones.currentStreakDays).toBe(14);
      runner.expect(milestones.longestStreakDays).toBe(28);
      runner.expect(milestones.seasonTotalKm).toBe(921.5);
      runner.expect(milestones.nextMilestoneKm).toBe(1000.0);
      runner.expect(milestones.remainingKmToMilestone).toBe(78.5);
      runner.expect(milestones.milestoneProgressPercent).toBe(92.2);
      runner.expect(milestones.recentBadges.length >= 4).toBe(true);

      // Generate digital certificate for HM badge
      const certResult = useCase.generateDigitalCertificate('user-01', 'HM_SUB_145');
      runner.expect(certResult.success).toBe(true);
      runner.expect(certResult.certificate.athleteName).toBe('Nguyễn Văn A');
      runner.expect(certResult.certificate.badgeTitle).toBe('🏅 Finisher 21K Sub-1:45');
      runner.expect(certResult.certificate.certificateId).toBe('OR-CERT-HM-948271');
      runner.expect(certResult.shareContent.includes('Nguyễn Văn A') || certResult.shareContent.includes('Finisher 21K Sub-1:45')).toBe(true);
    });
  });
}
