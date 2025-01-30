// src/index
import { PaymentTooLowError } from './lib/errors';
import {
  calculateMinPayment,
  numPaymentsToZero,
  principalRemaining,
  interestPaid,
} from './lib/helperFunctions';
import { Loan } from './lib/loan';
import {
  determineExtraPayment,
  amortizePayments,
  payLoans,
} from './lib/payments';
import { snowball, avalanche, sortLoans } from './lib/sorting';

export const moneyfunx = {
  amortizePayments,
  avalanche,
  calculateMinPayment,
  determineExtraPayment,
  interestPaid,
  Loan,
  numPaymentsToZero,
  payLoans,
  PaymentTooLowError,
  principalRemaining,
  snowball,
  sortLoans,
};

export { ILoan } from './lib/loan'
export { TOTALS } from './lib/constants';

export default moneyfunx;
