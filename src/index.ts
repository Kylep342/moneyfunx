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
import { TOTALS } from './lib/constants';

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
  TOTALS,
};

export { ILoan } from './lib/loan'

export default moneyfunx;
