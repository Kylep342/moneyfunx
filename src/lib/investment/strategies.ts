/**
 * This file contains high-level drawdown strategies for investment portfolios using pure BigInt math.
 */

import { Instrument } from '../investment/instrument.js';
import { calculateAmortizedWithdrawal } from '../investment/withdrawals.js';
import * as primitives from '../shared/primitives.js';
import type {
  InstrumentsWithdrawalSchedule,
  WithdrawalRecord
} from '../investment/withdrawalTypes.js';
import { TOTALS } from '../constants.js';

/**
 * Executes a 'Waterfall' drawdown strategy.
 * Funds are pulled from instruments in the order they appear in the array.
 * The next instrument is only touched if the previous one cannot fulfill the
 * remaining target net income.
 *
 * @param {Instrument[]} financialInstruments - Ordered list of accounts (e.g., Taxable -> Tax-Deferred).
 * @param {primitives.PaymentScheduleInput} targetNetPeriodicIncome - The take-home cash required for the period or generator (in cents).
 * @param {number} totalPeriodsToSimulate - Duration of the simulation.
 * @param {number} [effectiveTaxRate=0] - The tax rate used to gross up withdrawals (as float).
 * @returns {InstrumentsWithdrawalSchedule} The full simulation results.
 */
export function performWaterfallDrawdown(
  financialInstruments: Instrument[],
  targetNetPeriodicIncome: primitives.PaymentScheduleInput,
  totalPeriodsToSimulate: number,
  effectiveTaxRate: number = 0
): InstrumentsWithdrawalSchedule {
  const withdrawalSchedules = {} as InstrumentsWithdrawalSchedule;
  const instrumentBalances: Record<string, bigint> = {};
  const incomeStream = primitives.getPaymentStream(targetNetPeriodicIncome, 0n)();

  let totalLifetimeWithdrawal = 0n;
  let totalLifetimeGrowth = 0n;
  const totalAmortizationSchedule: WithdrawalRecord[] = [];

  // Setup initial state
  financialInstruments.forEach((instrument) => {
    withdrawalSchedules[instrument.id] = {
      lifetimeGrowth: 0n,
      lifetimeWithdrawal: 0n,
      amortizationSchedule: [],
    };
    instrumentBalances[instrument.id] = instrument.currentBalance;
  });

  for (let period = 0; period < totalPeriodsToSimulate; period++) {
    const currentPeriod = period + 1;
    const nextIncome = incomeStream.next({ period: currentPeriod, balance: 0n });
    let remainingNetRequiredThisPeriod = nextIncome.done ? 0n : nextIncome.value;
    let periodTotalWithdrawal = 0n;
    let periodTotalNet = 0n;
    let periodTotalGrowth = 0n;
    let periodTotalBalance = 0n;

    for (const instrument of financialInstruments) {
      const grossNeededForNet = BigInt(
        Math.round(Number(remainingNetRequiredThisPeriod) / (1 - effectiveTaxRate))
      );

      const record: WithdrawalRecord = calculateAmortizedWithdrawal(
        instrument,
        instrumentBalances[instrument.id],
        grossNeededForNet,
        period,
        effectiveTaxRate
      );

      withdrawalSchedules[instrument.id].amortizationSchedule.push(record);
      withdrawalSchedules[instrument.id].lifetimeWithdrawal += record.withdrawal;
      withdrawalSchedules[instrument.id].lifetimeGrowth += record.growth;

      instrumentBalances[instrument.id] = record.currentBalance;
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
