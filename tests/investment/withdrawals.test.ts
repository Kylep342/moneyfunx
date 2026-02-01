import { describe, expect, it } from 'vitest';

import * as constants from '@/lib/constants';
import { Instrument } from '@/lib/investment/instrument';
import { calculateAmortizedWithdrawal, drawdownInstruments } from '@/lib/investment/withdrawals';

describe('withdrawals module', () => {
  const taxableAccount = new Instrument(50000, 0.05, 12, 'Brokerage');
  const iraAccount = new Instrument(100000, 0.07, 12, 'Traditional IRA');

  it('calculates a single period amortized withdrawal correctly', () => {
    const singlePeriodRecord = calculateAmortizedWithdrawal(
      taxableAccount,
      taxableAccount.currentBalance,
      5000,
      0,
      0.15
    );

    // 50,000 * (0.05/12) = 208.33 growth
    // 50,208.33 - 5000 = 45,208.33 remaining
    expect(singlePeriodRecord.growth).toBeCloseTo(208.33333, 5);
    expect(singlePeriodRecord.currentBalance).toBeCloseTo(45208.33333, 5);
  });

  it('respects withdrawal order in multiple instruments', () => {
    const instrumentationOrder: Instrument[] = [taxableAccount, iraAccount];
    const targetNetIncome: number = 4000;
    const simulationDuration: number = 24;
    const assumedTaxRate: number = 0.15;

    const summary = drawdownInstruments(
      instrumentationOrder,
      targetNetIncome,
      simulationDuration,
      assumedTaxRate
    );

    // 4000 / (1 - 0.15) = ~4705.88 gross
    const firstPeriodTaxable = summary[taxableAccount.id].amortizationSchedule[0];
    expect(firstPeriodTaxable.withdrawal).toBeCloseTo(4705.88, 1);

    // IRA should be untouched in period 1 because taxable covered the net 4000
    const firstPeriodIra = summary[iraAccount.id].amortizationSchedule[0];
    expect(firstPeriodIra.withdrawal).toBe(0);
  });

  it('aggregates total lifetime statistics correctly', () => {
    const targetNetIncome: number = 2000;
    const simulationDuration: number = 12;

    const summary = drawdownInstruments(
      [taxableAccount, iraAccount],
      targetNetIncome,
      simulationDuration,
      0
    );

    const totals = summary[constants.TOTALS];
    expect(totals.lifetimeWithdrawal).toBe(targetNetIncome * simulationDuration);
    expect(totals.amortizationSchedule.length).toBe(simulationDuration);
  });
});
