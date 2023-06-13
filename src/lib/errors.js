export class PaymentTooLowError extends Error {
    constructor(message) {
        super(message);
        this.name = "PaymentTooLowError";
    }
}
