/*

*****************
*** MoneyFunx ***
*****************

This library contains functions used to in personal financial analysis

*/

export function amortize (principal, annualRate, periodsPerYear, years) {
    return principal * (
        (
            (annualRate / periodsPerYear) * (1 + (annualRate / periodsPerYear)) ** (periodsPerYear * years)
        ) / (
            (1 + (annualRate / periodsPerYear)) ** (periodsPerYear * years) - 1
        )
    );
}
