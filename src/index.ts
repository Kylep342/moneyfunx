export { PaymentTooLowError } from "./lib/errors";
export {
  calculateMinPayment,
  numPaymentsToZero,
  principalRemaining,
} from "./lib/helperFunctions";
export { ILoan, Loan } from "./lib/loan";
export {
  determineExtraPayment,
  amortizePayments,
  payLoans,
} from "./lib/payments";
export {
  AmortizationRecord,
  LoansPaymentSummary,
  PaymentSummary,
} from "./lib/paymentTypes";
export { snowball, avalanche, sortLoans } from "./lib/sorting";
