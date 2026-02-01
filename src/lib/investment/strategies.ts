/**
 * This file contains high-level drawdown strategies for investment portfolios.
 */

import { Instrument } from '@/lib/investment/instrument';
import { calculateAmortizedWithdrawal } from '@/lib/investment/withdrawals';
import {
  InstrumentsWithdrawalSchedule,
  WithdrawalRecord
} from '@/lib/investment/withdrawalTypes';
import { TOTALS } from '@/lib/constants';

/**
 * Executes a 'Waterfall' drawdown strategy.
 * Funds are pulled from instruments in the order they appear in the array.
 * The next instrument is only touched if the previous one cannot fulfill the
 * remaining target net income.
 * * @param {Instrument[]} financialInstruments - Ordered list of accounts (e.g., Taxable -> Tax-Deferred).
 * @param {number} targetNetPeriodicIncome - The take-home cash required for the period.
 * @param {number} totalPeriodsToSimulate - Duration of the simulation.
 * @param {number} [defaultTaxRate=0] - The tax rate used to gross up withdrawals.
 * @returns {InstrumentsWithdrawalSchedule} The full simulation results.
 */
export function performWaterfallDrawdown(
  financialInstruments: Instrument[],
  targetNetPeriodicIncome: number,
  totalPeriodsToSimulate: number,
  defaultTaxRate: number = 0
): InstrumentsWithdrawalSchedule {
  const withdrawalSchedules: any = {};
  const instrumentBalances: Record<string, number> = {};

  let totalLifetimeWithdrawal: number = 0;
  let totalLifetimeGrowth: number = 0;
  const totalAmortizationSchedule: WithdrawalRecord[] = [];

  // Setup initial state
  financialInstruments.forEach((instrument) => {
    withdrawalSchedules[instrument.id] = {
      lifetimeGrowth: 0,
      lifetimeWithdrawal: 0,
      amortizationSchedule: [],
    };
    instrumentBalances[instrument.id] = instrument.currentBalance;
  });

  for (let period: number = 0; period < totalPeriodsToSimulate; period++) {
    let remainingNetRequiredThisPeriod: number = targetNetPeriodicIncome;
    let periodTotalWithdrawal: number = 0;
    let periodTotalNet: number = 0;
    let periodTotalGrowth: number = 0;
    let periodTotalBalance: number = 0;

    for (const instrument of financialInstruments) {
      // Calculate how much gross we need to meet the remaining net
      const grossNeededForNet: number = remainingNetRequiredThisPeriod / (1 - defaultTaxRate);

      const record: WithdrawalRecord = calculateAmortizedWithdrawal(
        instrument,
        instrumentBalances[instrument.id],
        grossNeededForNet,
        period,
        defaultTaxRate
      );

      withdrawalSchedules[instrument.id].amortizationSchedule.push(record);
      withdrawalSchedules[instrument.id].lifetimeWithdrawal += record.withdrawal;
      withdrawalSchedules[instrument.id].lifetimeGrowth += record.growth;

      instrumentBalances[instrument.id] = record.currentBalance;
      remainingNetRequiredThisPeriod -= record.netAmount;

      // Period aggregates
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
