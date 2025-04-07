import { describe, expect, it } from 'vitest';

import * as constants from '@/lib/constants.ts';
import { Instrument } from '@/lib/investment/instrument.ts';
import * as contributions from '@/lib/investment/contributions.ts'

const Instruments = () => [
  new Instrument(10000, 0.11, 12, 'IRA', 6500),
  new Instrument(45000, 0.085, 12, '401(K)', 23500),
  new Instrument(0, 0.042666667, 12, 'ABC'),
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
    expect(iraAmortizationSchedulePre[3].contribution).toBeCloseTo(541.666666, 5);
    expect(iraAmortizationSchedulePre[3].growth).toBeCloseTo(109.243473, 5);
    expect(iraAmortizationSchedulePre[3].currentBalance).toBeCloseTo(12568.380024, 5);
    expect(iraAmortizationSchedulePre[44].period).toBe(45);
    expect(iraAmortizationSchedulePre[44].contribution).toBeCloseTo(541.666666, 5);
    expect(iraAmortizationSchedulePre[44].growth).toBeCloseTo(404.570099, 5);
    expect(iraAmortizationSchedulePre[44].currentBalance).toBeCloseTo(45081.156667, 5);

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
    expect(iraAmortizationSchedulePost[3].contribution).toBeCloseTo(541.666666, 5);
    expect(iraAmortizationSchedulePost[3].growth).toBeCloseTo(114.346552, 5);
    expect(iraAmortizationSchedulePost[3].currentBalance).toBeCloseTo(12588.515898, 5);
    expect(iraAmortizationSchedulePost[44].period).toBe(45);
    expect(iraAmortizationSchedulePost[44].contribution).toBeCloseTo(541.666666, 5);
    expect(iraAmortizationSchedulePost[44].growth).toBeCloseTo(411.988512, 5);
    expect(iraAmortizationSchedulePost[44].currentBalance).toBeCloseTo(45356.189858, 5);
  });

  it('uses annualLimits on instruments', async () => {
    const workAcctAmortizationSchedule = contributions.amortizeContributions(
      inst2,
      inst2.currentBalance,
      2000,
      24,
    );
    expect(workAcctAmortizationSchedule.length).toBe(24);
    expect(workAcctAmortizationSchedule[3].period).toBe(4);
    expect(workAcctAmortizationSchedule[3].contribution).toBe(23500/12);
    expect(workAcctAmortizationSchedule[3].growth).toBeCloseTo(367.481578, 5);
    expect(workAcctAmortizationSchedule[3].currentBalance).toBeCloseTo(54205.567182, 5);
    expect(workAcctAmortizationSchedule[23].period).toBe(24);
    expect(workAcctAmortizationSchedule[23].contribution).toBe(23500/12);
    expect(workAcctAmortizationSchedule[23].growth).toBeCloseTo(720.115315, 5);
    expect(workAcctAmortizationSchedule[23].currentBalance).toBeCloseTo(104341.787377, 5);
  });

  it('determines extra contributions', async () => {
    expect(contributions.determineExtraContribution(instruments, 2250)).toBe(0);
    expect(contributions.determineExtraContribution(instruments, 3000)).toBe(500);
  });

  it('amortizes contributions for multiple instruments', async () => {
    const instrumentsContributionSummary = contributions.contributeInstruments(
      instruments,
      2250,
      300
    );

    expect(Object.keys(instrumentsContributionSummary).length).toBe(4);
    expect(instrumentsContributionSummary[inst1.id].lifetimeContribution).toBeCloseTo(162499.999999, 5);
    expect(instrumentsContributionSummary[inst1.id].lifetimeGrowth).toBeCloseTo(835717.757059, 5);
    expect(instrumentsContributionSummary[inst1.id].amortizationSchedule.length).toBe(300);
    // correct below given current code
    // but need to write ways to default/spread a single contribution across instruments
    expect(instrumentsContributionSummary[inst3.id].lifetimeContribution).toBe(0);
    expect(instrumentsContributionSummary[inst3.id].lifetimeGrowth).toBe(0);
    expect(instrumentsContributionSummary[inst3.id].amortizationSchedule.length).toBe(300);
    expect(instrumentsContributionSummary[constants.TOTALS].lifetimeContribution).toBeCloseTo(674999.999999, 5);
    expect(instrumentsContributionSummary[constants.TOTALS].lifetimeGrowth).toBeCloseTo(2415285.956132, 5);
    expect(instrumentsContributionSummary[constants.TOTALS].amortizationSchedule.length).toBe(300);
    // period 28
    expect(instrumentsContributionSummary[inst1.id].amortizationSchedule[27].period).toBe(28);
    expect(instrumentsContributionSummary[inst1.id].amortizationSchedule[27].contribution).toBeCloseTo(541.666666, 5);
    expect(instrumentsContributionSummary[inst1.id].amortizationSchedule[27].growth).toBeCloseTo(268.604841, 5);
    expect(instrumentsContributionSummary[inst1.id].amortizationSchedule[27].currentBalance).toBeCloseTo(30112.617826, 5);
    expect(instrumentsContributionSummary[inst2.id].amortizationSchedule[27].period).toBe(28);
    expect(instrumentsContributionSummary[inst2.id].amortizationSchedule[27].contribution).toBeCloseTo(1708.333333, 5);
    expect(instrumentsContributionSummary[inst2.id].amortizationSchedule[27].growth).toBeCloseTo(744.328300, 5);
    expect(instrumentsContributionSummary[inst2.id].amortizationSchedule[27].currentBalance).toBeCloseTo(107534.304119, 5);
    // correct below given current code
    // but need to write ways to default/spread a single contribution across instruments
    expect(instrumentsContributionSummary[inst3.id].amortizationSchedule[27].period).toBe(28);
    expect(instrumentsContributionSummary[inst3.id].amortizationSchedule[27].contribution).toBe(0);
    expect(instrumentsContributionSummary[inst3.id].amortizationSchedule[27].growth).toBe(0);
    expect(instrumentsContributionSummary[inst3.id].amortizationSchedule[27].currentBalance).toBe(0);
    expect(instrumentsContributionSummary[constants.TOTALS].amortizationSchedule[27].period).toBe(28);
    expect(instrumentsContributionSummary[constants.TOTALS].amortizationSchedule[27].contribution).toBe(2250);
    expect(instrumentsContributionSummary[constants.TOTALS].amortizationSchedule[27].growth).toBeCloseTo(1012.933142, 5);
    expect(instrumentsContributionSummary[constants.TOTALS].amortizationSchedule[27].currentBalance).toBeCloseTo(137646.921945, 5);
    // period 272
    expect(instrumentsContributionSummary[inst1.id].amortizationSchedule[271].period).toBe(272);
    expect(instrumentsContributionSummary[inst1.id].amortizationSchedule[271].contribution).toBeCloseTo(541.666666, 5);
    expect(instrumentsContributionSummary[inst1.id].amortizationSchedule[271].growth).toBeCloseTo(6967.253017, 5);
    expect(instrumentsContributionSummary[inst1.id].amortizationSchedule[271].currentBalance).toBeCloseTo(767572.885191, 5);
    expect(instrumentsContributionSummary[inst2.id].amortizationSchedule[271].period).toBe(272);
    expect(instrumentsContributionSummary[inst2.id].amortizationSchedule[271].contribution).toBeCloseTo(1708.333333, 5);
    expect(instrumentsContributionSummary[inst2.id].amortizationSchedule[271].growth).toBeCloseTo(12019.353385, 5);
    expect(instrumentsContributionSummary[inst2.id].amortizationSchedule[271].currentBalance).toBeCloseTo(1710577.576386, 5);
    // correct below given current code
    // but need to write ways to default/spread a single contribution across instruments
    expect(instrumentsContributionSummary[inst3.id].amortizationSchedule[271].period).toBe(272);
    expect(instrumentsContributionSummary[inst3.id].amortizationSchedule[271].contribution).toBe(0);
    expect(instrumentsContributionSummary[inst3.id].amortizationSchedule[271].growth).toBe(0);
    expect(instrumentsContributionSummary[inst3.id].amortizationSchedule[271].currentBalance).toBe(0);
    expect(instrumentsContributionSummary[constants.TOTALS].amortizationSchedule[271].period).toBe(272);
    expect(instrumentsContributionSummary[constants.TOTALS].amortizationSchedule[271].contribution).toBe(2250);
    expect(instrumentsContributionSummary[constants.TOTALS].amortizationSchedule[271].growth).toBeCloseTo(18986.606402, 5);
    expect(instrumentsContributionSummary[constants.TOTALS].amortizationSchedule[271].currentBalance).toBeCloseTo(2478150.461577, 5);
  });
});
