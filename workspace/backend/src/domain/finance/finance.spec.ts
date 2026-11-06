/**
 * Jest Unit Tests for Finance & Ledger Engine (AC-010)
 */

import { calculateParticipantLedger } from './finance';

export function runFinanceTests(runner: any) {
  runner.test('AC-010: Tiered Contribution and Ledger Balance Calculation', () => {
    const tiers = { 1: 100000, 2: 200000 };

    // Runner A: Team Rank 1 (100k fee), 0 penalties, 0 paid -> owes 100k
    const ledgerA = calculateParticipantLedger(1, [], [], tiers);
    runner.expect(ledgerA.rankFeeVnd).toBe(100000);
    runner.expect(ledgerA.penaltiesVnd).toBe(0);
    runner.expect(ledgerA.balanceDueVnd).toBe(100000);
    runner.expect(ledgerA.isSettled).toBe(false);

    // Runner B: Team Rank 2 (200k fee), 1 penalty of 50k, 0 paid -> owes 250k
    const ledgerB = calculateParticipantLedger(2, [50000], [], tiers);
    runner.expect(ledgerB.rankFeeVnd).toBe(200000);
    runner.expect(ledgerB.penaltiesVnd).toBe(50000);
    runner.expect(ledgerB.balanceDueVnd).toBe(250000);

    // Runner C: Paid 250k -> balance = 0, isSettled = true
    const ledgerC = calculateParticipantLedger(2, [50000], [250000], tiers);
    runner.expect(ledgerC.balanceDueVnd).toBe(0);
    runner.expect(ledgerC.isSettled).toBe(true);
  });
}

