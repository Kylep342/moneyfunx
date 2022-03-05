/*

*****************
*** MoneyFunx ***
*****************

This library contians funcitons used to in personal financial analysis

*/

exports.amortize = function (principal, annualRate, periodsPerYear, years) {
    return principal * (
        (
            (annualRate / periodsPerYear) * (1 + (annualRate / periodsPerYear)) ** (periodsPerYear * years)
        ) / (
            (1 + (annualRate / periodsPerYear)) ** (periodsPerYear * years) - 1
        )
    );
}
