export class PaymentTooLowError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, PaymentTooLowError.prototype);
    this.name = 'PaymentTooLowError';
  }
}
