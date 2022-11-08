/*

*/
import * as loanLib from "./loan";

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

export function amortizePayments (loan, payment, numPayments, startPeriod) {
    payment = loan.validatePayment(payment);
    let amortizationSchedule = [];
    for (
        let period=0;
        period<numPayments;
        period++
    ) {
        let principalRemaining = loan.principalRemaining(
            period + 1,
            payment,
            loan.principalRemaining(startPeriod)
        );
        if (principalRemaining === 0) {
            break;
        }
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

export function payLoans (loans, payment) {
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
    paymentData["totalInterest"] = totalInterest;
    paymentData["totalPayments"] = periodsElapsed;
    return paymentData;
}
