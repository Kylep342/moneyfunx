// src/index
export { TOTALS } from './lib/constants';
export { PaymentTooLowError } from './lib/errors';
export {
  calculateMinPayment,
  numPaymentsToZero,
  principalRemaining,
  interestPaid,
} from './lib/helperFunctions';
export { ILoan, Loan } from './lib/loan';
export {
  determineExtraPayment,
  amortizePayments,
  payLoans,
} from './lib/payments';
export {
  AmortizationRecord,
  LoansPaymentSchedule,
  LoanPrincipals,
  PaymentSchedule,
} from './lib/paymentTypes';
export { snowball, avalanche, sortLoans } from './lib/sorting';
