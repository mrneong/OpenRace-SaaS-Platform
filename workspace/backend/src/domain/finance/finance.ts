/**
 * Finance & Ledger Engine (TypeScript)
 */

import type { ParticipantLedger } from '../models/models';

export function calculateParticipantLedger(
  teamRank: number,
  penalties: number[],
  payments: number[],
  payoutTiers: Record<number, number> = { 1: 100000, 2: 200000 }
): ParticipantLedger {
  const rankFeeVnd = payoutTiers[teamRank] ?? payoutTiers[2] ?? 200000;
  const penaltiesVnd = penalties.reduce((sum, p) => sum + p, 0);
  const totalPaidVnd = payments.reduce((sum, p) => sum + p, 0);
  const balanceDueVnd = rankFeeVnd + penaltiesVnd - totalPaidVnd;

  return {
    rankFeeVnd,
    penaltiesVnd,
    totalPaidVnd,
    balanceDueVnd,
    isSettled: balanceDueVnd <= 0,
  };
}
