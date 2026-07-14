/**
 * This file contains functions for computing detailed information on drawing
 * down investment instruments during retirement distribution using pure BigInt math.
 */

import { TOTALS } from '../constants.js';
import * as errors from '../errors.js';
import { Instrument } from '../investment/instrument.js';
import * as primitives from '../shared/primitives.js';
import {
  WithdrawalRecord,
  InstrumentsWithdrawalSchedule,
  InstrumentBalances
} from '../investment/withdrawalTypes.js';

/**
 * Calculates a single period's withdrawal record.
 *
 * @param {Instrument} instrument - The instrument to withdraw from.
 * @param {bigint} currentInstrumentBalance - The balance at the start of the period (in cents).
 * @param {bigint} periodicWithdrawalAmount - The gross amount to take out (in cents).
 * @param {number} periodsElapsedOffset - Initial offset for period numbering.
 * @param {number} applicableTaxRate - The tax rate applied to the withdrawal (as float).
 * @param {boolean} [accrueBeforeWithdrawal=true] - Ordering of interest vs withdrawal.
 * @returns {WithdrawalRecord} The resulting record for the period.
 */
export function calculateAmortizedWithdrawal(
  instrument: Instrument,
  currentInstrumentBalance: bigint,
  periodicWithdrawalAmount: bigint,
  periodsElapsedOffset: number = 0,
  applicableTaxRate: number = 0,
  accrueBeforeWithdrawal: boolean = true
): WithdrawalRecord {
  if (periodicWithdrawalAmount < 0n) {
    throw new errors.NegativeWithdrawalError(
      `withdrawal of ${periodicWithdrawalAmount} must be greater than/equal to zero`
    );
  }

  let interestThisPeriod: bigint;
  let remainingBalance: bigint;
  const currentPeriod = periodsElapsedOffset + 1;

  if (accrueBeforeWithdrawal) {
    interestThisPeriod = instrument.accrueInterest(currentInstrumentBalance, currentPeriod);
    const balanceAfterAccrual: bigint = currentInstrumentBalance + interestThisPeriod;
    const actualWithdrawal: bigint = periodicWithdrawalAmount < balanceAfterAccrual ? periodicWithdrawalAmount : balanceAfterAccrual;
    remainingBalance = balanceAfterAccrual - actualWithdrawal;
    const netAmount = BigInt(Math.round(Number(actualWithdrawal) * (1 - applicableTaxRate)));

    return {
      period: currentPeriod,
      withdrawal: actualWithdrawal,
      netAmount,
      growth: interestThisPeriod,
      currentBalance: remainingBalance,
    };
  }

  const actualWithdrawal: bigint = periodicWithdrawalAmount < currentInstrumentBalance ? periodicWithdrawalAmount : currentInstrumentBalance;
  const balanceAfterWithdrawal: bigint = currentInstrumentBalance - actualWithdrawal;
  interestThisPeriod = instrument.accrueInterest(balanceAfterWithdrawal, currentPeriod);
  remainingBalance = balanceAfterWithdrawal + interestThisPeriod;
  const netAmount = BigInt(Math.round(Number(actualWithdrawal) * (1 - applicableTaxRate)));

  return {
    period: currentPeriod,
    withdrawal: actualWithdrawal,
    netAmount,
    growth: interestThisPeriod,
    currentBalance: remainingBalance,
  };
}

/**
 * Orchestrates drawing down a set of instruments to meet a target net income.
 *
 * @param {Instrument[]} instruments - Ordered list of accounts to draw from.
 * @param {primitives.PaymentScheduleInput} targetNetPeriodicIncome - The take-home cash required or generator (in cents).
 * @param {number} totalPeriodsToSimulate - How many periods to run the analysis.
 * @param {number} [effectiveTaxRate=0] - Simplified tax rate for the distribution.
 * @param {boolean} [accrueBeforeWithdrawal=true] - Interest timing flag.
 * @returns {InstrumentsWithdrawalSchedule} Comprehensive per-instrument and total stats.
 */
export function drawdownInstruments(
  instruments: Instrument[],
  targetNetPeriodicIncome: primitives.PaymentScheduleInput,
  totalPeriodsToSimulate: number,
  effectiveTaxRate: number = 0,
  accrueBeforeWithdrawal: boolean = true
): InstrumentsWithdrawalSchedule {
  const withdrawalSchedules = {} as InstrumentsWithdrawalSchedule;
  const currentInstrumentBalances: InstrumentBalances = {};

  let totalLifetimeWithdrawal = 0n;
  let totalLifetimeGrowth = 0n;
  const totalAmortizationSchedule: WithdrawalRecord[] = [];
  const incomeStream = primitives.getPaymentStream(targetNetPeriodicIncome, 0n)();

  instruments.forEach((instrument) => {
    withdrawalSchedules[instrument.id] = {
      lifetimeGrowth: 0n,
      lifetimeWithdrawal: 0n,
      amortizationSchedule: [],
    };
    currentInstrumentBalances[instrument.id] = instrument.currentBalance;
  });

  for (let period = 0; period < totalPeriodsToSimulate; period++) {
    const currentPeriod = period + 1;
    const nextIncome = incomeStream.next({ period: currentPeriod, balance: 0n });
    let remainingNetRequiredThisPeriod = nextIncome.done ? 0n : nextIncome.value;
    let periodTotalWithdrawal = 0n;
    let periodTotalNet = 0n;
    let periodTotalGrowth = 0n;
    let periodTotalBalance = 0n;

    for (const instrument of instruments) {
      // Calculate gross needed: gross = net / (1 - taxRate)
      const grossNeededForRemainingNet = BigInt(
        Math.round(Number(remainingNetRequiredThisPeriod) / (1 - effectiveTaxRate))
      );

      const record: WithdrawalRecord = calculateAmortizedWithdrawal(
        instrument,
        currentInstrumentBalances[instrument.id],
        grossNeededForRemainingNet,
        period,
        effectiveTaxRate,
        accrueBeforeWithdrawal
      );

      withdrawalSchedules[instrument.id].amortizationSchedule.push(record);
      withdrawalSchedules[instrument.id].lifetimeWithdrawal += record.withdrawal;
      withdrawalSchedules[instrument.id].lifetimeGrowth += record.growth;

      currentInstrumentBalances[instrument.id] = record.currentBalance;
      remainingNetRequiredThisPeriod -= record.netAmount;
      if (remainingNetRequiredThisPeriod < 0n) remainingNetRequiredThisPeriod = 0n;

      periodTotalWithdrawal += record.withdrawal;
      periodTotalNet += record.netAmount;
      periodTotalGrowth += record.growth;
      periodTotalBalance += record.currentBalance;
    }

    totalAmortizationSchedule.push({
      period: currentPeriod,
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
