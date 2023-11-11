import { expect, test } from "@jest/globals";
import * as loan from "../src/lib/loan.ts";
import * as sorting from "../src/lib/sorting.ts";

test("Loans sort well", () => {
  const loan1 = new loan.Loan(7500, 0.068, 12, 10);
  const loan2 = new loan.Loan(7500, 0.0368, 12, 10);
  const loan3 = new loan.Loan(4500, 0.0429, 12, 10);

  const loans = [loan2, loan3, loan1];

  expect(sorting.avalanche(loan1, loan2)).toBe(-0.031200000000000006);
  expect(sorting.avalanche(loan3, loan2)).toBe(-0.006100000000000001);

  expect(sorting.snowball(loan1, loan3)).toBe(3000);
  expect(sorting.snowball(loan1, loan2)).toBe(0);

  expect(sorting.sortLoans(loans, sorting.avalanche)).toStrictEqual([
    loan1,
    loan3,
    loan2,
  ]);
  expect(sorting.sortLoans(loans, sorting.snowball)).toStrictEqual([
    loan3,
    loan1,
    loan2,
  ]);
  expect(
    sorting.sortLoans(
      sorting.sortLoans(loans, sorting.avalanche),
      sorting.snowball
    )
  ).toStrictEqual([loan3, loan1, loan2]);
});
