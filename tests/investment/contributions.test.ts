import { describe, expect, it } from 'vitest';

import * as constants from '../../src/lib/constants';
import { Instrument } from '../../src/lib/investment/instrument';
import * as contributions from '../../src/lib/investment/contributions';

const Instruments = (): Instrument[] => [
  new Instrument(10000_00n, 110000n, 12, 'IRA', 6500_00n),
  new Instrument(45000_00n, 85000n, 12, '401(K)', 23500_00n),
  new Instrument(0n, 42667n, 12, 'ABC'),
];

describe('contributions module', () => {
  const instruments = Instruments();
  const [inst1, inst2, inst3] = instruments;

  it('amortizes a single instrument', async () => {
    const iraAmortizationSchedulePre = contributions.amortizeContributions(
      inst1,
      inst1.currentBalance,
      inst1.periodicContribution(),
      60,
      0,
      true,
    );
    expect(iraAmortizationSchedulePre.length).toBe(60);
    expect(iraAmortizationSchedulePre[3].period).toBe(4);
    expect(iraAmortizationSchedulePre[3].contribution).toBe(541_67n);
    expect(iraAmortizationSchedulePre[3].growth).toBe(109_24n);
    expect(iraAmortizationSchedulePre[3].currentBalance).toBe(12568_39n);
    expect(iraAmortizationSchedulePre[44].period).toBe(45);
    expect(iraAmortizationSchedulePre[44].contribution).toBe(541_67n);
    expect(iraAmortizationSchedulePre[44].growth).toBe(404_57n);
    expect(iraAmortizationSchedulePre[44].currentBalance).toBe(45081_21n);

    const iraAmortizationSchedulePost = contributions.amortizeContributions(
      inst1,
      inst1.currentBalance,
      inst1.periodicContribution(),
      60,
      0,
      false,
    );
    expect(iraAmortizationSchedulePost.length).toBe(60);
    expect(iraAmortizationSchedulePost[3].period).toBe(4);
    expect(iraAmortizationSchedulePost[3].contribution).toBe(541_67n);
    expect(iraAmortizationSchedulePost[3].growth).toBe(114_35n);
    expect(iraAmortizationSchedulePost[3].currentBalance).toBe(12588_53n);
    expect(iraAmortizationSchedulePost[44].period).toBe(45);
    expect(iraAmortizationSchedulePost[44].contribution).toBe(541_67n);
    expect(iraAmortizationSchedulePost[44].growth).toBe(411_99n);
    expect(iraAmortizationSchedulePost[44].currentBalance).toBe(45356_24n); // $45,356.24
  });

  it('uses annualLimits on instruments', async () => {
    const workAcctAmortizationSchedule = contributions.amortizeContributions(
      inst2,
      inst2.currentBalance,
      2000_00n,
      24,
    );
    expect(workAcctAmortizationSchedule.length).toBe(24);
    expect(workAcctAmortizationSchedule[3].period).toBe(4);
    expect(workAcctAmortizationSchedule[3].contribution).toBe(1958_33n);
    expect(workAcctAmortizationSchedule[3].growth).toBe(367_48n);
    expect(workAcctAmortizationSchedule[3].currentBalance).toBe(54205_55n);
    expect(workAcctAmortizationSchedule[23].period).toBe(24);
    expect(workAcctAmortizationSchedule[23].contribution).toBe(1958_33n);
    expect(workAcctAmortizationSchedule[23].growth).toBe(720_11n);
    expect(workAcctAmortizationSchedule[23].currentBalance).toBe(104341_70n);
  });

  it('determines extra contributions', async () => {
    expect(contributions.determineExtraContribution(instruments, 2250_00n)).toBe(0n);
    expect(contributions.determineExtraContribution(instruments, 3000_00n)).toBe(500_00n);
  });

  it('amortizes contributions for multiple instruments', async () => {
    const instrumentsContributionSummary = contributions.contributeInstruments(
      instruments,
      2250_00n,
      300
    );

    expect(Object.keys(instrumentsContributionSummary).length).toBe(4);
    expect(instrumentsContributionSummary[inst1.id].lifetimeContribution).toBe(162500_04n);
    expect(instrumentsContributionSummary[inst1.id].lifetimeGrowth).toBe(835718_34n);
    expect(instrumentsContributionSummary[inst1.id].amortizationSchedule.length).toBe(300);
    expect(instrumentsContributionSummary[inst3.id].lifetimeContribution).toBe(0n);
    expect(instrumentsContributionSummary[inst3.id].lifetimeGrowth).toBe(0n);
    expect(instrumentsContributionSummary[inst3.id].amortizationSchedule.length).toBe(300);
    expect(instrumentsContributionSummary[constants.TOTALS].lifetimeContribution).toBe(675000_00n);
    expect(instrumentsContributionSummary[constants.TOTALS].lifetimeGrowth).toBe(2415286_50n);
    expect(instrumentsContributionSummary[constants.TOTALS].amortizationSchedule.length).toBe(300);
  });
});
