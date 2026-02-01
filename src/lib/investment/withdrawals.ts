/**
 * This file contains functions for computing detailed information on drawing
 * down investment instruments during retirement distribution.
 */

import { Instrument } from '@/lib/investment/instrument';
import {
  WithdrawalRecord,
  InstrumentsWithdrawalSchedule,
  InstrumentBalances
} from '@/lib/investment/withdrawalTypes';
import { TOTALS } from '@/lib/constants';

/**
 * Calculates a single period's withdrawal record.
 * * @param {Instrument} financialInstrument - The instrument to withdraw from.
 * @param {number} currentInstrumentBalance - The balance at the start of the period.
 * @param {number} periodicWithdrawalAmount - The gross amount to take out.
 * @param {number} periodsElapsedOffset - Initial offset for period numbering.
 * @param {number} applicableTaxRate - The tax rate applied to the withdrawal.
 * @param {boolean} [accrueBeforeWithdrawal=true] - Ordering of interest vs withdrawal.
 * @returns {WithdrawalRecord} The resulting record for the period.
 */
export function calculateAmortizedWithdrawal(
  financialInstrument: Instrument,
  currentInstrumentBalance: number,
  periodicWithdrawalAmount: number,
  periodsElapsedOffset: number = 0,
  applicableTaxRate: number = 0,
  accrueBeforeWithdrawal: boolean = true
): WithdrawalRecord {
  let interestThisPeriod: number;
  let remainingBalance: number;

  if (accrueBeforeWithdrawal) {
    interestThisPeriod = financialInstrument.accrueInterest(currentInstrumentBalance);
    const balanceAfterAccrual: number = currentInstrumentBalance + interestThisPeriod;
    const actualWithdrawal: number = Math.min(periodicWithdrawalAmount, balanceAfterAccrual);
    remainingBalance = balanceAfterAccrual - actualWithdrawal;

    return {
      period: periodsElapsedOffset + 1,
      withdrawal: actualWithdrawal,
      netAmount: actualWithdrawal * (1 - applicableTaxRate),
      growth: interestThisPeriod,
      currentBalance: remainingBalance,
    };
  }

  const actualWithdrawal: number = Math.min(periodicWithdrawalAmount, currentInstrumentBalance);
  const balanceAfterWithdrawal: number = currentInstrumentBalance - actualWithdrawal;
  interestThisPeriod = financialInstrument.accrueInterest(balanceAfterWithdrawal);
  remainingBalance = balanceAfterWithdrawal + interestThisPeriod;

  return {
    period: periodsElapsedOffset + 1,
    withdrawal: actualWithdrawal,
    netAmount: actualWithdrawal * (1 - applicableTaxRate),
    growth: interestThisPeriod,
    currentBalance: remainingBalance,
  };
}

/**
 * Orchestrates drawing down a set of instruments to meet a target net income.
 * * @param {Instrument[]} financialInstruments - Ordered list of accounts to draw from.
 * @param {number} targetNetPeriodicIncome - The take-home cash required.
 * @param {number} totalPeriodsToSimulate - How many periods to run the analysis.
 * @param {number} [defaultTaxRate=0] - Simplified tax rate for the distribution.
 * @param {boolean} [accrueBeforeWithdrawal=true] - Interest timing flag.
 * @returns {InstrumentsWithdrawalSchedule} Comprehensive per-instrument and total stats.
 */
export function drawdownInstruments(
  financialInstruments: Instrument[],
  targetNetPeriodicIncome: number,
  totalPeriodsToSimulate: number,
  defaultTaxRate: number = 0,
  accrueBeforeWithdrawal: boolean = true
): InstrumentsWithdrawalSchedule {
  const withdrawalSchedules: any = {};
  const currentInstrumentBalances: InstrumentBalances = {};

  let totalLifetimeWithdrawal: number = 0;
  let totalLifetimeGrowth: number = 0;
  const totalAmortizationSchedule: WithdrawalRecord[] = [];

  // Initial State Setup
  financialInstruments.forEach((instrument) => {
    withdrawalSchedules[instrument.id] = {
      lifetimeGrowth: 0,
      lifetimeWithdrawal: 0,
      amortizationSchedule: [],
    };
    currentInstrumentBalances[instrument.id] = instrument.currentBalance;
  });

  for (let period: number = 0; period < totalPeriodsToSimulate; period++) {
    let remainingNetRequiredThisPeriod: number = targetNetPeriodicIncome;
    let periodTotalWithdrawal: number = 0;
    let periodTotalNet: number = 0;
    let periodTotalGrowth: number = 0;
    let periodTotalBalance: number = 0;

    for (const instrument of financialInstruments) {
      const grossNeededForRemainingNet: number = remainingNetRequiredThisPeriod / (1 - defaultTaxRate);

      const record: WithdrawalRecord = calculateAmortizedWithdrawal(
        instrument,
        currentInstrumentBalances[instrument.id],
        grossNeededForRemainingNet,
        period,
        defaultTaxRate,
        accrueBeforeWithdrawal
      );

      withdrawalSchedules[instrument.id].amortizationSchedule.push(record);
      withdrawalSchedules[instrument.id].lifetimeWithdrawal += record.withdrawal;
      withdrawalSchedules[instrument.id].lifetimeGrowth += record.growth;

      currentInstrumentBalances[instrument.id] = record.currentBalance;
      remainingNetRequiredThisPeriod -= record.netAmount;

      // Aggregate Totals
      periodTotalWithdrawal += record.withdrawal;
      periodTotalNet += record.netAmount;
      periodTotalGrowth += record.growth;
      periodTotalBalance += record.currentBalance;
    }

    totalAmortizationSchedule.push({
      period: period + 1,
      withdrawal: periodTotalWithdrawal,
      netAmount: periodTotalNet,
      growth: periodTotalGrowth,
      currentBalance: periodTotalBalance,
    });

    totalLifetimeWithdrawal += periodTotalWithdrawal;
    totalLifetimeGrowth += periodTotalGrowth;
  }

  withdrawalSchedules[TOTALS] = {
    lifetimeWithdrawal: totalLifetimeWithdrawal,
    lifetimeGrowth: totalLifetimeGrowth,
    amortizationSchedule: totalAmortizationSchedule,
  };

  return withdrawalSchedules;
}
