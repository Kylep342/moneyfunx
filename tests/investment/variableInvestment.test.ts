import { describe, it, expect } from 'vitest';
import { Instrument, RateSchedule } from '../../src/lib/investment/instrument.js';
import { amortizeContributions } from '../../src/lib/investment/contributions.js';
import { drawdownInstruments } from '../../src/lib/investment/withdrawals.js';

describe('Variable Rate and Ad-hoc Investment Flow', () => {
  it('correctly calculates contributions under a variable growth rate', () => {
    // Starts at 6% return (60000n), goes up by 1% (10000n) every 12 periods
    const variableRate: RateSchedule = (period) => 60000n + BigInt(Math.floor((period - 1) / 12)) * 10000n;

    const instrument = new Instrument(10000_00n, variableRate, 12, 'Variable Roth IRA');

    // Make regular contributions of $500 (500_00n cents) for 24 months
    const schedule = amortizeContributions(instrument, 10000_00n, 500_00n, 24, 0, true);

    expect(schedule.length).toBe(24);

    // Period 1 growth (accrue interest before contribution: balance * 0.06 / 12 = 10000_00n * 0.005 = 50_00n cents ($50))
    expect(schedule[0].growth).toBe(50_00n);
    expect(schedule[0].currentBalance).toBe(10550_00n); // 10000_00n + 50_00n + 500_00n

    // Period 13 growth (accrue interest at 7% rate)
    expect(schedule[12].growth).toBe(97_91n); // $97.91
  });

  it('correctly calculates drawdown for variable target income', () => {
    const instrument = new Instrument(100000_00n, 60000n, 12, 'Taxable brokerage');

    // Generator that withdraws $1000/mo, but requires a one-off $5,000 withdrawal at period 6
    function* variableRetirementIncome() {
      let period = 1;
      while (true) {
        yield (period === 6) ? 5000_00n : 1000_00n;
        period++;
      }
    }

    const schedule = drawdownInstruments([instrument], variableRetirementIncome, 12, 0, true);

    const rothSchedule = schedule[instrument.id].amortizationSchedule;
    expect(rothSchedule.length).toBe(12);

    // Period 6 withdrawal should be 5000_00n cents ($5,000.00)
    expect(rothSchedule[5].withdrawal).toBe(5000_00n);
    expect(rothSchedule[5].growth).toBe(487_37n); // $487.37
    expect(rothSchedule[5].currentBalance).toBe(92962_24n); // $92,962.24
  });
});
