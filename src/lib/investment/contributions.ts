/**
 *
 * This file containts functions for computing detailed information on contributing to investments
 *
 */

import * as constants from '../constants';
import * as errors from '../errors';
import type { IInstrument, Instrument } from './instrument';
import {
  ContributionRecord,
  InstrumentsContributionSchedule,
  InstrumentBalances
} from './contributionTypes';

/**
 *
 * @param {IInstrument[]} instruments The instruments to allocate maximum contributions
 * @param {number} contribution The amount to contribute across all instruments
 * @returns {number} The extra amount of contribution
 */
export function determineExtraContribution(
  instruments: IInstrument[],
  contribution: number
): number {
  const totalMaxPayment = instruments.reduce(
    (accumulator, instrument) => accumulator + instrument.annualLimit(),
    0
  )
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
  contribution: number,
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
): InstrumentsContributionSchedule {
  let monthlyContribution = contribution;
  const contributionSchedule: InstrumentsContributionSchedule = {};
  instruments.forEach((instrument) => {
    contributionSchedule[instrument.id] = {
      lifetimeContribution: instrument.currentBalance,
      lifetimeGrowth: 0,
      amortizationSchedule: [],
    };
  });

  let periodsElapesd = 0;
  let totalLifetimeContribution = 0;
  let totalLifetimeGrowth = 0;
  let totalAmortizationSchedule: ContributionRecord[] = [];
  for (const instrument of instruments) {
    void(0);
  }
  return contributionSchedule;
}