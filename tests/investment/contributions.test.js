import { describe, expect, it } from 'vitest';

import * as constants from '@/lib/constants.ts';
import { Instrument } from '@/lib/investment/instrument.ts';
import * as contributions from '@/lib/investment/contributions.ts'

const Instruments = () => [
  new Instrument(10000, () => 0.11, 12, 'IRA', () => 6500),
  new Instrument(45000, () => 0.085, 12, '401(K)', () => 23500),
  new Instrument(0, () => 0.042666667, 12, 'ABC'),
];

describe('contributions module', () => {
  const instruments = Instruments();
  const [inst1, inst2, inst3] = instruments;

  it('amortizes a single instrument', async () => {
    const iraAmortizationSchedulePre = contributions.amortizeContributions(
      inst1,
      inst1.currentBalance,
      null,
      60,
      true,
    );
    expect(iraAmortizationSchedulePre.length).toBe(60);
    expect(iraAmortizationSchedulePre[3].period).toBe(4);
    expect(iraAmortizationSchedulePre[3].contribution).toBe(541.6666666666666);
    expect(iraAmortizationSchedulePre[3].growth).toBe(109.24347393904321);
    expect(iraAmortizationSchedulePre[3].currentBalance).toBe(12568.380024864968);
    expect(iraAmortizationSchedulePre[44].period).toBe(45);
    expect(iraAmortizationSchedulePre[44].contribution).toBe(541.6666666666666);
    expect(iraAmortizationSchedulePre[44].growth).toBe(404.5700991003198);
    expect(iraAmortizationSchedulePre[44].currentBalance).toBe(45081.15666762006);

    const iraAmortizationSchedulePost = contributions.amortizeContributions(
      inst1,
      inst1.currentBalance,
      null,
      60,
      false,
    );
    expect(iraAmortizationSchedulePost.length).toBe(60);
    expect(iraAmortizationSchedulePost[3].period).toBe(4);
    expect(iraAmortizationSchedulePost[3].contribution).toBe(541.6666666666666);
    expect(iraAmortizationSchedulePost[3].growth).toBe(114.34655234401122);
    expect(iraAmortizationSchedulePost[3].currentBalance).toBe(12588.515898963416);
    expect(iraAmortizationSchedulePost[44].period).toBe(45);
    expect(iraAmortizationSchedulePost[44].contribution).toBe(541.6666666666666);
    expect(iraAmortizationSchedulePost[44].growth).toBe(411.98851234070816);
    expect(iraAmortizationSchedulePost[44].currentBalance).toBe(45356.18985859978);
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
    expect(workAcctAmortizationSchedule[3].contribution).toBe(2000);
    expect(workAcctAmortizationSchedule[3].growth).toBe(368.3732817577221);
    expect(workAcctAmortizationSchedule[3].currentBalance).toBe(54374.01305931849);
    expect(workAcctAmortizationSchedule[23].period).toBe(24);
    expect(workAcctAmortizationSchedule[23].contribution).toBe(1500);
    expect(workAcctAmortizationSchedule[23].growth).toBe(723.6319979833261);
    expect(workAcctAmortizationSchedule[23].currentBalance).toBe(104383.44347798229);
  });

  it('determines extra contributions', async () => {
    expect(contributions.determineExtraContribution(instruments, 2250)).toBe(0);
    expect(contributions.determineExtraContribution(instruments, 3000)).toBe(500);
  });

  it('amortizes contributions for multiple instruments', async () => {
    const instrumentsContributionSummary = contributions.contributeInstruments(
      instruments,
      2250,
      25
    );

    expect(Object.keys(instrumentsContributionSummary).length).toBe(4);
    expect(instrumentsContributionSummary[inst1.id].lifetimeContribution).toBe(172499.9999999999);
    expect(instrumentsContributionSummary[inst1.id].lifetimeGrowth).toBe(835717.7570598022);
    expect(instrumentsContributionSummary[inst1.id].amortizationSchedule.length).toBe(300);
    // correct below given current code
    // but need to write ways to default/spread a single contribution across instruments
    expect(instrumentsContributionSummary[inst3.id].lifetimeContribution).toBe(0);
    expect(instrumentsContributionSummary[inst3.id].lifetimeGrowth).toBe(0);
    expect(instrumentsContributionSummary[inst3.id].amortizationSchedule.length).toBe(300);
    expect(instrumentsContributionSummary[constants.TOTALS].lifetimeContribution).toBe(804999.9999999991);
    expect(instrumentsContributionSummary[constants.TOTALS].lifetimeGrowth).toBe(2598300.5336129623);
    expect(instrumentsContributionSummary[constants.TOTALS].amortizationSchedule.length).toBe(300);
    // period 28
    expect(instrumentsContributionSummary[inst1.id].amortizationSchedule[27].period).toBe(28);
    expect(instrumentsContributionSummary[inst1.id].amortizationSchedule[27].contribution).toBe(541.6666666666666);
    expect(instrumentsContributionSummary[inst1.id].amortizationSchedule[27].growth).toBe(268.60484125436335);
    expect(instrumentsContributionSummary[inst1.id].amortizationSchedule[27].currentBalance).toBe(30112.617826578848);
    expect(instrumentsContributionSummary[inst2.id].amortizationSchedule[27].period).toBe(28);
    expect(instrumentsContributionSummary[inst2.id].amortizationSchedule[27].contribution).toBe(1958.3333333333333);
    expect(instrumentsContributionSummary[inst2.id].amortizationSchedule[27].growth).toBe(796.8148334233672);
    expect(instrumentsContributionSummary[inst2.id].amortizationSchedule[27].currentBalance).toBe(115246.6540618203);
    // correct below given current code
    // but need to write ways to default/spread a single contribution across instruments
    expect(instrumentsContributionSummary[inst3.id].amortizationSchedule[27].period).toBe(28);
    expect(instrumentsContributionSummary[inst3.id].amortizationSchedule[27].contribution).toBe(0);
    expect(instrumentsContributionSummary[inst3.id].amortizationSchedule[27].growth).toBe(0);
    expect(instrumentsContributionSummary[inst3.id].amortizationSchedule[27].currentBalance).toBe(0);
    expect(instrumentsContributionSummary[constants.TOTALS].amortizationSchedule[27].period).toBe(28);
    expect(instrumentsContributionSummary[constants.TOTALS].amortizationSchedule[27].contribution).toBe(2500);
    expect(instrumentsContributionSummary[constants.TOTALS].amortizationSchedule[27].growth).toBe(1065.4196746777307);
    expect(instrumentsContributionSummary[constants.TOTALS].amortizationSchedule[27].currentBalance).toBe(145359.27188839915);
    // period 272
    expect(instrumentsContributionSummary[inst1.id].amortizationSchedule[271].period).toBe(272);
    expect(instrumentsContributionSummary[inst1.id].amortizationSchedule[271].contribution).toBe(541.6666666666666);
    expect(instrumentsContributionSummary[inst1.id].amortizationSchedule[271].growth).toBe(6967.253017151146);
    expect(instrumentsContributionSummary[inst1.id].amortizationSchedule[271].currentBalance).toBe(767572.8851912156);
    expect(instrumentsContributionSummary[inst2.id].amortizationSchedule[271].period).toBe(272);
    expect(instrumentsContributionSummary[inst2.id].amortizationSchedule[271].contribution).toBe(1958.3333333333333);
    expect(instrumentsContributionSummary[inst2.id].amortizationSchedule[271].growth).toBe(13462.387718365255);
    expect(instrumentsContributionSummary[inst2.id].amortizationSchedule[271].currentBalance).toBe(1915993.1048209108);
    // correct below given current code
    // but need to write ways to default/spread a single contribution across instruments
    expect(instrumentsContributionSummary[inst3.id].amortizationSchedule[271].period).toBe(272);
    expect(instrumentsContributionSummary[inst3.id].amortizationSchedule[271].contribution).toBe(0);
    expect(instrumentsContributionSummary[inst3.id].amortizationSchedule[271].growth).toBe(0);
    expect(instrumentsContributionSummary[inst3.id].amortizationSchedule[271].currentBalance).toBe(0);
    expect(instrumentsContributionSummary[constants.TOTALS].amortizationSchedule[271].period).toBe(272);
    expect(instrumentsContributionSummary[constants.TOTALS].amortizationSchedule[271].contribution).toBe(2500);
    expect(instrumentsContributionSummary[constants.TOTALS].amortizationSchedule[271].growth).toBe(20429.6407355164);
    expect(instrumentsContributionSummary[constants.TOTALS].amortizationSchedule[271].currentBalance).toBe(2683565.9900121265);
  });
});
