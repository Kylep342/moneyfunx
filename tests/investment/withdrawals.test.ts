import { describe, expect, it } from 'vitest';

import * as constants from '../../src/lib/constants';
import { Instrument } from '../../src/lib/investment/instrument';
import { calculateAmortizedWithdrawal, drawdownInstruments } from '../../src/lib/investment/withdrawals';
import { WithdrawalRecord } from '../../src/lib/investment/withdrawalTypes';

const Instruments = (): Instrument[] => [
  new Instrument(5000000n, 60000n, 12, 'Taxable Account'),
  new Instrument(10000000n, 80000n, 12, 'IRA Account'),
];

describe('withdrawals module', () => {
  const [taxableAccount, iraAccount] = Instruments();

  it('calculates a single period amortized withdrawal (Accrue Before)', async () => {
    const record = calculateAmortizedWithdrawal(
      taxableAccount,
      5000000n,
      200000n,
      0,
      0.15,
      true
    );

    // 50,000 * (0.06/12) = 250 growth
    // 50,250 - 2000 withdrawal = 48,250
    expect(record.growth).toBe(25000n);
    expect(record.currentBalance).toBe(4825000n);
    expect(record.netAmount).toBe(170000n); // 2000 * 0.85
  });

  it('calculates a single period amortized withdrawal (Withdraw Before)', async () => {
    const record = calculateAmortizedWithdrawal(
      taxableAccount,
      5000000n,
      200000n,
      0,
      0.15,
      false
    );

    // 50,000 - 2000 = 48,000
    // 48,000 * (0.06/12) = 240 growth
    // 48,000 + 240 = 48,240
    expect(record.growth).toBe(24000n);
    expect(record.currentBalance).toBe(4824000n);
    expect(record.netAmount).toBe(170000n);
  });

  it('draws down multiple instruments and validates comprehensive schedules', async () => {
    const targetNetIncome = 300000n;
    const simulationDuration = 36;
    const taxRate = 0.10;

    const summary = drawdownInstruments(
      [taxableAccount, iraAccount],
      targetNetIncome,
      simulationDuration,
      taxRate
    );

    for (const instrument of [taxableAccount, iraAccount]) {
      const computedLifetimeGrowth = summary[instrument.id].amortizationSchedule
        .reduce((sum: bigint, record: WithdrawalRecord) => sum + record.growth, 0n);

      expect(summary[instrument.id].lifetimeGrowth).toBe(computedLifetimeGrowth);
    }

    expect(Object.keys(summary).length).toBe(3); // 2 instruments + TOTALS
    expect(summary[constants.TOTALS].amortizationSchedule.length).toBe(36);

    const lastRecord = summary[constants.TOTALS].amortizationSchedule[35];
    expect(lastRecord.period).toBe(36);
    expect(lastRecord.currentBalance).toBeLessThan(15000000n);
  });

  describe('withdrawals module - validation', () => {
    const testAccount = new Instrument(1000000n, 50000n, 12, 'Test Account');

    it('throws a NegativeWithdrawalError when the withdrawal amount is less than zero', () => {
      const negativeWithdrawalAmount = -50000n;

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
