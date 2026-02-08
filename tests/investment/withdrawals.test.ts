import { describe, expect, it } from 'vitest';

import * as constants from '../../src/lib/constants';
import { Instrument } from '../../src/lib/investment/instrument';
import { calculateAmortizedWithdrawal, drawdownInstruments } from '../../src/lib/investment/withdrawals';
import { WithdrawalRecord } from '../../src/lib/investment/withdrawalTypes';

const Instruments = (): Instrument[] => [
  new Instrument(50000, 0.06, 12, 'Taxable Account'),
  new Instrument(100000, 0.08, 12, 'IRA Account'),
];

describe('withdrawals module', () => {
  const [taxableAccount, iraAccount] = Instruments();

  it('calculates a single period amortized withdrawal (Accrue Before)', async () => {
    const record = calculateAmortizedWithdrawal(
      taxableAccount,
      50000,
      2000,
      0,
      0.15,
      true
    );

    // 50,000 * (0.06/12) = 250 growth
    // 50,250 - 2000 withdrawal = 48,250
    expect(record.growth).toBe(250);
    expect(record.currentBalance).toBe(48250);
    expect(record.netAmount).toBe(2000 * 0.85);
  });

  it('calculates a single period amortized withdrawal (Withdraw Before)', async () => {
    // This covers withdrawals.ts lines 51-63
    const record = calculateAmortizedWithdrawal(
      taxableAccount,
      50000,
      2000,
      0,
      0.15,
      false
    );

    // 50,000 - 2000 = 48,000
    // 48,000 * (0.06/12) = 240 growth
    // 48,000 + 240 = 48,240
    expect(record.growth).toBe(240);
    expect(record.currentBalance).toBe(48240);
    expect(record.netAmount).toBe(1700);
  });

  it('draws down multiple instruments and validates comprehensive schedules', async () => {
    const targetNetIncome = 3000;
    const simulationDuration = 36;
    const taxRate = 0.10;

    const summary = drawdownInstruments(
      [taxableAccount, iraAccount],
      targetNetIncome,
      simulationDuration,
      taxRate
    );

    // Verify lifetime totals match the sum of individual schedules (style of payments.test.ts)
    for (const instrument of [taxableAccount, iraAccount]) {
      const computedLifetimeGrowth = summary[instrument.id].amortizationSchedule
        .reduce((sum: number, record: WithdrawalRecord) => sum + record.growth, 0);

      expect(summary[instrument.id].lifetimeGrowth).toBeCloseTo(computedLifetimeGrowth, 5);
    }

    // Verify global totals structure
    expect(Object.keys(summary).length).toBe(3); // 2 instruments + TOTALS
    expect(summary[constants.TOTALS].amortizationSchedule.length).toBe(36);

    // Check final period balance
    const lastRecord = summary[constants.TOTALS].amortizationSchedule[35];
    expect(lastRecord.period).toBe(36);
    expect(lastRecord.currentBalance).toBeLessThan(150000);
  });

  describe('withdrawals module - validation', () => {
    const testAccount = new Instrument(10000, 0.05, 12, 'Test Account');

    it('throws a NegativeWithdrawalError when the withdrawal amount is less than zero', () => {
      const negativeWithdrawalAmount: number = -500;

      expect(() => {
        calculateAmortizedWithdrawal(
          testAccount,
          testAccount.currentBalance,
          negativeWithdrawalAmount,
          0,
          0.15
        );
      }).toThrow(`withdrawal of ${negativeWithdrawalAmount} must be greater than/equal to zero`);
    });
  });
});
