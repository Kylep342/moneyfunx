/*

*/

//
function determineExtraPayment (loans, payment) {
    const totalMinPayment = loans.reduce(
            (previousValue, currentValue) => previousValue + currentValue.minPayment,
            0
        );
    if (totalMinPayment > payment) {
        throw `Payment amount must be greater than ${totalMinPayment}`;
    }
    return payment - totalMinPayment;
}

//
function amortizePayments (loan, payment=null, startPeriod=0) {
    //TODO: clean up
    let amortizationSchedule = [];
    for (
        period=0;
        period<loan.numPaymentsToZero(
            payment=payment,
            balance=loan.principalRemaining(startPeriod)
        );
        period++
    ) {
        interestThisPeriod = loan.interestPaid(
            periods=(startPeriod + period + 1),
            payment=payment
        ) - loan.interestPaid(
            periods=startPeriod + period,
            payment=payment
        );
        principalThisPeriod = (payment ? payment : loan.minPayment) - interestThisPeriod;
        amortizationSchedule.push(
            {
                "period": startPeriod + period + 1,
                "principal": principalThisPeriod,
                "interest": interestThisPeriod,
                "principalRemaining": loan.principalRemaining(
                    periods=startPeriod + period + 1,
                    payment=payment,
                    balance=loan.principalRemaining(startPeriod)
                )
            }
        );
    }
    return amortizationSchedule;
}

//
function payLoans (loans, payment) {
    let loanInterestTotals = {};
    loans.map(
        (loan) => {
            loanInterestTotals[loan.id] = {lifetimeInterest: 0, amortizationSchedule: []}
        }
    );

    let periodsElapsed = 0;
    let paidLoans = 0;

    // TODO, fix the payment of the loan in the slice block
    while (paidLoans < loans.length) {
        let extraPaymentAmount = determineExtraPayment(loans.slice(paidLoans), payment);
        let firstLoan = loans.slice(paidLoans)[0];
        let firstLoanPayment = firstLoan.minPayment + extraPaymentAmount;
        let periodsToPay = numPaymentsToZero(
            firstLoan.principalRemaining(
                periodsElapsed,
                firstLoan.minPayment
            ),
            firstLoanPayment,
            firstLoan.periodicRate
        );
        let firstLoanInterestPaid = firstLoan.interestPaid(periodsToPay, firstLoanPayment);
        loanInterestTotals[firstLoan.id].lifetimeInterest += firstLoanInterestPaid;
        loanInterestTotals[firstLoan.id].amortizationSchedule = [
            ...loanInterestTotals[firstLoan.id].amortizationSchedule,
            ...amortizePayments(firstLoan, firstLoanPayment)
        ];
        periodsElapsed += periodsToPay;
        paidLoans += 1;
        loans.slice(paidLoans).map((loan) => {
            loanInterestTotals[loan.id].lifetimeInterest += loan.interestPaid(periodsToPay, loan.minPayment);
            loanInterestTotals[loan.id].amortizationSchedule = [
                ...loanInterestTotals[loan.id].amortizationSchedule,
                ...amortizePayments(loan)
            ]
        });
    }
    return loanInterestTotals;
}
