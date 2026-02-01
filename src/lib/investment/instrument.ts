/**
 * Represents a financial instrument for investments and drawdowns.
 */

import * as errorClasses from '@/lib/errors';
import { HasRateAndBalance } from '@/lib/shared/sorting';
import * as primitives from '@/lib/shared/primitives';

export interface IInstrument extends HasRateAndBalance {
  id: string;
  name: string;
  currentBalance: number;
  annualRate: number;
  periodsPerYear: number;
  periodicRate: number;
  annualLimit: number;
}

export class Instrument implements IInstrument {
  id: string;
  name: string;
  currentBalance: number;
  annualRate: number;
  periodsPerYear: number;
  periodicRate: number;
  annualLimit: number;

  /**
   * @constructor
   * @param {number} currentBalance - Initial balance of the instrument.
   * @param {number} annualRate - The yearly expected return or interest rate.
   * @param {number} periodsPerYear - Number of accrual periods per year.
   * @param {string} name - Name of the investment instrument.
   * @param {number} [annualLimit=0] - Maximum allowable contribution per year.
   */
  constructor(
    currentBalance: number,
    annualRate: number,
    periodsPerYear: number,
    name: string,
    annualLimit: number = 0,
  ) {
    this.id = String(Math.floor(Math.random() * Date.now()));
    this.name = name;
    this.currentBalance = currentBalance;
    this.annualRate = annualRate;
    this.periodsPerYear = periodsPerYear;
    this.periodicRate = this.annualRate / this.periodsPerYear;
    this.annualLimit = annualLimit;
  }

  /**
   * Validates a contribution against limits and negative values.
   * * @param {number} contributionAmount - Amount to contribute.
   * @param {number} yearToDateContribution - Current contributions for the calendar year.
   * @throws {errorClasses.NegativeContributionError} If contribution is less than zero.
   * @returns {number} The allowed contribution amount.
   */
  validateContribution(contributionAmount: number, yearToDateContribution: number): number {
    if (contributionAmount < 0) {
      throw new errorClasses.NegativeContributionError(
        `contribution of ${contributionAmount} must be greater than/equal to zero`
      );
    }

    if (this.annualLimit > 0) {
      const remainingAnnualCapacity: number = Math.max(this.annualLimit - yearToDateContribution, 0);
      return Math.min(
        remainingAnnualCapacity,
        contributionAmount,
        this.periodicContribution()
      );
    }

    return contributionAmount;
  }

  /**
   * Determines the number of periods remaining until the balance reaches zero during drawdown.
   * * @param {number} periodicWithdrawalAmount - The amount withdrawn each period.
   * @param {number} [targetBalance=this.currentBalance] - The balance to draw from.
   * @returns {number} Number of periods to depletion.
   */
  numWithdrawalsToZero(
    periodicWithdrawalAmount: number,
    targetBalance: number = this.currentBalance
  ): number {
    return primitives.calculatePeriodsToZero(
      targetBalance,
      periodicWithdrawalAmount,
      this.periodicRate
    );
  }

  /**
   * Calculates the maximum sustainable periodic withdrawal for a set duration.
   * * @param {number} totalDurationInPeriods - The number of periods the balance must last.
   * @param {number} [targetBalance=this.currentBalance] - The starting balance.
   * @returns {number} The calculated periodic withdrawal amount.
   */
  calculateMaxWithdrawal(
    totalDurationInPeriods: number,
    targetBalance: number = this.currentBalance
  ): number {
    return primitives.calculatePeriodicAmount(
      targetBalance,
      this.periodicRate,
      totalDurationInPeriods
    );
  }

  /**
   * Helper to calculate the maximum periodic contribution allowed by the annual limit.
   * * @returns {number} The amortized periodic limit.
   */
  periodicContribution(): number {
    return this.annualLimit > 0 ? this.annualLimit / this.periodsPerYear : 0;
  }

  /**
   * Calculates the growth/interest accrued in one period.
   * * @param {number} [targetBalance=this.currentBalance] - The balance to calculate growth on.
   * @returns {number} The growth amount.
   */
  accrueInterest(targetBalance: number = this.currentBalance): number {
    return targetBalance * this.periodicRate;
  }
}
