


export interface IInstrument {
  id: string;
  name: string;
  currentBalance: number;
  annualRate: Function;
  periodsPerYear: number;
  annualLimit: Function;
}

export class Instrument implements IInstrument {
  id: string;
  name: string;
  currentBalance: number;
  annualRate: Function;
  periodsPerYear: number;
  annualLimit: Function;
  
  /**
   * 
   * @constructor
   * @param currentBalance The current balance of the instrument
   * @param annualRate  The yearly rate the instrument accrues interest at
   * @param periodsPerYear The number of times the interest accrues in a year
   * @param name The name for the instrument
   * @param annualLimit (Optional) The maximum amount of money contributable to the instrument in a single year
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
    this.annualLimit = annualLimit || (() => 0);
  }

  validateContribution(contribution: number, ytd: number): number {
    if (this.annualLimit()) {
      return Math.min(
        Math.max(this.annualLimit() - ytd, 0),
        contribution,
      );
    }
    return contribution;
  }
}
