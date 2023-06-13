export {
    PaymentTooLowError
} from "./lib/errors";
export {
    calculateMinPayment,
    principalRemaining,
    numPaymentsToZero,
    Loan
} from "./lib/loan";
export {
    determineExtraPayment,
    amortizePayments,
    payLoans
} from "./lib/payments";
export {
    snowball,
    avalanche,
    sortLoans
} from "./lib/sorting";
