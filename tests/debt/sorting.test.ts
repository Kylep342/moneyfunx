import { describe, expect, it } from 'vitest';

import { Loan } from '../../src/lib/debt/loan';
import * as sorting from '../../src/lib/shared/sorting';

const Loans = (): Loan[] => [
  new Loan(7500, 0.068, 12, 10, 'uno'),
  new Loan(4500, 0.0429, 12, 10, 'dos'),
  new Loan(7500, 0.0368, 12, 10, 'tres'),
];

describe('sorting module', () => {
  const loans = Loans();
  const [loan2, loan3, loan1] = loans;

  it('avalanche compares loans correctly', async () => {
    expect(sorting.avalanche(loan2, loan1)).toBeCloseTo(-0.031200, 5);
    expect(sorting.avalanche(loan3, loan1)).toBeCloseTo(-0.006100, 5);
  });

  it('snowball compares loans correctly', async () => {
    expect(sorting.snowball(loan2, loan3)).toBe(3000);
    expect(sorting.snowball(loan2, loan1)).toBe(0);
  });

  it('orders loans correctly using avalanche sorting', async () => {
    expect(sorting.sortWith(loans, sorting.avalanche)).toStrictEqual([
      loan2,
      loan3,
      loan1,
    ]);
  });

  it('orders loans correctly using snowball sorting', async () => {
    expect(sorting.sortWith(loans, sorting.snowball)).toStrictEqual([
      loan3,
      loan2,
      loan1,
    ]);
  });
});
