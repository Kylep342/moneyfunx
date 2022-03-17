/*

*****************
*** MoneyFunx ***
*****************

This library contains functions used to in personal financial analysis

*/

// export function amortize (principal, annualRate, periodsPerYear, years) {
function amortize (principal, periodicRate, periods) {
    return principal * (
        (
            periodicRate * (1 + periodicRate) ** periods
        ) / (
            (1 + periodicRate) ** periods - 1
        )
    );
}

// export function principalRemaining (principal, payment, periodicRate, periods) {
function principalRemaining (principal, payment, periodicRate, periods) {
    return Math.max(
        (principal * (1 + periodicRate) ** periods) - (
            payment * (
                ((1 + periodicRate) ** periods - 1) / (periodicRate)
            )
        )
    , 0);
}

class Loan {
    constructor (principal, annualRate, periodsPerYear, term) {
        this.principal = principal;
        this.annualRate = annualRate;
        this.periodsPerYear = periodsPerYear;
        this.term = term;
        this.periodicRate = this.annualRate  / this.periodsPerYear;
        this.periods = this.periodsPerYear * this.term;
        this.minPayment = this.amortize();
        this.totalInterest = (this.minPayment * (this.periodsPerYear * this.term)) - this.principal;
    }

    validatePayment(payment) {
        if (payment === null) {
            return this.minPayment;
        } else if (payment < this.minPayment) {
            throw `payment cannot be less than ${this.minPayment}`;
        } else {
            return payment
        }
    }

    amortize() {
        return amortize(this.principal, this.periodicRate, this.periods);
    }

    principalRemaining(periods, payment=null) {
        try {
            payment = this.validatePayment(payment);
        } catch(err) {
            throw `payment cannot be less than ${this.minPayment}`;
        }
        return periods < this.periods ?
            principalRemaining(this.principal, payment, this.periodicRate, periods) :
            0;
    }

    interestPaid(periods, payment=null) {
        try {
            payment = this.validatePayment(payment)
        } catch(err) {
            throw `payment cannot be less than ${this.minPayment}`
        }
        return periods < this.periods ?
            (payment * periods) - (this.principal - this.principalRemaining(periods, payment)) :
            this.totalInterest;
    }
}
