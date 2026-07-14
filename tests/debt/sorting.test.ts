import { describe, expect, it } from 'vitest';

import { Loan } from '../../src/lib/debt/loan';
import * as sorting from '../../src/lib/shared/sorting';

const Loans = (): Loan[] => [
  new Loan(7500_00n, 68000n, 12, 10, 'uno'),
  new Loan(4500_00n, 42900n, 12, 10, 'dos'),
  new Loan(7500_00n, 36800n, 12, 10, 'tres'),
];

describe('sorting module', () => {
  const loans = Loans();
  const [loan1, loan2, loan3] = loans; // loan1 is 'uno', loan2 is 'dos', loan3 is 'tres'

  it('avalanche compares loans correctly', async () => {
    // Avalanche sorts descending by interest rate.
    // rate of loan2 ('dos', 4.29%) vs loan1 ('uno', 6.8%) -> diff = 68000 - 42900 > 0 -> returns 1
    expect(sorting.avalanche(loan2, loan1)).toBe(1);
    // rate of loan3 ('tres', 3.68%) vs loan1 ('uno', 6.8%) -> diff = 68000 - 36800 > 0 -> returns 1
    expect(sorting.avalanche(loan3, loan1)).toBe(1);
  });

  it('snowball compares loans correctly', async () => {
    // Snowball sorts ascending by current balance.
    // balance of loan2 (4500_00n) vs loan3 (7500_00n) -> diff = 4500 - 7500 < 0 -> returns -1
    expect(sorting.snowball(loan2, loan3)).toBe(-1);
    // balance of loan2 (4500_00n) vs loan1 (7500_00n) -> diff = 4500 - 7500 < 0 -> returns -1
    expect(sorting.snowball(loan2, loan1)).toBe(-1);
  });

  it('orders loans correctly using avalanche sorting', async () => {
    // Expected order: uno (6.8%), dos (4.29%), tres (3.68%)
    expect(sorting.sortWith([...loans], sorting.avalanche)).toStrictEqual([
      loan1,
      loan2,
      loan3,
    ]);
  });

  it('orders loans correctly using snowball sorting', async () => {
    // Expected order: dos (4500_00n), uno (7500_00n), tres (7500_00n)
    expect(sorting.sortWith([...loans], sorting.snowball)).toStrictEqual([
      loan2,
      loan1,
      loan3,
    ]);
  });
});
