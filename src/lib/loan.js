/*

*****************
*** MoneyFunx ***
*****************

This library contains functions used to in personal financial analysis

*/

// export function calculateMinPayment (principal, annualRate, periodsPerYear, years) {
function calculateMinPayment (principal, periodicRate, periods) {
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

// export function principalRemaining (principal, payment, periodicRate, periods) {
function principalRemaining (principal, payment, periodicRate, periods) {
    return Math.max(
        (principal * (1 + periodicRate) ** periods) - (
            payment * (
                ((1 + periodicRate) ** periods - 1) / (periodicRate)
            )
        ),
        0
    );
}

// export function numPaymentsToZero (principal, payment, periodicRate) {
function numPaymentsToZero (principal, payment, periodicRate) {
    return Math.ceil(
        Math.log(
            (payment / (payment - principal * periodicRate))
        ) / Math.log(periodicRate + 1)
    );
}

//
class Loan {
    constructor (principal, annualRate, periodsPerYear, termInYears, periods=null, minPayment=null, id=null) {
        this.id = id ? id : String(Math.floor(Math.random() * Date.now()));
        this.principal = principal;
        this.annualRate = annualRate;
        this.periodsPerYear = periodsPerYear;
        this.termInYears = termInYears;
        this.periodicRate = this.annualRate / this.periodsPerYear;
        this.periods = periods ? periods : this.periodsPerYear * this.termInYears;
        this.minPayment = minPayment ? minPayment : this.calculateMinPayment();
        this.totalInterest = (this.minPayment * (this.periods)) - this.principal;
    }

    validatePayment(payment) {
        if (payment === null) {
            return this.minPayment;
        } else if (payment < this.minPayment) {
            throw `payment cannot be less than ${this.minPayment}`;
        } else {
            return payment;
        }
    }

    calculateMinPayment() {
        return calculateMinPayment(this.principal, this.periodicRate, this.periods);
    }

    principalRemaining(periods, payment=null) {
        try {
            payment = this.validatePayment(payment);
        } catch(err) {
            throw `payment cannot be less than ${this.minPayment}`;
        }
        return periods < numPaymentsToZero(this.principal, payment, this.periodicRate) ?
            principalRemaining(this.principal, payment, this.periodicRate, periods) :
            0;
    }

    //TODO: incorporate a period offset to compute interest paid from any given period
    //as opposed to just from the beginning of the loan
    interestPaid(periods, payment=null) {
        // TODO: Fix this
        // 18-3-2022: Need to compute interest for the final payment and add it to the ternary
        try {
            payment = this.validatePayment(payment);
        } catch(err) {
            throw `payment cannot be less than ${this.minPayment}`;
        }
        return periods < numPaymentsToZero(this.principal, payment, this.periodicRate) ?
            (payment * periods) - (this.principal - this.principalRemaining(periods, payment)) :
            (
                payment * (
                    numPaymentsToZero(this.principal, payment, this.periodicRate) - 1
                ) - (
                    this.principal - this.principalRemaining(
                        numPaymentsToZero(this.principal, payment, this.periodicRate) - 1
                        , payment
                    )
                )
            );
    }
}
