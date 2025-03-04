import * as errors from "./errors";

export interface IInstrument {
  id: string;
  name: string;
  currentBalance: number;
  annualRate: Function;
  periodsPerYear: number;
  periodicRate: Function;
  annualLimit: Function;
}

export class Instrument implements IInstrument {
  id: string;
  name: string;
  currentBalance: number;
  annualRate: Function;
  periodsPerYear: number;
  periodicRate: Function;
  annualLimit: Function;

  /**
   *
   * @constructor
   * @param {number} currentBalance The current balance of the instrument
   * @param {Function} annualRate  The yearly rate the instrument accrues interest at (simplest case is a closure returning a constant)
   * @param {number} periodsPerYear The number of times the interest accrues in a year
   * @param {string} name The name for the instrument
   * @param {Function} annualLimit (Optional) The maximum amount of money contributable to the instrument in a single year (simplest case is a closure returning a constant)
   */
  constructor(
    currentBalance: number,
    annualRate: Function,
    periodsPerYear: number,
    name: string,
    annualLimit?: Function,
  ) {
    this.id = String(Math.floor(Math.random() * Date.now()));
    this.name = name;
    this.currentBalance = currentBalance;
    this.annualRate = annualRate;
    this.periodsPerYear = periodsPerYear;
    this.periodicRate = (): number => annualRate() / this.periodsPerYear;
    this.annualLimit = annualLimit || (() => 0);
  }

  /**
   *
   * @param contribution The amount to contribute to the instrument
   * @param ytd The total amount contributed Year-To-Date on the instrument
   * @throws {errors.NegativeContributionError} Throws an error when the contribution is less than zero
   * @returns The validated contribution amount
   */
  validateContribution(contribution: number, ytd: number): number {
    if (contribution < 0) {
      throw new errors.NegativeContributionError(
        `contribution of ${contribution} must be greater than/equal to zero`
      );
    }
    if (this.annualLimit()) {
      return Math.min(
        Math.max(this.annualLimit() - ytd, 0),
        contribution,
      );
    }
    return contribution;
  }

  /**
   *
   * Calculates the amount of interest accrued in a period on a provided principal
   * @param {number} principal The amunt of money owed on an instrument
   * @returns {number} The amount of interest accrued in one period
   */
  accrueInterest(principal: number = this.currentBalance): number {
    return principal * this.periodicRate();
  }
}
