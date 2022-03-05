/*

*****************
*** MoneyFunx ***
*****************

This library contians funcitons used to in personal financial analysis

*/

exports.amortize = function (principal, annualRate, periodsPerYear, years) {
    const periodRate = annualRate / periodsPerYear;
    const numPayments = periodsPerYear * years;
    return principal * ((periodRate * (1 + periodRate) ** numPayments) / ((1 + periodRate) ** numPayments - 1))
}
