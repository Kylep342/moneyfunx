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

import * as errors from '../errors';
import * as helpers from './helperFunctions';

/**
 * Represents a financial loan
 */
export interface ILoan {
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
   * @param {number} principal The amount borrowed
   * @param {number} annualRate The yearly rate the loan accrues interest at
   * @param {number} periodsPerYear The number of times the interest accrues in a year
   * @param {number} termInYears The number of years the loan is repaid over
   * @param {number} name The name for the loan
   * @param {number} currentBalance (Optional) The current balance of the loan, if different from the principal
   * @param {number} fees (Optional) The fees on the loan
   * @returns {Loan}
   */
  constructor(
    principal: number,
    annualRate: number,
    periodsPerYear: number,
    termInYears: number,
    name: string,
    currentBalance?: number,
    fees?: number,
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
    this.currentBalance = currentBalance || principal;
    this.fees = fees || 0;
  }

  /**
   * Verifies a payment amount is valid
   * Throws a PaymentTooLowError if the payment amount is less than the loan's minimum payment
   *
   * @param {number} payment The amount to pay the loan with
   * @throws {errors.PaymentTooLowError} Throws an error when the payment to a Loan is less than the Loan's minimum payment
   * @returns {number} The validated payment amount
   */
  validatePayment(payment: number = this.minPayment): number {
    if (parseInt((100 * this.minPayment).toFixed()) > parseInt((100 * payment).toFixed())) {
      throw new errors.PaymentTooLowError(
        `payment of ${payment} cannot be less than ${this.minPayment}`
      );
    }
    return payment;
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
   * Calculates the amount of interest accrued in a period on a provided principal
   * @param {number} principal The amunt of money owed on a loan
   * @returns {number} The amount of interest accrued in one period
   */
  accrueInterest(principal: number = this.currentBalance): number {
    return principal * this.periodicRate;
  }

  /**
   * Calculates the number of payments needed to pay off a principal at a provided payemnt amount
   * @param {number} payment The amount to pay the loan with
   * @param {number} principal The amout of money owed on a loan
   * @returns {number} The number of payments needed to pay the loan off
   */
  numPaymentsToZero(
    payment: number = this.minPayment,
    principal: number = this.currentBalance,
  ): number {
    this.validatePayment(payment);
    return helpers.numPaymentsToZero(principal, payment, this.periodicRate);
  }

  /**
   * Calculates the amout of pricipal remaining after paying a starting principal with a payment for a number of periods
   * @param {number} periods The number of payemnts to make
   * @param {number} payment The amount to pay the loan with
   * @param {number} principal The amount of money owed on a loan
   * @returns {number} The share of the amount borrowed left to pay
   */
  principalRemaining(
    periods: number,
    payment: number = this.minPayment,
    principal: number = this.currentBalance
  ): number {
    this.validatePayment(payment);
    return periods < this.numPaymentsToZero(payment, principal)
      ? helpers.principalRemaining(
        principal,
        payment,
        this.periodicRate,
        periods
      )
      : 0;
  }

  /**
   * Calculates the amount of interest paid after paying a starting principal with a payment for a number of periods
   * @param {number} periods The number of payments to make
   * @param {number} payment The amount to pay the loan with
   * @param {number} principal The amount of money owed on a loan
   * @returns The total amount of interest paid
   */
  interestPaid(
    periods: number,
    payment: number = this.minPayment,
    principal: number = this.currentBalance
  ): number {
    this.validatePayment(payment);
    const paymentsToZero = this.numPaymentsToZero(payment, principal);
    return periods < paymentsToZero
      ? helpers.interestPaid(principal, payment, this.periodicRate, periods)
      : helpers.interestPaid(
        principal,
        payment,
        this.periodicRate,
        paymentsToZero - 1
      ) +
      this.accrueInterest(
        this.principalRemaining(paymentsToZero - 1, payment, principal)
      );
  }
}
