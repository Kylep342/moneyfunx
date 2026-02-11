/**
 * Represents a financial loan and provides methods for amortization and
 * interest calculations.
 */

import * as errors from '../errors.js';
import * as primitives from '../shared/primitives.js';
import { HasRateAndBalance } from '../shared/sorting.js';

export interface ILoan extends HasRateAndBalance {
  id: string;
  name: string;
  principal: number;
  annualRate: number;
  periodsPerYear: number;
  termInYears: number;
  periodicRate: number;
  periods: number;
  minPayment: number;
  currentBalance: number;
  fees: number;
}

export class Loan implements ILoan {
  id: string;
  name: string;
  principal: number;
  annualRate: number;
  periodsPerYear: number;
  termInYears: number;
  periodicRate: number;
  periods: number;
  minPayment: number;
  currentBalance: number;
  fees: number;

  /**
   * @constructor
   * @param {number} principal - The initial amount borrowed.
   * @param {number} annualRate - The yearly interest rate (decimal).
   * @param {number} periodsPerYear - Frequency of interest accrual per year.
   * @param {number} termInYears - Total lifespan of the loan in years.
   * @param {string} name - Identifying name for the loan.
   * @param {number} [currentBalance] - The current outstanding balance.
   * @param {number} [fees] - Any applicable loan fees.
   */
  constructor(
    principal: number,
    annualRate: number,
    periodsPerYear: number,
    termInYears: number,
    name: string,
    currentBalance: number = principal,
    fees: number = 0,
  ) {
    this.id = String(Math.floor(Math.random() * Date.now()));
    this.name = name;
    this.principal = principal;
    this.annualRate = annualRate;
    this.periodsPerYear = periodsPerYear;
    this.termInYears = termInYears;
    this.periodicRate = this.annualRate / this.periodsPerYear;
    this.periods = this.periodsPerYear * this.termInYears;
    this.minPayment = this.calculateMinPayment();
    this.currentBalance = currentBalance;
    this.fees = fees;
  }

  /**
   * Validates that a payment amount meets the minimum requirement.
   *
   * @param {number} paymentAmount - The amount intended to be paid.
   * @throws {errors.PaymentTooLowError} If the payment is less than the minimum.
   * @returns {number} The validated payment amount.
   */
  validatePayment(paymentAmount: number = this.minPayment): number {
    const normalizedMinimum: number = parseInt((100 * this.minPayment).toFixed());
    const normalizedPayment: number = parseInt((100 * paymentAmount).toFixed());

    if (normalizedMinimum > normalizedPayment) {
      throw new errors.PaymentTooLowError(
        `payment of ${paymentAmount} cannot be less than ${this.minPayment}`
      );
    }
    return paymentAmount;
  }

  /**
   * Calculates the minimum payment required to amortize the loan over its term.
   * * @returns {number} The minimum periodic payment.
   */
  calculateMinPayment(): number {
    return primitives.calculatePeriodicAmount(
      this.principal,
      this.periodicRate,
      this.periods
    );
  }

  /**
   * Calculates interest accrued on a specific balance for one period.
   *
   * @param {number} [targetBalance=this.currentBalance] - The balance to accrue interest on.
   * @returns {number} The interest accrued.
   */
  accrueInterest(targetBalance: number = this.currentBalance): number {
    return targetBalance * this.periodicRate;
  }

  /**
   * Determines the number of periods remaining until the loan reaches a zero balance.
   *
   * @param {number} [paymentAmount=this.minPayment] - Periodic payment amount.
   * @param {number} [targetBalance=this.currentBalance] - Balance to calculate against.
   * @returns {number} Number of periods to zero.
   */
  numPaymentsToZero(
    paymentAmount: number = this.minPayment,
    targetBalance: number = this.currentBalance,
  ): number {
    this.validatePayment(paymentAmount);
    return primitives.calculatePeriodsToZero(
      targetBalance,
      paymentAmount,
      this.periodicRate
    );
  }

  /**
   * Calculates the balance remaining after a set number of periods.
   *
   * @param {number} periodsElapsed - Number of periods that have passed.
   * @param {number} [paymentAmount=this.minPayment] - Periodic payment amount.
   * @param {number} [targetBalance=this.currentBalance] - Starting balance.
   * @returns {number} The remaining principal balance.
   */
  principalRemaining(
    periodsElapsed: number,
    paymentAmount: number = this.minPayment,
    targetBalance: number = this.currentBalance
  ): number {
    this.validatePayment(paymentAmount);
    const periodsToZero: number = this.numPaymentsToZero(paymentAmount, targetBalance);

    return periodsElapsed < periodsToZero
      ? primitives.calculateBalanceRemaining(
          targetBalance,
          paymentAmount,
          this.periodicRate,
          periodsElapsed
        )
      : 0;
  }

  /**
   * Calculates the total interest paid over a specified number of periods.
   *
   * @param {number} periodsElapsed - Number of periods paid.
   * @param {number} [paymentAmount=this.minPayment] - Periodic payment amount.
   * @param {number} [targetBalance=this.currentBalance] - Starting balance.
   * @returns {number} Total interest paid.
   */
  interestPaid(
    periodsElapsed: number,
    paymentAmount: number = this.minPayment,
    targetBalance: number = this.currentBalance
  ): number {
    this.validatePayment(paymentAmount);
    const totalPeriodsToZero: number = this.numPaymentsToZero(paymentAmount, targetBalance);

    if (periodsElapsed < totalPeriodsToZero) {
      return primitives.calculateInterestOverPeriods(
        targetBalance,
        paymentAmount,
        this.periodicRate,
        periodsElapsed
      );
    }

    const lastFullPeriod: number = totalPeriodsToZero - 1;
    const finalInterestAccrual: number = this.accrueInterest(
      this.principalRemaining(lastFullPeriod, paymentAmount, targetBalance)
    );

    return primitives.calculateInterestOverPeriods(
      targetBalance,
      paymentAmount,
      this.periodicRate,
      lastFullPeriod
    ) + finalInterestAccrual;
  }
}
