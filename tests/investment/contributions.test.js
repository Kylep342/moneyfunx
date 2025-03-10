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

  it('amortizes contributions for multiple instruments', async () => {
    const instrumentsContributionSummary = contributions.contributeInstruments(
      instruments,
      2250,
      25
    );

    expect(Object.keys(instrumentsContributionSummary).length).toBe(3);
  });
});
