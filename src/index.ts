export { NegativeBalanceError, PaymentTooLowError } from './lib/errors';
export {
  calculateMinPayment,
  numPaymentsToZero,
  principalRemaining,
  interestPaid,
} from './lib/helperFunctions';
export { type ILoan, Loan } from './lib/loan';
export {
  determineExtraPayment,
  amortizePayments,
  payLoans,
} from './lib/payments';
export {
  type AmortizationRecord,
  type LoansPaymentSummary,
  type PaymentSummary,
} from './lib/paymentTypes';
export { snowball, avalanche, sortLoans } from './lib/sorting';
export { TOTALS } from './lib/constants';
