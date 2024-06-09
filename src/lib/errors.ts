export class NegativeBalanceError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, NegativeBalanceError.prototype);
    this.name = 'NegativeBalanceError';
  }
}

export class PaymentTooLowError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, PaymentTooLowError.prototype);
    this.name = 'PaymentTooLowError';
  }
}
