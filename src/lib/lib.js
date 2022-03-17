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
        this.minPmt = this.amortize();
        this.totalInterest = (this.minPmt * (this.periodsPerYear * this.term)) - this.principal;
        this.pmt = this.validatePayment(pmt);
    }

    validatePayment(pmt) {
        if (pmt === null) {
            return this.minPmt
        } else if (pmt < this.minPmt) {
            throw `pmt cannot be less than ${this.minPmt}`
        } else {
            return pmt
        }
    }

    amortize() {
        return amortize(this.principal, this.periodRate, this.periods);
    }

    principalRemaining(periods) {
        return periods < this.periods ?
            principalRemaining(this.principal, this.pmt, this.periodRate, periods) :
            0
    }

    interestPaid(periods) {
        return periods < this.periods ?
            (this.pmt * periods) - (this.principal - principalRemaining(this.principal, this.pmt, this.periodRate, periods)) :
            this.totalInterest
    }
}
