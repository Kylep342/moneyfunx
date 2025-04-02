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
    expect(iraAmortizationSchedulePre[3].contribution).toBe(541.6666666666666);
    expect(iraAmortizationSchedulePre[3].growth).toBe(109.24347393904321);
    expect(iraAmortizationSchedulePre[3].currentBalance).toBe(12568.380024864968);
    expect(iraAmortizationSchedulePre[44].period).toBe(45);
    expect(iraAmortizationSchedulePre[44].contribution).toBe(541.6666666666666);
    expect(iraAmortizationSchedulePre[44].growth).toBe(404.57009910031996);
    expect(iraAmortizationSchedulePre[44].currentBalance).toBe(45081.156667620075);

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
    expect(workAcctAmortizationSchedule[3].contribution).toBe(23500/12);
    expect(workAcctAmortizationSchedule[3].growth).toBe(367.4815785814827);
    expect(workAcctAmortizationSchedule[3].currentBalance).toBe(54205.567182241786);
    expect(workAcctAmortizationSchedule[23].period).toBe(24);
    expect(workAcctAmortizationSchedule[23].contribution).toBe(23500/12);
    expect(workAcctAmortizationSchedule[23].growth).toBe(720.1153159934386);
    expect(workAcctAmortizationSchedule[23].currentBalance).toBe(104341.78737781222);
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
    expect(instrumentsContributionSummary[inst1.id].lifetimeContribution).toBe(162499.9999999999);
    expect(instrumentsContributionSummary[inst1.id].lifetimeGrowth).toBe(835717.7570598032);
    expect(instrumentsContributionSummary[inst1.id].amortizationSchedule.length).toBe(300);
    // correct below given current code
    // but need to write ways to default/spread a single contribution across instruments
    expect(instrumentsContributionSummary[inst3.id].lifetimeContribution).toBe(0);
    expect(instrumentsContributionSummary[inst3.id].lifetimeGrowth).toBe(0);
    expect(instrumentsContributionSummary[inst3.id].amortizationSchedule.length).toBe(300);
    expect(instrumentsContributionSummary[constants.TOTALS].lifetimeContribution).toBe(674999.9999999977);
    expect(instrumentsContributionSummary[constants.TOTALS].lifetimeGrowth).toBe(2415285.956132287);
    expect(instrumentsContributionSummary[constants.TOTALS].amortizationSchedule.length).toBe(300);
    // period 28
    expect(instrumentsContributionSummary[inst1.id].amortizationSchedule[27].period).toBe(28);
    expect(instrumentsContributionSummary[inst1.id].amortizationSchedule[27].contribution).toBe(541.6666666666666);
    expect(instrumentsContributionSummary[inst1.id].amortizationSchedule[27].growth).toBe(268.60484125436335);
    expect(instrumentsContributionSummary[inst1.id].amortizationSchedule[27].currentBalance).toBe(30112.61782657885);
    expect(instrumentsContributionSummary[inst2.id].amortizationSchedule[27].period).toBe(28);
    expect(instrumentsContributionSummary[inst2.id].amortizationSchedule[27].contribution).toBe(1708.3333333333335);
    expect(instrumentsContributionSummary[inst2.id].amortizationSchedule[27].growth).toBe(744.3283009340679);
    expect(instrumentsContributionSummary[inst2.id].amortizationSchedule[27].currentBalance).toBe(107534.30411907697);
    // correct below given current code
    // but need to write ways to default/spread a single contribution across instruments
    expect(instrumentsContributionSummary[inst3.id].amortizationSchedule[27].period).toBe(28);
    expect(instrumentsContributionSummary[inst3.id].amortizationSchedule[27].contribution).toBe(0);
    expect(instrumentsContributionSummary[inst3.id].amortizationSchedule[27].growth).toBe(0);
    expect(instrumentsContributionSummary[inst3.id].amortizationSchedule[27].currentBalance).toBe(0);
    expect(instrumentsContributionSummary[constants.TOTALS].amortizationSchedule[27].period).toBe(28);
    expect(instrumentsContributionSummary[constants.TOTALS].amortizationSchedule[27].contribution).toBe(2250);
    expect(instrumentsContributionSummary[constants.TOTALS].amortizationSchedule[27].growth).toBe(1012.9331421884312);
    expect(instrumentsContributionSummary[constants.TOTALS].amortizationSchedule[27].currentBalance).toBe(137646.92194565583);
    // period 272
    expect(instrumentsContributionSummary[inst1.id].amortizationSchedule[271].period).toBe(272);
    expect(instrumentsContributionSummary[inst1.id].amortizationSchedule[271].contribution).toBe(541.6666666666666);
    expect(instrumentsContributionSummary[inst1.id].amortizationSchedule[271].growth).toBe(6967.253017151155);
    expect(instrumentsContributionSummary[inst1.id].amortizationSchedule[271].currentBalance).toBe(767572.8851912165);
    expect(instrumentsContributionSummary[inst2.id].amortizationSchedule[271].period).toBe(272);
    expect(instrumentsContributionSummary[inst2.id].amortizationSchedule[271].contribution).toBe(1708.3333333333335);
    expect(instrumentsContributionSummary[inst2.id].amortizationSchedule[271].growth).toBe(12019.353385150405);
    expect(instrumentsContributionSummary[inst2.id].amortizationSchedule[271].currentBalance).toBe(1710577.576386776);
    // correct below given current code
    // but need to write ways to default/spread a single contribution across instruments
    expect(instrumentsContributionSummary[inst3.id].amortizationSchedule[271].period).toBe(272);
    expect(instrumentsContributionSummary[inst3.id].amortizationSchedule[271].contribution).toBe(0);
    expect(instrumentsContributionSummary[inst3.id].amortizationSchedule[271].growth).toBe(0);
    expect(instrumentsContributionSummary[inst3.id].amortizationSchedule[271].currentBalance).toBe(0);
    expect(instrumentsContributionSummary[constants.TOTALS].amortizationSchedule[271].period).toBe(272);
    expect(instrumentsContributionSummary[constants.TOTALS].amortizationSchedule[271].contribution).toBe(2250);
    expect(instrumentsContributionSummary[constants.TOTALS].amortizationSchedule[271].growth).toBe(18986.60640230156);
    expect(instrumentsContributionSummary[constants.TOTALS].amortizationSchedule[271].currentBalance).toBe(2478150.4615779924);
  });
});
