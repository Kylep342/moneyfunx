/*

*****************
*** MoneyFunx ***
*****************

This library contains functions used to in personal financial analysis

*/

// export function amortize (principal, annualRate, periodsPerYear, years) {
function amortize (principal, periodRate, periods) {
    return principal * (
        (
            periodRate * (1 + periodRate) ** periods
        ) / (
            (1 + periodRate) ** periods - 1
        )
    );
}

// export function principalRemaining (principal, payment, periodRate, periods) {
function principalRemaining (principal, payment, periodRate, periods) {
    return (
        (principal * (1 + periodRate) ** periods) - (
            payment * (
                ((1 + periodRate) ** periods - 1) / (periodRate)
            )
        )
    );
}

class Loan {
    constructor (principal, annualRate, periodsPerYear, term, pmt=null) {
        this.principal = principal;
        this.annualRate = annualRate;
        this.periodsPerYear = periodsPerYear;
        this.term = term;
        this.periodRate = this.annualRate  / this.periodsPerYear;
        this.periods = this.periodsPerYear * this.term;
        this.minPmt = this.amortize(this.principal, this.periodRate, this.periods);
        this.totalInterest = (this.minPmt * (this.periodsPerYear * this.term)) - this.principal;
        this.pmt = this.validatePayment(this.minPmt, pmt);
    }

    validatePayment(minPmt, pmt=null) {
        if (pmt === null) {
            return minPmt
        } else if (pmt < minPmt) {
            throw `pmt cannot be less than ${minPmt}`
        } else {
            return pmt
        }
    }

    amortize() {
        return amortize(this.principal, this.periodRate, this.periods);
    }

    principalRemaining(periods) {
        return principalRemaining(this.principal, this.pmt, this.periodRate, periods);
    }

    interestPaid(periods) {
        return (this.pmt * periods) - (this.principal - principalRemaining(this.principal, this.pmt, this.periodRate, periods))
    }
}
