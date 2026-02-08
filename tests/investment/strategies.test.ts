import { describe, expect, it } from 'vitest';
import { Instrument } from '../../src/lib/investment/instrument';
import { performWaterfallDrawdown } from '../../src/lib/investment/strategies';
import * as constants from '../../src/lib/constants';

describe('strategies module', () => {
  it('executes a waterfall drawdown and handles depletion', () => {
    const smallAccount = new Instrument(1000, 0.05, 12, 'Small');
    const largeAccount = new Instrument(100000, 0.05, 12, 'Large');

    // Request more than Small has in one period
    const results = performWaterfallDrawdown([smallAccount, largeAccount], 5000, 1, 0);

    expect(results[smallAccount.id].amortizationSchedule[0].currentBalance).toBe(0);
    expect(results[largeAccount.id].amortizationSchedule[0].withdrawal).toBeGreaterThan(0);
    expect(results[constants.TOTALS].lifetimeWithdrawal).toBe(5000);
  });
});
