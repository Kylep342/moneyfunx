# MoneyFunx

![Tests](https://github.com/Kylep342/moneyfunx/actions/workflows/tests.yml/badge.svg)
[![npm](https://img.shields.io/npm/v/moneyfunx.svg)](https://www.npmjs.com/package/moneyfunx)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

MoneyFunx is a high-precision, modular library of financial computation functions with a focus on personal finance (debt payoff, amortization schedules, investment compounding, and retirement drawdown).

## Modules

- **`debt`**: Loan primitives, payment amortization, debt snowball/avalanche payoff schedules, variable payment plans.
- **`investment`**: Financial instruments, contribution amortization, compound growth, withdrawal/drawdown strategies.
- **`shared`**: Primitive financial calculations, sorting strategies, and currency math.

## Running locally

Requires Node && NPM

In a shell of your choice, from project root:

```bash
./dev.sh
```

This concurrently launches:
- TypeScript compiler in watch mode (`npm run build:watch`) logging to `logs/build.log`
- Vitest test runner in watch mode (`npm run test`) logging to `logs/test.log`

## Verification Commands

- `npm run lint`: Runs ESLint with auto-fix and TypeScript type-checking (`tsc --noEmit`).
- `npm run lint:check`: Non-modifying lint and type-check run.
- `npm run test:run`: Runs unit tests non-interactively.
- `npm run coverage`: Runs Vitest with full code coverage instrumentation.
- `npm run build`: Compiles production distribution to `build/`.
