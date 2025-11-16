export class PaymentTooLowError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, PaymentTooLowError.prototype);
    this.name = 'PaymentTooLowError';
  }
}

export class NegativeContributionError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, NegativeContributionError.prototype);
    this.name = 'NegativeContributionError';
  }
}
