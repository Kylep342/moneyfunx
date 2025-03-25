import * as errors from "../errors";
import { HasRateAndBalance } from '../shared/sorting';

export interface IInstrument {
  id: string;
  name: string;
  currentBalance: number;
  annualRate: number;
  periodsPerYear: number;
  periodicRate: number;
  annualLimit: number;
}

export class Instrument implements
  IInstrument,
  HasRateAndBalance
{
  id: string;
  name: string;
  currentBalance: number;
  annualRate: number;
  periodsPerYear: number;
  periodicRate: number;
  annualLimit: number;

  /**
   *
   * @constructor
   * @param {number} currentBalance The current balance of the instrument
   * @param {Function} annualRate  The yearly rate the instrument accrues interest at (simplest case is a closure returning a constant)
   * @param {number} periodsPerYear The number of times the interest accrues in a year
   * @param {string} name The name for the instrument
   * @param {Function} annualLimit (Optional) The maximum amount of money contributable to the instrument in a single year (simplest case is a closure returning a constant)
   * @returns {Instrument}
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
    this.periodicRate =  this.annualRate / this.periodsPerYear;
    this.annualLimit = annualLimit;
  }

  /**
   *
   * @param {number} contribution The amount to contribute to the instrument
   * @param {number} yearToDate The total amount contributed year-to-date on the instrument
   * @throws {errors.NegativeContributionError} Throws an error when the contribution is less than zero
   * @returns {number} The validated contribution amount
   */
  validateContribution(contribution: number, yearToDate: number): number {
    if (contribution < 0) {
      throw new errors.NegativeContributionError(
        `contribution of ${contribution} must be greater than/equal to zero`
      );
    }
    if (this.annualLimit) {
      return Math.min(
        Math.max(this.annualLimit - yearToDate, 0),
        contribution,
      );
    }
    return contribution;
  }

  /**
   * Helper to calculate the periodic contribution for an instrument
   * If the instrument does not have an annual limit, returns 0
   *
   * @returns {number} the amortized "max" contribution for a period
   */
  periodicContribution(): number {
    if (this.annualLimit) {
      return this.annualLimit / this.periodsPerYear;
    }
    return 0;
  }

  /**
   *
   * Calculates the amount of interest accrued in a period on a provided principal
   * @param {number} principal The amunt of money owed on an instrument
   * @returns {number} The amount of interest accrued in one period
   */
  accrueInterest(principal: number = this.currentBalance): number {
    return principal * this.periodicRate;
  }
}
