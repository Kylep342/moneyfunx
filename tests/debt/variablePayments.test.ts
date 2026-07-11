import { describe, it, expect } from 'vitest';
import { Loan, RateSchedule } from '../../src/lib/debt/loan.js';
import { amortizePayments } from '../../src/lib/debt/payments.js';

describe('Variable Rate and Ad-hoc Payments', () => {
  it('correctly calculates amortization for an ARM (variable rate)', () => {
    // 5% starting interest (50000n), increases by 0.5% (5000n) every 12 periods
    const armRate: RateSchedule = (period) => 50000n + BigInt(Math.floor((period - 1) / 12)) * 5000n;

    const loan = new Loan(1000000n, armRate, 12, 10, 'ARM Loan');

    // Run amortization for 24 months with $150.00 payment (15000n cents)
    const schedule = amortizePayments(loan, 1000000n, 15000n, 24);

    expect(schedule.length).toBe(24);

    // Period 1 interest should be based on 5%: 1000000n * 50000n / 12000000n = 4167n cents ($41.67)
    expect(schedule[0].interest).toBe(4167n);

    // Period 13 interest should be based on 5.5% on the remaining balance
    expect(schedule[12].interest).toBe(3974n); // $39.74
  });

  it('correctly calculates amortization with an ad-hoc payment generator', () => {
    const loan = new Loan(1000000n, 50000n, 12, 10, 'Flat Loan');

    // Generator that yields $150 normally, but $1,150 at period 6 (an extra $1,000 principal payment)
    function* customPaymentStream() {
      let period = 1;
      while (true) {
        if (period === 6) {
          yield 115000n;
        } else {
          yield 15000n;
        }
        period++;
      }
    }

    const schedule = amortizePayments(loan, 1000000n, customPaymentStream, 12);

    expect(schedule.length).toBe(12);

    expect(schedule[5].principal).toBe(111061n); // $1,110.61
    expect(schedule[5].principalRemaining).toBe(8343_20n); // $8,343.20
  });
});
