/**
 * This file contains functions for computing detailed information on contributing to investments
 * using pure BigInt math.
 */

import { TOTALS } from '../constants.js';
import type { Instrument } from '../investment/instrument.js';
import * as primitives from '../shared/primitives.js';
import type {
  ContributionRecord,
  InstrumentsContributionSchedule,
  InstrumentBalances,
  InstrumentYTDs,
} from '../investment/contributionTypes.js';

/**
 * Calculates the extra amount in a contribution after all instruments' maximum contributions are met.
 *
 * @param {Instrument[]} instruments The instruments to allocate maximum contributions
 * @param {bigint} contribution The amount to contribute across all instruments (in cents)
 * @returns {bigint} The extra amount of contribution (in cents)
 */
export function determineExtraContribution(
  instruments: Instrument[],
  contribution: bigint
): bigint {
  const totalMaxPayment = instruments.reduce(
    (accumulator, instrument) => accumulator + instrument.periodicContribution(),
    0n
  );
  const diff = contribution - totalMaxPayment;
  return diff > 0n ? diff : 0n;
}

/**
 * Calculates a single period's contribution record.
 *
 * @param {Instrument} instrument The Instrument to contribute to
 * @param {bigint} currentBalance The current balance of the Instrument (in cents)
 * @param {bigint} contribution The amount to contribute to the instrument's balance (in cents)
 * @param {number} startPeriod The initial offset for period values
 * @param {boolean} accrueBeforeContribution A flag for ordering operations of accrual (A) and contribution (C)
 * @returns {ContributionRecord} The amortized contribution (in cents)
 */
export function amortizeContribution(
  instrument: Instrument,
  currentBalance: bigint,
  contribution: bigint,
  startPeriod: number = 0,
  accrueBeforeContribution: boolean = true,
): ContributionRecord {
  let interestThisPeriod: bigint;
  let newBalance = currentBalance;
  const currentPeriod = startPeriod + 1;

  if (accrueBeforeContribution) {
    interestThisPeriod = instrument.accrueInterest(newBalance, currentPeriod);
    newBalance += contribution + interestThisPeriod;
  } else {
    newBalance += contribution;
    interestThisPeriod = instrument.accrueInterest(newBalance, currentPeriod);
    newBalance += interestThisPeriod;
  }
  return {
    period: currentPeriod,
    contribution,
    growth: interestThisPeriod,
    currentBalance: newBalance,
  };
}

/**
 * Calculates the amortization schedule for an instrument with a contribution.
 *
 * @param {Instrument} instrument The instrument to amortize contributions for
 * @param {bigint} initialBalance The amount invested (in cents)
 * @param {primitives.PaymentScheduleInput} contribution The amount to contribute each period or generator (in cents)
 * @param {number} numContributions The number of periods to make contributions
 * @param {number} startPeriod The initial offset for period values
 * @param {boolean} accrueBeforeContribution A flag for ordering operations of accrual (A) and contribution (C)
 * @returns {ContributionRecord[]} The amortized contributions (in cents)
 */
export function amortizeContributions(
  instrument: Instrument,
  initialBalance: bigint,
  contribution: primitives.PaymentScheduleInput,
  numContributions: number,
  startPeriod: number = 0,
  accrueBeforeContribution: boolean = true,
): ContributionRecord[] {
  const contributionSchedule: ContributionRecord[] = [];
  let currentBalance = initialBalance;
  let ytd = 0n;
  const contributionStream = primitives.getPaymentStream(contribution, 0n)();

  for (let period = 0; period < numContributions; period++) {
    const currentPeriod = startPeriod + period + 1;
    const nextCont = contributionStream.next({ period: currentPeriod, balance: currentBalance });
    const contVal = nextCont.done ? 0n : nextCont.value;

    const periodicContribution = instrument.validateContribution(contVal, ytd);
    const record = amortizeContribution(
      instrument,
      currentBalance,
      periodicContribution,
      currentPeriod - 1,
      accrueBeforeContribution
    );
    currentBalance = record.currentBalance;

    if (period % 12 === 0) {
      ytd = 0n;
    } else {
      ytd += periodicContribution;
    }
    contributionSchedule.push(record);
  }
  return contributionSchedule;
}

/**
 * Calculates detailed info on contributing to a set of instruments with a total contribution amount.
 *
 * @param {Instrument[]} instruments The instruments to contribute to
 * @param {primitives.PaymentScheduleInput} contribution The total amount to contribute each period or generator (in cents)
 * @param {number} numContributions The number of periods to contribute
 * @param {boolean} accrueBeforeContribution A flag for ordering operations of accrual (A) and contribution (C)
 * @returns {InstrumentsContributionSchedule} The amortized contributions for all instruments (in cents)
 */
export function contributeInstruments(
  instruments: Instrument[],
  contribution: primitives.PaymentScheduleInput,
  numContributions: number,
  accrueBeforeContribution: boolean = true,
): InstrumentsContributionSchedule {
  const contributionSchedules: InstrumentsContributionSchedule = {};
  const instrumentBalances: InstrumentBalances = {};
  const instrumentYTDs: InstrumentYTDs = {};
  let totalLifetimeContribution = 0n;
  let totalLifetimeGrowth = 0n;
  let totalAmortizationSchedule: ContributionRecord[] = [];
  const contributionStream = primitives.getPaymentStream(contribution, 0n)();

  instruments.forEach((instrument) => {
    contributionSchedules[instrument.id] = {
      lifetimeGrowth: 0n,
      lifetimeContribution: 0n,
      amortizationSchedule: [],
    };
    instrumentBalances[instrument.id] = instrument.currentBalance;
    instrumentYTDs[instrument.id] = 0n;
  });

  for (let period = 0; period < numContributions; period++) {
    const currentPeriod = period + 1;
    const nextCont = contributionStream.next({ period: currentPeriod, balance: 0n });
    let periodicContribution = nextCont.done ? 0n : nextCont.value;

    for (const instrument of instruments) {
      if (period % instrument.periodsPerYear === 1) {
        instrumentYTDs[instrument.id] = 0n;
      }
      // contribution target is periodic contribution limit or remaining
      const cap = instrument.periodicContribution();
      const grossTarget = periodicContribution < cap ? periodicContribution : cap;
      const validContribution = instrument.validateContribution(
        grossTarget,
        instrumentYTDs[instrument.id]
      );
      const instrumentContribution = amortizeContribution(
        instrument,
        instrumentBalances[instrument.id],
        validContribution,
        period,
        accrueBeforeContribution,
      );
      contributionSchedules[instrument.id].amortizationSchedule = [
        ...contributionSchedules[instrument.id].amortizationSchedule,
        instrumentContribution
      ];

      instrumentBalances[instrument.id] = instrumentContribution.currentBalance;
      instrumentYTDs[instrument.id] += validContribution;
      periodicContribution -= validContribution;
    }
  }

  for (const instrument of instruments) {
    const instrumentSchedule = contributionSchedules[instrument.id].amortizationSchedule;
    const instrumentLifetimeContribution = instrumentSchedule.reduce(
      (lifetimeContribution: bigint, record: ContributionRecord) => lifetimeContribution + record.contribution,
      0n
    );
    const instrumentLifetimeGrowth = instrumentSchedule.reduce(
      (lifetimeGrowth: bigint, record: ContributionRecord) => lifetimeGrowth + record.growth,
      0n
    );
    contributionSchedules[instrument.id].lifetimeContribution = instrumentLifetimeContribution;
    contributionSchedules[instrument.id].lifetimeGrowth = instrumentLifetimeGrowth;
    totalLifetimeContribution += instrumentLifetimeContribution;
    totalLifetimeGrowth += instrumentLifetimeGrowth;

    if (totalAmortizationSchedule.length === 0) {
      totalAmortizationSchedule = [...instrumentSchedule];
    } else {
      const maxLen = Math.max(totalAmortizationSchedule.length, instrumentSchedule.length);
      const newTotal: ContributionRecord[] = [];

      for (let i = 0; i < maxLen; i++) {
        const totalRecord = totalAmortizationSchedule[i];
        const instrumentRecord = instrumentSchedule[i];

        if (totalRecord && instrumentRecord) {
           newTotal.push({
             period: totalRecord.period,
             contribution: totalRecord.contribution + instrumentRecord.contribution,
             growth: totalRecord.growth + instrumentRecord.growth,
             currentBalance: totalRecord.currentBalance + instrumentRecord.currentBalance
           });
        } else if (totalRecord) {
           newTotal.push(totalRecord);
        } else if (instrumentRecord) {
           newTotal.push(instrumentRecord);
        }
      }
      totalAmortizationSchedule = newTotal;
    }
  }

  contributionSchedules[TOTALS] = {
    lifetimeContribution: totalLifetimeContribution,
    lifetimeGrowth: totalLifetimeGrowth,
    amortizationSchedule: totalAmortizationSchedule,
  };

  return contributionSchedules;
}
