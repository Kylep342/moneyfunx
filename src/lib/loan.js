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

/**
 * Calculates the minimum payment to pay the principal back in the number of periods at the periodic rate
 *
 * balance = principal + interest
 *
 * @param {number} principal The amount borrowed
 * @param {number} periodicRate The rate the balance accrues interest at per period
 * @param {number [int]} periods The number of periods the principal is repaid over
 * @returns {number} The minimum payment
 */
export function calculateMinPayment(principal, periodicRate, periods) {
    return periodicRate > 0 ?
        principal * (
            (
                periodicRate * (1 + periodicRate) ** periods
            ) / (
                (1 + periodicRate) ** periods - 1
            )
        ) :
        principal / periods;
}

/**
 * Calculates the principal remaining after a certain number of payments from a beginning principal at a periodic rate
 *
 * balance = principal + interest
 *
 * @param {number} principal The amount borrowed
 * @param {number} payment The amount paid at each period
 * @param {number} periodicRate The rate the balance accrues interest at per period
 * @param {number [int]} periods The number of periods paid to compute the desired principal remaining
 * @returns  {number} The remaining principal
 */
export function principalRemaining(principal, payment, periodicRate, periods) {
    return Math.max(
        (principal * (1 + periodicRate) ** periods) - (
            payment * (
                ((1 + periodicRate) ** periods - 1) / (periodicRate)
            )
        ),
        0
    );
}

/**
 * Calculates the number of payments required to pay off a principal
 *
 * balance = principal + interest
 *
 * @param {number} principal The amount borrowed
 * @param {number} payment The amount paid at each period
 * @param {number} periodicRate The rate the balance accrues interest at per period
 * @returns The number of payments needed to pay off the principal
 */
export function numPaymentsToZero(principal, payment, periodicRate) {
    return Math.ceil(
        Math.log(
            (payment / (payment - principal * periodicRate))
        ) / Math.log(periodicRate + 1)
    );
}

/**
 * Represents a financial loan
*/
export class Loan {
    /**
     * @constructor
     * @param {number} principal The amount borrowed
     * @param {number} annualRate The yearly rate the loan accrues interest at
     * @param {number} periodsPerYear The number of times the interest is accrued in a year
     * @param {number} termInYears The number of years the loan is repaid over
     */
    constructor(principal, annualRate, periodsPerYear, termInYears) {
        this.id = String(Math.floor(Math.random() * Date.now()));
        this.principal = principal;
        this.annualRate = annualRate;
        this.periodsPerYear = periodsPerYear;
        this.termInYears = termInYears;
        this.periodicRate = this.annualRate / this.periodsPerYear;
        this.periods = this.periodsPerYear * this.termInYears;
        this.minPayment = this.calculateMinPayment();
        this.totalInterest = (this.minPayment * (this.periods)) - this.principal;
    }

    /**
     * Verifies a payment amount is valid
     * Throws a PaymentTooLowError if the payment amount is less than the loan's minimum payment
     *
     * @param {number} payment The amount to pay the loan with
     * @returns {number} The validated payment amount
     */
    validatePayment(payment = this.minPayment) {
        if (payment < this.minPayment) {
            throw new errors.PaymentTooLowError(`payment of ${payment} cannot be less than ${this.minPayment}`);
        } else {
            return payment;
        }
    }

    /**
     * Calculates the minimum payment to pay off the loan in the required number of periods
     * @returns {number} The minimum amount to pay off the loan in the required number of periods
     */
    calculateMinPayment() {
        return calculateMinPayment(this.principal, this.periodicRate, this.periods);
    }

    /**
     * Calculates the amount of interest accrued in a period on a provided balance
     * @param {number} balance The amunt of money owed on a loan
     * @returns {number} The amount of interest accrued in one period
     */
    accrueInterest(balance = this.principal) {
        return balance * this.periodicRate;
    }

    /**
     * Calculates the number of payments needed to pay off a balance at a provided payemnt amount
     * @param {number} payment The amount to pay the loan with
     * @param {number} balance The amout of money owed on a loan
     * @returns {number} The number of payments neede to pay the loan off
     */
    numPaymentsToZero(payment = this.minPayment, balance = this.principal) {
        payment = this.validatePayment(payment);
        return numPaymentsToZero(
            balance,
            payment,
            this.periodicRate
        );
    }

    /**
     * Calculates the amout of pricipal remaining after paying a starting balance with a payment for a number of periods
     * @param {number} periods The number of payemnts to make
     * @param {number} payment The amount to pay the loan with
     * @param {number} balance The amount of money owed on a loan
     * @returns {number} The share of the amount borrowed left to pay
     */
    principalRemaining(periods, payment = this.minPayment, balance = this.principal) {
        payment = this.validatePayment(payment);
        return periods < this.numPaymentsToZero(payment, balance) ?
            principalRemaining(
                balance,
                payment,
                this.periodicRate,
                periods
            ) :
            0;
    }

    /**
     * Calculates the amount of interest paid after paying a starting balance with a payment for a number of periods
     * @param {number} periods The number of payments to make
     * @param {number} payment The amount to pay the loan with
     * @param {number} balance The amount of money owed on a loan
     * @returns The total amount of interest paid
     */
    interestPaid(periods, payment = this.minPayment, balance = this.principal) {
        payment = this.validatePayment(payment);
        return periods < this.numPaymentsToZero(payment, balance) ?
            (payment * periods) - (balance - this.principalRemaining(periods, payment, balance)) :
            Math.max(
                payment * (this.numPaymentsToZero(payment, balance) - 1) - (
                    balance - this.principalRemaining(
                        this.numPaymentsToZero(payment) - 1,
                        payment,
                        balance
                    )
                ) + (
                    this.accrueInterest(
                        this.principalRemaining(
                            this.numPaymentsToZero(payment) - 1,
                            payment,
                            balance
                        )
                    )
                ),
                0
            );
    }
}
