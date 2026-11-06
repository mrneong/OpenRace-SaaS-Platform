/**
 * Jest Unit Tests for Cycle & Penalty Engine (AC-008)
 */

import { calculateCycleTarget, evaluateCyclePenalty } from './cycle-penalty';

export function runCyclePenaltyTests(runner: any) {
  runner.test('AC-008: Weekly Cycle Distance Target and Penalty Calculation with Proration', () => {
    // Runner A: Full week (7/7 days), ran 18.5 km (target 20.0 km) -> penalized 50,000 VND
    const targetA = calculateCycleTarget(20.0, 7, 7, 'prorate');
    runner.expect(targetA).toBe(20.0);

    const penA = evaluateCyclePenalty(18.5, targetA, 50000);
    runner.expect(penA.isViolated).toBe(true);
    runner.expect(penA.penaltyAmountVnd).toBe(50000);

    // Runner B: Joined with 4/7 active days, ran 10.0 km -> target 20 * 4/7 = 11.428 -> rounded up to 11.5 km
    const targetB = calculateCycleTarget(20.0, 4, 7, 'prorate');
    runner.expect(targetB).toBe(11.5);

    const penB = evaluateCyclePenalty(10.0, targetB, 50000);
    runner.expect(penB.isViolated).toBe(true);
    runner.expect(penB.penaltyAmountVnd).toBe(50000);

    // Runner C: Has waiver -> 0 penalty
    const penC = evaluateCyclePenalty(10.0, targetB, 50000, true);
    runner.expect(penC.isViolated).toBe(false);
    runner.expect(penC.penaltyAmountVnd).toBe(0);
  });
}

