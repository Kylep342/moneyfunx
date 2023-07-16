/**
 *
 * *****************
 * *** MoneyFunx ***
 * *****************
 *
 * mek it funx up
 *
 * This library contains functions used to in personal financial analysis
 *
 */

import * as errors from "./errors";
import * as helpers from "./helperFunctions";

/**
 * Represents a financial loan
 */
export interface ILoan {
  id: string;
  principal: number;
  annualRate: number;
  periodsPerYear: number;
  termInYears: number;
  periodicRate: number;
  periods: number;
  minPayment: number;
  totalInterest: number;
}

export class Loan implements ILoan {
  id: string;
  principal: number;
  annualRate: number;
  periodsPerYear: number;
  termInYears: number;
  periodicRate: number;
  periods: number;
  minPayment: number;
  totalInterest: number;

  /**
   * @constructor
   * @param {number} principal The amount borrowed
   * @param {number} annualRate The yearly rate the loan accrues interest at
   * @param {number} periodsPerYear The number of times the interest is accrued in a year
   * @param {number} termInYears The number of years the loan is repaid over
   */
  constructor(
    principal: number,
    annualRate: number,
    periodsPerYear: number,
    termInYears: number
  ) {
    this.id = String(Math.floor(Math.random() * Date.now()));
    this.principal = principal;
    this.annualRate = annualRate;
    this.periodsPerYear = periodsPerYear;
    this.termInYears = termInYears;
    this.periodicRate = this.annualRate / this.periodsPerYear;
    this.periods = this.periodsPerYear * this.termInYears;
    this.minPayment = this.calculateMinPayment();
    this.totalInterest = this.minPayment * this.periods - this.principal;
  }

  /**
   * Verifies a payment amount is valid
   * Throws a PaymentTooLowError if the payment amount is less than the loan's minimum payment
   *
   * @param {number} payment The amount to pay the loan with
   * @returns {number} The validated payment amount
   */
  validatePayment(payment: number = this.minPayment): number {
    if (payment < this.minPayment) {
      throw new errors.PaymentTooLowError(
        `payment of ${payment} cannot be less than ${this.minPayment}`
      );
    } else {
      return payment;
    }
  }

  /**
   * Calculates the minimum payment to pay off the loan in the required number of periods
   * @returns {number} The minimum amount to pay off the loan in the required number of periods
   */
  calculateMinPayment(): number {
    return helpers.calculateMinPayment(
      this.principal,
      this.periodicRate,
      this.periods
    );
  }

  /**
   * Calculates the amount of interest accrued in a period on a provided balance
   * @param {number} balance The amunt of money owed on a loan
   * @returns {number} The amount of interest accrued in one period
   */
  accrueInterest(balance: number = this.principal): number {
    return balance * this.periodicRate;
  }

  /**
   * Calculates the number of payments needed to pay off a balance at a provided payemnt amount
   * @param {number} payment The amount to pay the loan with
   * @param {number} balance The amout of money owed on a loan
   * @returns {number} The number of payments neede to pay the loan off
   */
  numPaymentsToZero(
    payment: number = this.minPayment,
    balance: number = this.principal
  ): number {
    this.validatePayment(payment);
    return helpers.numPaymentsToZero(balance, payment, this.periodicRate);
  }

  /**
   * Calculates the amout of pricipal remaining after paying a starting balance with a payment for a number of periods
   * @param {number} periods The number of payemnts to make
   * @param {number} payment The amount to pay the loan with
   * @param {number} balance The amount of money owed on a loan
   * @returns {number} The share of the amount borrowed left to pay
   */
  principalRemaining(
    periods: number,
    payment: number = this.minPayment,
    balance: number = this.principal
  ): number {
    this.validatePayment(payment);
    return periods < this.numPaymentsToZero(payment, balance)
      ? helpers.principalRemaining(balance, payment, this.periodicRate, periods)
      : 0;
  }

  /**
   * Calculates the amount of interest paid after paying a starting balance with a payment for a number of periods
   * @param {number} periods The number of payments to make
   * @param {number} payment The amount to pay the loan with
   * @param {number} balance The amount of money owed on a loan
   * @returns The total amount of interest paid
   */
  interestPaid(
    periods: number,
    payment: number = this.minPayment,
    balance: number = this.principal
  ): number {
    this.validatePayment(payment);
    return periods < this.numPaymentsToZero(payment, balance)
      ? payment * periods -
          (balance - this.principalRemaining(periods, payment, balance))
      : Math.max(
          payment * (this.numPaymentsToZero(payment, balance) - 1) -
            (balance -
              this.principalRemaining(
                this.numPaymentsToZero(payment) - 1,
                payment,
                balance
              )) +
            this.accrueInterest(
              this.principalRemaining(
                this.numPaymentsToZero(payment) - 1,
                payment,
                balance
              )
            ),
          0
        );
  }
}