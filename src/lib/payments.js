import * as loanTools from './loan';
import * as sortingTools from './sorting';


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



// scratch area
const paymentBudget = 400;

let loanInterestTotals = [];
let loanInterestTotals2 = {};

// turbodeer
loans.map(
    (loan) => {
        loanInterestTotals3[loan.id] = {lifetimeInterest: 0}
    }
);

while (loans.length) {
    let extraPaymentAmount = determineExtraPayment(loans, paymentBudget);
    let firstLoan = loans[0];
    let firstLoanPayment = firstLoan.minPayment + extraPaymentAmount;
    // let periodsToPay = loanTools.numPaymentsToZero(firstLoan.principal, firstLoanPayment, firstLoan.periodicRate);
    let periodsToPay = numPaymentsToZero(firstLoan.principal, firstLoanPayment, firstLoan.periodicRate);
    console.log(`Loan ${firstLoan.id} is paid off in ${periodsToPay} months at $${firstLoanPayment} per month`)
    let firstLoanInterestPaid = firstLoan.interestPaid(periodsToPay, firstLoanPayment);
    loanInterestTotals3[firstLoan.id].lifetimeInterest += firstLoanInterestPaid;
    loans = loans.slice(1)
    if (loans.length) {
        loans.map((loan) => {
            // TODO: rollover excess payment in the final installemnt of the main loan to the next loan
            loanInterestTotals3[loan.id].lifetimeInterest += loan.interestPaid(periodsToPay, loan.minPayment);
        })
    }
}
