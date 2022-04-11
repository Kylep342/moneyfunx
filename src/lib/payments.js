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
                principalRemaining: loan.principalRemaining(
                    period + 1,
                    payment,
                    loan.principalRemaining(startPeriod)
                )
            }
        );
    }
    return amortizationSchedule;
}

export function payLoans (loans, payment) {
    let loanInterestTotals = {};
    loans.map(
        (loan) => {
            loanInterestTotals[loan.id] = {lifetimeInterest: 0, amortizationSchedule: []};
        }
    );

    let periodsElapsed = 0;
    let paidLoans = 0;

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
        loanInterestTotals[firstLoan.id].lifetimeInterest += firstLoanInterestPaid;
        loanInterestTotals[firstLoan.id].amortizationSchedule = [
            ...loanInterestTotals[firstLoan.id].amortizationSchedule,
            ...amortizePayments(firstLoan, firstLoanPayment, periodsToPay, periodsElapsed)
        ];
        paidLoans += 1;
        loans.slice(paidLoans).map((loan) => {
            loanInterestTotals[loan.id].lifetimeInterest += loan.interestPaid(
                periodsToPay,
                loan.minPayment,
                loan.principalRemaining(periodsElapsed)
            );
            loanInterestTotals[loan.id].amortizationSchedule = [
                ...loanInterestTotals[loan.id].amortizationSchedule,
                ...amortizePayments(loan, loan.minPayment, periodsToPay, periodsElapsed)
            ];
        });
        periodsElapsed += periodsToPay;
    }
    return loanInterestTotals;
}
