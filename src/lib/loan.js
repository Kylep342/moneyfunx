/*

*****************
*** MoneyFunx ***
*****************

mek it funx up

This library contains functions used to in personal financial analysis

*/

// export function calculateMinPayment (principal, annualRate, periods) {
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
export class Loan {
    constructor (principal, annualRate, periodsPerYear, termInYears) {
        this.id = String(Math.floor(Math.random() * Date.now()));
        this.principal = principal;
        this.annualRate = annualRate;
        this.periodsPerYear = periodsPerYear;
        this.termInYears = termInYears;
        this.periodicRate = this.annualRate / this.periodsPerYear;
        this.periods = this.periodsPerYear * this.termInYears;
        this.minPayment = this.calculateMinPayment();
        this.totalInterest = (this.minPayment * (this.periods)) - this.principal;
    }

    validatePayment(payment=this.minPayment) {
        if (payment < this.minPayment) {
            throw `payment of ${payment} cannot be less than ${this.minPayment}`;
        } else {
            return payment;
        }
    }

    calculateMinPayment() {
        return calculateMinPayment(this.principal, this.periodicRate, this.periods);
    }

    accrueInterest(balance=this.principal) {
        // TODO: figure out if this is valid
        // UPDATE: 24-3-2022 this is valid AF
        return balance * this.periodicRate;
    }

    numPaymentsToZero(payment=this.minPayment, balance=this.principal) {
        payment = this.validatePayment(payment);
        return numPaymentsToZero(
            balance,
            payment,
            this.periodicRate
        );
    }

    principalRemaining(periods, payment=this.minPayment, balance=this.principal) {
        payment = this.validatePayment(payment);
        return periods < this.numPaymentsToZero(payment, balance) ?
            principalRemaining(
                balance,
                payment,
                this.periodicRate,
                periods
            ) :
            0;
    }

    interestPaid(periods, payment=this.minPayment, balance=this.principal) {
        // TODO: Fix this
        // 18-3-2022: Need to compute interest for the final payment and add it to the ternary
        payment = this.validatePayment(payment);
        return periods < this.numPaymentsToZero(payment, balance) ?
            (payment * periods) - (balance - this.principalRemaining(periods, payment, balance)) :
            Math.max(
                payment * (this.numPaymentsToZero(payment, balance) - 1) - (
                    balance - this.principalRemaining(
                        this.numPaymentsToZero(payment) - 1,
                        payment,
                        balance
                    )
                ),
                0
            );
    }
}
