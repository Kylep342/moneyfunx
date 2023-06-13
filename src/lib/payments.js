/**
 *
 * This file contains functions for computing detailed information on paying loans
 *
 */

import * as errors from "./errors";
import * as loanLib from "./loan";

/**
 *
 * Calculates the extra amount in a payment after all loans' minimum payments are met
 * Throws an exception if the payment provided is less than the collective minimum payments for all loans
 *
 * @param {Array<Loan>} loans The loans to allocate minimum payments
 * @param {number} payment The amount to pay across all loans
 * @returns {number} The extra amount of payment
 */
export function determineExtraPayment(loans, payment) {
    const totalMinPayment = loans.reduce(
        (previousValue, currentValue) => previousValue + currentValue.minPayment,
        0
    );
    if (totalMinPayment > payment) {
        throw new errors.PaymentTooLowError(`Payment amount of ${payment} must be greater than ${totalMinPayment}`);
    }
    return payment - totalMinPayment;
}

/**
 *
 * Calculates the amortization schedule for a loan paid with a payment
 *
 * @param {Loan} loan The loan to amortize payments for
 * @param {number} payment The amount to pay to the loan's balance each period
 * @param {number} numPayments The number of periods to make payments to the loan
 * @param {number} startPeriod An initial offset of periods to "fast-forward" the state of the loan to prior to calculation of each period
 * @returns {Array<JSON[number, number, number, number]>} The amortization schdule for the number of payments of payment made to the loan from the provided start period
 */
export function amortizePayments(loan, payment = null, numPayments = null, startPeriod = 0) {
    if (payment === null) {
        payment = loan.minPayment;
    }
    payment = loan.validatePayment(payment);

    if (numPayments === null) {
        numPayments = loan.numPaymentsToZero(payment);
    }

    let amortizationSchedule = [];
    for (
        let period = 0;
        period < numPayments;
        period++
    ) {
        let interestThisPeriod = loan.accrueInterest(
            loan.principalRemaining(
                period,
                payment,
                loan.principalRemaining(startPeriod)
            )
        );
        let principalThisPeriod = Math.min(
            payment - interestThisPeriod,
            loan.principalRemaining(
                period,
                payment,
                loan.principalRemaining(startPeriod)
            )
        );
        let principalRemaining = loan.principalRemaining(
            period + 1,
            payment,
            loan.principalRemaining(startPeriod)
        );
        amortizationSchedule.push(
            {
                period: startPeriod + period + 1,
                principal: principalThisPeriod,
                interest: interestThisPeriod,
                principalRemaining: principalRemaining,
            }
        );
    }
    return amortizationSchedule;
}

/**
 *
 * Calculates a wealth of information about paying of a set of loans with a total payment amount
 *
 * @param {Array<Loans>} loans The loans to pay off
 * @param {number} payment The total amount of money budgeted to pay all loans each period
 * @param {boolean} reduceMinimum Flag to reduce the total payment amount by a loan's minimum when that loan is paid off
 * @returns {LoansPaymentSummary} Various totals and series of data regarding paying off the loans at the payment amount
 */
export function payLoans(loans, payment, reduceMinimum = false) {
    let monthlyPayment = payment;
    let paymentData = {};
    loans.map(
        (loan) => {
            paymentData[loan.id] = { lifetimeInterest: 0, amortizationSchedule: [] };
        }
    );


    let periodsElapsed = 0;
    let paidLoans = 0;
    let lifetimeInterest = 0;
    let totalAmortizationSchedule = [];

    while (paidLoans < loans.length) {
        let firstLoan = loans.slice(paidLoans)[0];
        let firstLoanPayment = firstLoan.minPayment + determineExtraPayment(loans.slice(paidLoans), monthlyPayment);
        let periodsToPay = loanLib.numPaymentsToZero(
            firstLoan.principalRemaining(
                periodsElapsed,
                firstLoan.minPayment
            ),
            firstLoanPayment,
            firstLoan.periodicRate
        );
        let firstLoanInterestPaid = firstLoan.interestPaid(
            periodsToPay,
            firstLoanPayment,
            firstLoan.principalRemaining(periodsElapsed)
        );
        let firstLoanPaidPeriods = amortizePayments(firstLoan, firstLoanPayment, periodsToPay, periodsElapsed);

        paymentData[firstLoan.id].lifetimeInterest += firstLoanInterestPaid;
        paymentData[firstLoan.id].amortizationSchedule = [
            ...paymentData[firstLoan.id].amortizationSchedule,
            ...firstLoanPaidPeriods
        ];

        totalAmortizationSchedule = [
            ...totalAmortizationSchedule,
            ...firstLoanPaidPeriods
        ];

        // the first loan is paid off, handle totals
        paidLoans += 1;
        lifetimeInterest += paymentData[firstLoan.id].lifetimeInterest;
        if (reduceMinimum) {
            monthlyPayment -= firstLoan.minPayment;
        }

        // handle calculating information for the rest of the loans
        loans.slice(paidLoans).map((loan) => {
            paymentData[loan.id].lifetimeInterest += loan.interestPaid(
                periodsToPay,
                loan.minPayment,
                loan.principalRemaining(periodsElapsed)
            );
            let paidPeriods = amortizePayments(loan, loan.minPayment, periodsToPay, periodsElapsed);
            paymentData[loan.id].amortizationSchedule = [
                ...paymentData[loan.id].amortizationSchedule,
                ...paidPeriods
            ];

            totalAmortizationSchedule = totalAmortizationSchedule.map((element) => {
                const matchedInnerElement = paidPeriods.find((innerElement) => innerElement.period === element.period);
                return matchedInnerElement ?
                    {
                        period: element.period,
                        principal: element.principal + matchedInnerElement.principal,
                        interest: element.interest + matchedInnerElement.interest,
                        principalRemaining: element.principalRemaining + matchedInnerElement.principalRemaining
                    } :
                    element;
            });
        });
        periodsElapsed += periodsToPay;
    }

    paymentData["totals"] = {
        lifetimeInterest: lifetimeInterest,
        amortizationSchedule: totalAmortizationSchedule
    };

    return paymentData;
}
