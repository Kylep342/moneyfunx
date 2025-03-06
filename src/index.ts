// src/index
export {
  MAX_DURATION_YEARS,
  TOTALS,
} from './lib/constants';
export { NegativeContributionError, PaymentTooLowError } from './lib/errors';
export {
  calculateMinPayment,
  numPaymentsToZero,
  principalRemaining,
  interestPaid,
} from './lib/helperFunctions';
export { IInstrument, Instrument } from './lib/investment/instrument';
export {
  AmortizationRecord as ContributionAmortizationRecord,
  ContributionSchedule,
  InstrumentBalances,
  InstrumentsContributionSchedule,
} from './lib/investment/contributionTypes';
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
