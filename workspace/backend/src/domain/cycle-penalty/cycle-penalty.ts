/**
 * Weekly Cycle & Penalty Engine (TypeScript)
 */

export function calculateCycleTarget(
  targetKm: number,
  activeDays: number,
  daysInCycle = 7,
  policy = 'prorate'
): number {
  if (activeDays <= 0) return 0.0;
  if (activeDays >= daysInCycle || policy === 'full') return targetKm;
  if (policy === 'skip') return 0.0;

  // Prorate formula: target * (activeDays / daysInCycle), rounded up to 0.1 km
  const rawTarget = targetKm * (activeDays / daysInCycle);
  return Math.ceil(rawTarget * 10) / 10;
}

export function evaluateCyclePenalty(
  validDistanceKm: number,
  targetKm: number,
  penaltyPerMissVnd = 50000,
  hasWaiver = false
): { isViolated: boolean; penaltyAmountVnd: number } {
  if (hasWaiver) {
    return { isViolated: false, penaltyAmountVnd: 0 };
  }
  if (validDistanceKm < targetKm) {
    return { isViolated: true, penaltyAmountVnd: penaltyPerMissVnd };
  }
  return { isViolated: false, penaltyAmountVnd: 0 };
}

