import { describe, expect, it } from 'vitest';
import { Instrument } from '../../src/lib/investment/instrument';
import { performWaterfallDrawdown } from '../../src/lib/investment/strategies';
import * as constants from '../../src/lib/constants';

describe('strategies module', () => {
  it('executes a waterfall drawdown and handles depletion', () => {
    const smallAccount = new Instrument(100000n, 50000n, 12, 'Small');
    const largeAccount = new Instrument(10000000n, 50000n, 12, 'Large');

    // Request more than Small has in one period ($5,000.00 -> 500000n cents)
    const results = performWaterfallDrawdown([smallAccount, largeAccount], 500000n, 1, 0);

    expect(results[smallAccount.id].amortizationSchedule[0].currentBalance).toBe(0n);
    expect(results[largeAccount.id].amortizationSchedule[0].withdrawal).toBeGreaterThan(0n);
    expect(results[constants.TOTALS].lifetimeWithdrawal).toBe(500000n);
  });

  it('handles exhausted income stream generator in waterfall drawdown', () => {
    const account = new Instrument(1000000n, 50000n, 12, 'Account');
    function* finiteIncome() {
      yield 100000n;
    }
    const results = performWaterfallDrawdown([account], finiteIncome, 3, 0);
    expect(results[constants.TOTALS].amortizationSchedule.length).toBe(3);
    expect(results[constants.TOTALS].amortizationSchedule[1].withdrawal).toBe(0n);
  });
});
