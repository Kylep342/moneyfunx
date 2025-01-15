import { test, expect } from '@jest/globals';
import * as loan from '../src/lib/loan.ts';

test('Loan has proper attributes', () => {
  const loan1 = new loan.Loan(7500, 0.068, 12, 10, 'Student Loan');
  const mortgage = new loan.Loan(150000, 0.0622, 12, 15, 'Mortgage', 75000, 1000);

  expect(loan1.periodicRate).toBe(0.005666666666666667);
  expect(loan1.periods).toBe(120);
  expect(loan1.minPayment).toBe(86.31024763658397);
  expect(loan1.name).toBe('Student Loan');
  expect(loan1.fees).toBe(0);

  expect(loan1.numPaymentsToZero()).toBe(120);
  expect(loan1.numPaymentsToZero(300)).toBe(28);
  expect(() => {
    loan1.numPaymentsToZero(30);
  }).toThrow('payment of 30 cannot be less than 86.31024763658397');

  expect(loan1.validatePayment(100)).toBe(100);
  expect(loan1.validatePayment()).toBe(86.31024763658397);
  expect(() => {
    loan1.validatePayment(20);
  }).toThrow('payment of 20 cannot be less than 86.31024763658397');
  expect(() => {
    loan1.validatePayment(-160);
  }).toThrow('payment of -160 cannot be less than 86.31024763658397');

  expect(loan1.principalRemaining(33)).toBe(5915.168870573016);
  expect(loan1.principalRemaining(0)).toBe(7500);
  expect(loan1.principalRemaining(8, 300)).toBe(5398.67699631769);
  expect(loan1.principalRemaining(40, 500)).toBe(0);
  expect(loan1.principalRemaining(3, 200, 3000)).toBe(2447.8831236666597);
  expect(() => {
    loan1.principalRemaining(21, 40, 9000);
  }).toThrow('payment of 40 cannot be less than 86.31024763658397');

  expect(loan1.interestPaid(0)).toBe(0);
  expect(loan1.interestPaid(22)).toBe(875.4263974363766);
  expect(loan1.interestPaid(8, 300)).toBe(298.6769963176903);
  expect(loan1.interestPaid(50, 300)).toBe(610.3609925683494);
  expect(() => {
    loan1.interestPaid(30, 10, 20000);
  }).toThrow('payment of 10 cannot be less than 86.31024763658397');

  expect(mortgage.periodicRate).toBe(0.005183333333333333);
  expect(mortgage.periods).toBe(180);
  expect(mortgage.minPayment).toBe(1283.6830056654117);
  expect(mortgage.name).toBe('Mortgage');
  expect(mortgage.fees).toBe(1000);

  expect(mortgage.numPaymentsToZero()).toBe(70);
  expect(mortgage.numPaymentsToZero(1500)).toBe(59);
  expect(() => {
    mortgage.numPaymentsToZero(300);
  }).toThrow('payment of 300 cannot be less than 1283.6830056654117');

  expect(mortgage.validatePayment(1300)).toBe(1300);
  expect(mortgage.validatePayment()).toBe(1283.6830056654117);
  expect(() => {
    mortgage.validatePayment(20);
  }).toThrow('payment of 20 cannot be less than 1283.6830056654117');
  expect(() => {
    mortgage.validatePayment(-160);
  }).toThrow('payment of -160 cannot be less than 1283.6830056654117');

  expect(mortgage.principalRemaining(33)).toBe(42881.51656374325);
  expect(mortgage.principalRemaining(0)).toBe(75000);
  expect(mortgage.principalRemaining(8, 1300)).toBe(67576.36730982608);
  expect(mortgage.principalRemaining(60, 1500)).toBe(0);
  expect(mortgage.principalRemaining(3, 1300, 4000)).toBe(142.27303334689395);
  expect(() => {
    mortgage.principalRemaining(21, 40, 9000);
  }).toThrow('payment of 40 cannot be less than 1283.6830056654117');

  expect(mortgage.interestPaid(0)).toBe(0);
  expect(mortgage.interestPaid(22)).toBe(7442.995104981193);
  expect(mortgage.interestPaid(8, 1300)).toBe(2976.367309826077);
  expect(mortgage.interestPaid(50, 1300)).toBe(13140.910180952385);
  expect(mortgage.interestPaid(59)).toBe(14157.60959553707);
  expect(() => {
    mortgage.interestPaid(30, 10, 20000);
  }).toThrow('payment of 10 cannot be less than 1283.6830056654117');
});
