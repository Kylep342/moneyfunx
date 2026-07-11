/**
 * Represents a financial instrument for investments and drawdowns using pure BigInt math.
 */

import * as errors from '../errors.js';
import { HasRateAndBalance } from '../shared/sorting.js';
import * as primitives from '../shared/primitives.js';

export interface IInstrument extends HasRateAndBalance {
  id: string;
  name: string;
  currentBalance: bigint;
  annualRate: bigint | primitives.RateSchedule;
  periodsPerYear: number;
  periodicRate: number; // Returns float for backward compatibility / info
  annualLimit: bigint;
  getPeriodicRate(period: number, balance?: bigint): bigint;
}

export class Instrument implements IInstrument {
  id: string;
  name: string;
  currentBalance: bigint;
  annualRate: bigint | primitives.RateSchedule;
  periodsPerYear: number;
  annualLimit: bigint;

  get periodicRate(): number {
    const rate = this.getPeriodicRate(1, this.currentBalance);
    return Number(rate) / 1_000_000 / this.periodsPerYear;
  }

  /**
   * @constructor
   * @param {bigint} currentBalance - Initial balance of the instrument (in cents).
   * @param {bigint | primitives.RateSchedule} annualRate - The yearly interest/growth rate (scaled by 10^6) or schedule function.
   * @param {number} periodsPerYear - Number of accrual periods per year.
   * @param {string} name - Name of the investment instrument.
   * @param {bigint} [annualLimit=0n] - Maximum allowable contribution per year (in cents).
   */
  constructor(
    currentBalance: bigint,
    annualRate: bigint | primitives.RateSchedule,
    periodsPerYear: number,
    name: string,
    annualLimit: bigint = 0n,
  ) {
    this.id = String(Math.floor(Math.random() * Date.now()));
    this.name = name;
    this.currentBalance = currentBalance;
    this.annualRate = annualRate;
    this.periodsPerYear = periodsPerYear;
    this.annualLimit = annualLimit;
  }

  /**
   * Evaluates the periodic return or interest rate at a specific period index.
   *
   * @param {number} period - The elapsed period index (1-based).
   * @param {bigint} [balance=this.currentBalance] - The balance at that period.
   * @returns {bigint} The periodic rate (scaled by 10^6).
   */
  getPeriodicRate(period: number, balance: bigint = this.currentBalance): bigint {
    return typeof this.annualRate === 'function'
      ? this.annualRate(period, balance)
      : this.annualRate;
  }

  /**
   * Validates a contribution against limits and negative values.
   *
   * @param {bigint} contribution - Amount to contribute (in cents).
   * @param {bigint} yearToDateContribution - Current contributions for the calendar year (in cents).
   * @throws {errors.NegativeContributionError} If contribution is less than zero.
   * @returns {bigint} The allowed contribution amount (in cents).
   */
  validateContribution(contribution: bigint, yearToDateContribution: bigint): bigint {
    if (contribution < 0n) {
      throw new errors.NegativeContributionError(
         `contribution of ${contribution} must be greater than/equal to zero`
      );
    }

    if (this.annualLimit > 0n) {
      const remainingAnnualCapacity: bigint = this.annualLimit > yearToDateContribution
        ? this.annualLimit - yearToDateContribution
        : 0n;
      let allowed = remainingAnnualCapacity;
      if (contribution < allowed) allowed = contribution;
      const periodLimit = this.periodicContribution();
      if (periodLimit < allowed) allowed = periodLimit;
      return allowed;
    }

    return contribution;
  }

  /**
   * Determines the number of periods remaining until the balance reaches zero during drawdown.
   *
   * @param {bigint} periodicWithdrawalAmount - The amount withdrawn each period (in cents).
   * @param {bigint} [targetBalance=this.currentBalance] - The balance to draw from (in cents).
   * @param {number} [startPeriod=0] - The starting period offset.
   * @returns {number} Number of periods to depletion.
   */
  numWithdrawalsToZero(
    periodicWithdrawalAmount: bigint,
    targetBalance: bigint = this.currentBalance,
    startPeriod: number = 0
  ): number {
    let balance = targetBalance;
    let period = 0;
    while (balance > 0n && period < 1200) {
      const growth = this.accrueInterest(balance, startPeriod + period + 1);
      balance = balance + growth - periodicWithdrawalAmount;
      period++;
    }
    return period;
  }

  /**
   * Calculates the maximum sustainable periodic withdrawal for a set duration.
   *
   * @param {number} totalDurationInPeriods - The number of periods the balance must last.
   * @param {bigint} [targetBalance=this.currentBalance] - The starting balance (in cents).
   * @param {number} [startPeriod=0] - The starting period offset.
   * @returns {bigint} The calculated periodic withdrawal amount (in cents).
   */
  calculateMaxWithdrawal(
    totalDurationInPeriods: number,
    targetBalance: bigint = this.currentBalance,
    startPeriod: number = 0
  ): bigint {
    let low = 0n;
    let high = targetBalance * 2n;
    let result = 0n;

    for (let iter = 0; iter < 50; iter++) {
      const mid = (low + high) / 2n;
      let balance = targetBalance;
      for (let p = 0; p < totalDurationInPeriods; p++) {
        const growth = this.accrueInterest(balance, startPeriod + p + 1);
        balance = balance + growth - mid;
      }
      if (balance > 0n) {
        low = mid + 1n;
        result = mid;
      } else {
        high = mid;
      }
    }
    return result;
  }

  /**
   * Helper to calculate the maximum periodic contribution allowed by the annual limit.
   *
   * @returns {bigint} The amortized periodic limit (in cents).
   */
  periodicContribution(): bigint {
    return this.annualLimit > 0n ? primitives.divideRound(this.annualLimit, BigInt(this.periodsPerYear)) : 0n;
  }

  /**
   * Calculates the growth/interest accrued in one period.
   *
   * @param {bigint} [targetBalance=this.currentBalance] - The balance to calculate growth on (in cents).
   * @param {number} [period=1] - The current elapsed period index.
   * @returns {bigint} The growth amount (in cents).
   */
  accrueInterest(targetBalance: bigint = this.currentBalance, period: number = 1): bigint {
    return primitives.divideRound(targetBalance * this.getPeriodicRate(period, targetBalance), 1_000_000n * BigInt(this.periodsPerYear));
  }
}
