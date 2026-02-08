/**
 *
 * This file containts functions for computing detailed information on contributing to investments
 *
 */

import type { Instrument } from '../investment/instrument.js';
import {
  ContributionRecord,
  InstrumentsContributionSchedule,
  InstrumentBalances,
  InstrumentYTDs,
} from '../investment/contributionTypes.js';

/**
 *
 * @param {IInstrument[]} instruments The instruments to allocate maximum contributions
 * @param {number} contribution The amount to contribute across all instruments
 * @returns {number} The extra amount of contribution
 */
export function determineExtraContribution(
  instruments: Instrument[],
  contribution: number
): number {
  const totalMaxPayment = instruments.reduce(
    (accumulator, instrument) => accumulator + instrument.periodicContribution(),
    0
  );
  return Math.max(contribution - totalMaxPayment, 0);
};

/**
 *
 * @param {Instrument} instrument The Instrument to contribute to
 * @param {number} currentBalance The current balance of the Instrument (at startPeriod)
 * @param {number} contribution The amount to contribute to the instrument's balance
 * @param {number[int]} startPeriod The initial offset for period values
 * @param {boolean} accrueBeforeContribution A flag for ordering operations of accrual (A) and contribution (C)
 *         true: A -> C
 *         false: C -> A
 * @returns {ContributionRecord} The amortized contribution
 */
export function amortizeContribution(
  instrument: Instrument,
  currentBalance: number,
  contribution: number,
  startPeriod: number = 0,
  accrueBeforeContribution: boolean = true,
): ContributionRecord {
  let interestThisPeriod
  if (accrueBeforeContribution) {
    interestThisPeriod = instrument.accrueInterest(currentBalance);
    currentBalance += contribution + interestThisPeriod;
  } else {
    currentBalance += contribution;
    interestThisPeriod = instrument.accrueInterest(currentBalance);
    currentBalance += interestThisPeriod;
  }
  return {
    period: startPeriod + 1,
    contribution: contribution,
    growth: interestThisPeriod,
    currentBalance,
  };
};

/**
 *
 * Calculates the amortization schedule for an instrument with a contribution
 *
 * @param {Instrument} instrument The instrument to amortize contributions for
 * @param {number} initialBalance The amount invested
 * @param {number} contribution The amount to contribute to the instrument's balance each period
 * @param {number} numContributions The number of periods to make contributions to the instrument
 * @param {number[int]} startPeriod The inital offset for period values
 * @param {boolean} accrueBeforeContribution A flag for ordering operations of accrual (A) and contribution (C)
 *         true: A -> C
 *         false: C -> A
 * @returns {ContributionRecord[]} The amortized contributions
 */
export function amortizeContributions(
  instrument: Instrument,
  initialBalance: number,
  contribution: number,
  numContributions: number,
  startPeriod: number = 0,
  accrueBeforeContribution: boolean = true,
): ContributionRecord[] {
  const contributionSchedule: ContributionRecord[] = [];
  let currentBalance = initialBalance;
  let ytd = 0;
  for (let period = 0; period < numContributions; period++) {
    const periodicContribution = instrument.validateContribution(contribution, ytd);
    const record = amortizeContribution(
      instrument,
      currentBalance,
      periodicContribution,
      period + startPeriod,
      accrueBeforeContribution
    );
    currentBalance = record.currentBalance
    period % 12 === 0 ? ytd = 0 : ytd += periodicContribution;
    contributionSchedule.push(record);
  }
  return contributionSchedule;
};

/**
 *
 * @param {Instrument[]} instruments The instruments to contribute to
 * @param {number} contribution The total amount to contirbute each period
 * @param {number[int]} numContributions The number of periods to contribute
 * @param {boolean} accrueBeforeContribution A flag for ordering operations of accrual (A) and contribution (C)
 *         true: A -> C
 *         false: C -> A
 * @returns {InstrumentsContributionSchedule} The amortized contributions for all instruments
 */
export function contributeInstruments(
  instruments: Instrument[],
  contribution: number,
  numContributions: number,
  accrueBeforeContribution: boolean = true,
): InstrumentsContributionSchedule {

  // state setup
  const contributionSchedules: InstrumentsContributionSchedule = {};
  const instrumentBalances: InstrumentBalances = {};
  const instrumentYTDs: InstrumentYTDs = {};
  let totalLifetimeContribution = 0;
  let totalLifetimeGrowth = 0;
  let totalAmortizationSchedule: ContributionRecord[] = [];

  instruments.forEach((instrument) => {
    contributionSchedules[instrument.id] = {
      lifetimeGrowth: 0,
      lifetimeContribution: 0,
      amortizationSchedule: [],
    };

    instrumentBalances[instrument.id] = instrument.currentBalance;

    instrumentYTDs[instrument.id] = 0;
  });

  // algorithm to build contributionSchedules
  for (let period = 0; period < numContributions; period++) {
    let periodicContribution = contribution;

    for (const instrument of instruments) {
      if (period % instrument.periodsPerYear == 1) {
        instrumentYTDs[instrument.id] = 0
      }
      const validContribution = instrument.validateContribution(
        Math.min(periodicContribution, instrument.periodicContribution()),
        instrumentYTDs[instrument.id]
      )
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

  // contributionSchedule is full; compute totals & verify
  for (const instrument of instruments) {
    const instrumentSchedule = contributionSchedules[instrument.id].amortizationSchedule;
    const instrumentLifetimeContribution = instrumentSchedule.reduce(
      (lifetimeContribution, record) => lifetimeContribution + record.contribution,
      0
    );
    const instrumentLifetimeGrowth = instrumentSchedule.reduce(
      (lifetimeGrowth, record) => lifetimeGrowth + record.growth,
      0
    );
    contributionSchedules[instrument.id].lifetimeContribution = instrumentLifetimeContribution;
    contributionSchedules[instrument.id].lifetimeGrowth = instrumentLifetimeGrowth;
    totalLifetimeContribution += instrumentLifetimeContribution;
    totalLifetimeGrowth += instrumentLifetimeGrowth;
    totalAmortizationSchedule = totalAmortizationSchedule.length
      ? (totalAmortizationSchedule.map((element) => {
        const matchedInnerElement = instrumentSchedule.find(
          (innerElement) => innerElement.period === element.period
        );
        return (matchedInnerElement != null)
          ? {
            period: element.period,
            contribution: element.contribution + matchedInnerElement.contribution,
            growth: element.growth + matchedInnerElement.growth,
            currentBalance:
              element.currentBalance +
              matchedInnerElement.currentBalance
          }
          : element
      }))
    : instrumentSchedule;
  }

  contributionSchedules.totals = {
    lifetimeContribution: totalLifetimeContribution,
    lifetimeGrowth: totalLifetimeGrowth,
    amortizationSchedule: totalAmortizationSchedule,
  };

  return contributionSchedules;
};
