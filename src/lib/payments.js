/**
 *
 * This file contains functions for computing detailed information on paying loans
 *
 */

import * as loanLib from "./loan";
import * as utils from "./utils";

/**
 *
 * Calculates the extra amount in a payment after all loans' minimum payments are met
 * Throws an exception if the payment provided is less than the collective minimum payments for all loans
 *
 * @param {Array<Loan>} loans The loans to allocate minimum payments
 * @param {number} payment The amount to pay across all loans
 * @returns {number} The extra amount of payment
 */
export function determineExtraPayment (loans, payment) {
    const totalMinPayment = loans.reduce(
        (previousValue, currentValue) => previousValue + currentValue.minPayment,
        0
    );
    if (totalMinPayment > payment) {
        throw `Payment amount of ${payment} must be greater than ${totalMinPayment}`;
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
export function amortizePayments (loan, payment, numPayments, startPeriod) {
    payment = loan.validatePayment(payment);
    let amortizationSchedule = [];
    for (
        let period=0;
        period<numPayments;
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
 * @param {number} payment THe total amount of money budgeted to pay all loans each period
 * @returns {LoansPaymentSummary} Various totals and series of data regarding paying off the loans at the payment amount
 */
export function payLoans (loans, payment, totals=false) {
    let paymentData = {};
    loans.map(
        (loan) => {
            paymentData[loan.id] = {lifetimeInterest: 0, amortizationSchedule: []};
        }
    );

    let periodsElapsed = 0;
    let paidLoans = 0;
    let totalInterest = 0;

    while (paidLoans < loans.length) {
        let extraPaymentAmount = determineExtraPayment(loans.slice(paidLoans), payment);
        let firstLoan = loans.slice(paidLoans)[0];
        let firstLoanPayment = firstLoan.minPayment + extraPaymentAmount;
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
        paymentData[firstLoan.id].lifetimeInterest += firstLoanInterestPaid;
        paymentData[firstLoan.id].amortizationSchedule = [
            ...paymentData[firstLoan.id].amortizationSchedule,
            ...amortizePayments(firstLoan, firstLoanPayment, periodsToPay, periodsElapsed)
        ];
        paidLoans += 1;
        totalInterest += paymentData[firstLoan.id].lifetimeInterest;
        loans.slice(paidLoans).map((loan) => {
            paymentData[loan.id].lifetimeInterest += loan.interestPaid(
                periodsToPay,
                loan.minPayment,
                loan.principalRemaining(periodsElapsed)
            );
            paymentData[loan.id].amortizationSchedule = [
                ...paymentData[loan.id].amortizationSchedule,
                ...amortizePayments(loan, loan.minPayment, periodsToPay, periodsElapsed)
            ];
        });
        periodsElapsed += periodsToPay;
    }

    //
    if (totals) {
        // let periods = Array(periodsElapsed).fill(0);
        let totalPrincipal = Array(periodsElapsed).fill(0);
        let totalInterest = Array(periodsElapsed).fill(0);
        let totalPrincipalRemaining = Array(periodsElapsed).fill(0);

        for (const loan of loans) {
            totalPrincipal = utils.addVector(
                totalPrincipal,
                [...paymentData[loan.id].amortizationSchedule.principal]
            );
            totalInterest = utils.addVector(
                totalInterest,
                [...paymentData[loan.id].amortizationSchedule.interest]
            );
            totalPrincipalRemaining = utils.addVector(
                totalPrincipalRemaining,
                [...paymentData[loan.id].amortizationSchedule.principalRemaining]
            );
        }

        paymentData["totals"] = {
            lifetimeInterest: totalInterest,
            amortizationSchedule: [],
        };

        for (let period of periodsElapsed) {
            paymentData["totals"].amortizationSchedule.push(
                {
                    principal: totalPrincipal[period],
                    interest: totalInterest[period],
                    principalRemaining: totalPrincipalRemaining[period]
                }
            );
        }
    }

    paymentData["totalInterest"] = totalInterest;
    paymentData["totalPayments"] = periodsElapsed;
    // TODO: construct a schedule for total values
    return paymentData;
}
