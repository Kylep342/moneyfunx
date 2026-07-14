/**
 * Represents a financial loan and provides methods for amortization and
 * interest calculations using pure BigInt math.
 */

import * as errors from '../errors.js';
import * as primitives from '../shared/primitives.js';
import { HasRateAndBalance } from '../shared/sorting.js';

export interface ILoan extends HasRateAndBalance {
  id: string;
  name: string;
  principal: bigint;
  annualRate: bigint | primitives.RateSchedule;
  periodsPerYear: number;
  termInYears: number;
  periodicRate: number; // Returns initial rate / periodsPerYear as float (for backward compatibility / info)
  periods: number;
  minPayment: bigint;
  currentBalance: bigint;
  fees: bigint;
  getPeriodicRate(period: number, balance?: bigint): bigint;
}

export class Loan implements ILoan {
  id: string;
  name: string;
  principal: bigint;
  annualRate: bigint | primitives.RateSchedule;
  periodsPerYear: number;
  termInYears: number;
  periods: number;
  minPayment: bigint;
  currentBalance: bigint;
  fees: bigint;

  get periodicRate(): number {
    const rate = this.getPeriodicRate(1, this.principal);
    // Convert rate to float for info/compatibility
    return Number(rate) / 1_000_000 / this.periodsPerYear;
  }

  /**
   * @constructor
   * @param {bigint} principal - The initial amount borrowed (in cents).
   * @param {bigint | primitives.RateSchedule} annualRate - The yearly interest rate (scaled by 10^6) or schedule function.
   * @param {number} periodsPerYear - Frequency of interest accrual per year.
   * @param {number} termInYears - Total lifespan of the loan in years.
   * @param {string} name - Identifying name for the loan.
   * @param {bigint} [currentBalance] - The current outstanding balance (in cents).
   * @param {bigint} [fees] - Any applicable loan fees (in cents).
   */
  constructor(
    principal: bigint,
    annualRate: bigint | primitives.RateSchedule,
    periodsPerYear: number,
    termInYears: number,
    name: string,
    currentBalance: bigint = principal,
    fees: bigint = 0n,
  ) {
    this.id = String(Math.floor(Math.random() * Date.now()));
    this.name = name;
    this.principal = principal;
    this.annualRate = annualRate;
    this.periodsPerYear = periodsPerYear;
    this.termInYears = termInYears;
    this.periods = this.periodsPerYear * this.termInYears;
    this.currentBalance = currentBalance;
    this.fees = fees;
    this.minPayment = this.calculateMinPayment();
  }

  /**
   * Evaluates the periodic interest rate at a specific period index.
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
   * Validates that a payment amount meets the minimum requirement.
   *
   * @param {bigint} paymentAmount - The amount intended to be paid.
   * @throws {errors.PaymentTooLowError} If the payment is less than the minimum.
   * @returns {bigint} The validated payment amount.
   */
  validatePayment(paymentAmount: bigint = this.minPayment): bigint {
    if (this.minPayment > paymentAmount) {
      throw new errors.PaymentTooLowError(
        `payment of ${paymentAmount} cannot be less than ${this.minPayment}`
      );
    }
    return paymentAmount;
  }

  /**
   * Calculates the minimum payment required to amortize the loan over its term using binary search.
   * 
   * @returns {bigint} The minimum periodic payment.
   */
  calculateMinPayment(): bigint {
    const initialRate = this.getPeriodicRate(1, this.principal);
    const startBalance = this.principal + this.fees;
    if (initialRate === 0n) {
      return primitives.divideRound(startBalance, BigInt(this.periods));
    }

    let low = 0n;
    let high = startBalance;
    let result = startBalance;

    for (let iter = 0; iter < 50; iter++) {
      const mid = (low + high) / 2n;
      let balance = startBalance;
      for (let p = 0; p < this.periods; p++) {
        const rate = this.getPeriodicRate(p + 1, balance);
        const interest = primitives.divideRound(balance * rate, 1_000_000n * BigInt(this.periodsPerYear));
        const principalPaid = (balance + interest <= mid) ? balance : (mid - interest);
        balance = balance - principalPaid;
      }
      if (balance <= 0n) {
        high = mid;
        result = mid;
      } else {
        low = mid + 1n;
      }
    }
    return result;
  }

  /**
   * Calculates interest accrued on a specific balance for one period.
   *
   * @param {bigint} [targetBalance=this.currentBalance] - The balance to accrue interest on.
   * @param {number} [period=1] - The current elapsed period index.
   * @returns {bigint} The interest accrued.
   */
  accrueInterest(targetBalance: bigint = this.currentBalance, period: number = 1): bigint {
    const rate = this.getPeriodicRate(period, targetBalance);
    return primitives.divideRound(targetBalance * rate, 1_000_000n * BigInt(this.periodsPerYear));
  }

  /**
   * Determines the number of periods remaining until the loan reaches a zero balance.
   *
   * @param {primitives.PaymentScheduleInput} [paymentAmount=this.minPayment] - Periodic payment amount or generator.
   * @param {bigint} [targetBalance=this.currentBalance] - Balance to calculate against.
   * @param {number} [startPeriod=0] - The starting period offset.
   * @returns {number} Number of periods to zero.
   */
  numPaymentsToZero(
    paymentAmount: primitives.PaymentScheduleInput = this.minPayment,
    targetBalance: bigint = this.currentBalance,
    startPeriod: number = 0,
  ): number {
    if (typeof paymentAmount === 'bigint') {
      this.validatePayment(paymentAmount);
    }
    const paymentStream = primitives.getPaymentStream(paymentAmount, this.minPayment)();
    let balance = targetBalance;
    let period = 0;
    while (balance > 0n && period < 1200) {
      const interest = this.accrueInterest(balance, startPeriod + period + 1);
      const nextPay = paymentStream.next({ period: startPeriod + period + 1, balance });
      const payVal = nextPay.done ? 0n : nextPay.value;
      const principalPaid = (balance + interest <= payVal) ? balance : (payVal - interest);
      balance = balance - principalPaid;
      period++;
    }
    return period;
  }

  /**
   * Calculates the balance remaining after a set number of periods.
   *
   * @param {number} periodsElapsed - Number of periods that have passed.
   * @param {primitives.PaymentScheduleInput} [paymentAmount=this.minPayment] - Periodic payment amount or generator.
   * @param {bigint} [targetBalance=this.currentBalance] - Starting balance.
   * @param {number} [startPeriod=0] - The starting period offset.
   * @returns {bigint} The remaining principal balance.
   */
  principalRemaining(
    periodsElapsed: number,
    paymentAmount: primitives.PaymentScheduleInput = this.minPayment,
    targetBalance: bigint = this.currentBalance,
    startPeriod: number = 0
  ): bigint {
    if (typeof paymentAmount === 'bigint') {
      this.validatePayment(paymentAmount);
    }
    const paymentStream = primitives.getPaymentStream(paymentAmount, this.minPayment)();
    let balance = targetBalance;
    for (let period = 0; period < periodsElapsed; period++) {
      if (balance <= 0n) return 0n;
      const interest = this.accrueInterest(balance, startPeriod + period + 1);
      const nextPay = paymentStream.next({ period: startPeriod + period + 1, balance });
      const payVal = nextPay.done ? 0n : nextPay.value;
      const principalPaid = (balance + interest <= payVal) ? balance : (payVal - interest);
      balance = balance - principalPaid;
    }
    return balance;
  }

  /**
   * Calculates the total interest paid over a specified number of periods.
   *
   * @param {number} periodsElapsed - Number of periods paid.
   * @param {primitives.PaymentScheduleInput} [paymentAmount=this.minPayment] - Periodic payment amount or generator.
   * @param {bigint} [targetBalance=this.currentBalance] - Starting balance.
   * @param {number} [startPeriod=0] - The starting period offset.
   * @returns {bigint} Total interest paid.
   */
  interestPaid(
    periodsElapsed: number,
    paymentAmount: primitives.PaymentScheduleInput = this.minPayment,
    targetBalance: bigint = this.currentBalance,
    startPeriod: number = 0
  ): bigint {
    if (typeof paymentAmount === 'bigint') {
      this.validatePayment(paymentAmount);
    }
    const paymentStream = primitives.getPaymentStream(paymentAmount, this.minPayment)();
    let balance = targetBalance;
    let totalInterest = 0n;
    for (let period = 0; period < periodsElapsed; period++) {
      if (balance <= 0n) break;
      const interest = this.accrueInterest(balance, startPeriod + period + 1);
      totalInterest += interest;
      const nextPay = paymentStream.next({ period: startPeriod + period + 1, balance });
      const payVal = nextPay.done ? 0n : nextPay.value;
      const principalPaid = (balance + interest <= payVal) ? balance : (payVal - interest);
      balance = balance - principalPaid;
    }
    return totalInterest;
  }
}
