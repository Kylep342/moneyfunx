/**
 *
 * This file containts functions for computing detailed information on contributing to investments
 *
 */

import * as constants from '../constants';
import type { IInstrument, Instrument } from './instrument';
import {
  ContributionRecord,
  InstrumentsContributionSchedule,
} from './contributionTypes';

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
}

/**
 *
 * Calculates the amortization schedule for an instrument with a contribution
 *
 * @param {Instrument} instrument The instrument to amortize contributions for
 * @param {number} initialBalance The amount invested
 * @param {number} contribution The amount to contribute to the instrument's balance each period
 * @param {number} numContributions The number of periods to make contributions to the instrument
 * @param {boolean} accrueBeforeContribution A flag for ordering operations of accrual (A) and contribution (C)
 *         true: A -> C
 *         false: C -> A
 * @returns {ContributionRecord[]} The amortization schedule for the number of contributions of contribution made to the instrument
 */
export function amortizeContributions(
  instrument: Instrument,
  initialBalance: number,
  contribution: number|null,
  numContributions: number,
  accrueBeforeContribution: boolean = true,
): ContributionRecord[] {
  if (contribution === null) {
    contribution = instrument.annualLimit() / instrument.periodsPerYear;
  }

  const amortizationSchedule: ContributionRecord[] = [];

  let ytd = 0;
  let currentBalance = initialBalance;
  numContributions = Math.min(numContributions, constants.MAX_DURATION_YEARS * instrument.periodsPerYear);
  for (let period = 0; period < numContributions; period++) {
    const contributionThisPeriod = instrument.validateContribution(contribution, ytd);
    let interestThisPeriod
    if (accrueBeforeContribution) {
      interestThisPeriod = instrument.accrueInterest(currentBalance);
      currentBalance += contributionThisPeriod + interestThisPeriod;
    } else {
      currentBalance += contributionThisPeriod;
      interestThisPeriod = instrument.accrueInterest(currentBalance);
      currentBalance += interestThisPeriod;
    }
    amortizationSchedule.push({
      period: period + 1,
      contribution: contributionThisPeriod,
      growth: interestThisPeriod,
      currentBalance,
    });
    ytd = (period + 1) % instrument.periodsPerYear ? (ytd + contributionThisPeriod) : 0;
  }
  return amortizationSchedule;
}

/**
 *
 * @param instruments
 * @param contribution
 * @returns
 */
export function contributeInstruments(
  instruments: Instrument[],
  contribution: number,
  yearsToContribute: number,
  accrueBeforeContribution: boolean = true,
): InstrumentsContributionSchedule {
  let monthlyContribution = contribution;
  const contributionSchedule: InstrumentsContributionSchedule = {};

  let totalLifetimeContribution = 0;
  let totalLifetimeGrowth = 0;
  let totalAmortizationSchedule: ContributionRecord[] = [];
  for (const instrument of instruments) {
    const instrumentContributions = amortizeContributions(
      instrument,
      instrument.currentBalance,
      null,
      yearsToContribute * instrument.periodsPerYear,
      accrueBeforeContribution,
    );
    const instrumentLifetimeContribution = instrumentContributions.reduce(
      (lifetimeContribution, record) => lifetimeContribution + record.contribution,
      0
    );
    const instrumentLifetimeGrowth = instrumentContributions.reduce(
      (lifetimeGrowth, record) => lifetimeGrowth + record.growth,
      0
    );
    contributionSchedule[instrument.id] = {
      lifetimeContribution: instrument.currentBalance + instrumentLifetimeContribution,
      lifetimeGrowth: instrumentLifetimeGrowth,
      amortizationSchedule: instrumentContributions,
    }
    totalLifetimeContribution += (instrument.currentBalance + instrumentLifetimeContribution);
    totalLifetimeGrowth += instrumentLifetimeGrowth;
    // ternary handles base case of an empty list
    // naively stole this from payments.ts
    // need to create a new algo to combine
    totalAmortizationSchedule = totalAmortizationSchedule.length ? (totalAmortizationSchedule.map((element) => {
      const matchedInnerElement = instrumentContributions.find(
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
    })) : instrumentContributions;
  }

  contributionSchedule.totals = {
    lifetimeContribution: totalLifetimeContribution,
    lifetimeGrowth: totalLifetimeGrowth,
    amortizationSchedule: totalAmortizationSchedule,
  };

  return contributionSchedule;
}
