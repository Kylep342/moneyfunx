# AI Guidelines

## Vision
 - MoneyFunx is a pure, modular, high-precision financial calculation engine tailored for personal finance applications (debt amortization, loan payoff strategies, variable payment allocation, investment compounding, retirement/drawdown distributions, and wealth projection trajectories).

## Code Philosophy
 - The codebase is full of patterns. USE THEM
 - Small operations that are general, shareable, and composable are preferred whenever possible
    - We should refactor often; as we uncover a pattern, extend it as far as is sensible
 - Assume in our back and forth changes I give you are intentional and incorporate them. If you think I make a mistake, ask a clarifying question before changing my changes
 - Pure, deterministic calculations:
    - Calculation methods should avoid side effects and mutation of inputs
    - Rely on BigInt arithmetic for all financial amounts (scaled in cents or smallest currency unit) to eliminate floating-point drift over multi-decade amortizations

## Development
 - All code should be linted and covered by unit tests
 - Everything Javascript is Typescript
 - Standard verification commands:
   - `./dev.sh`: Concurrent development runner that installs dependencies, launches the TypeScript watch compiler (`npm run build:watch`), and Vitest unit test suite with output piped to `logs/*.log`.
   - `npm run lint`: Single-pass pipeline that runs ESLint auto-fix followed by `tsc --noEmit` type checking.
   - `npm run test:run`: Executes all Vitest unit tests non-interactively.
   - `npm run coverage`: Runs Vitest with full code coverage instrumentation.
   - `npm run build`: Compiles production distribution to `build/`.
   - `git commit`: Git hooks automatically run `npm run lint` via Husky before opening the commit message editor.

## Discovered Guidelines
- **BigInt Financial Precision**: All monetary quantities, loan balances, interest accruals, and investment values use `bigint` representation (cents). Conversion to floating-point numbers or formatted strings occurs only when necessary at API boundaries.
- **Pure Financial Computations**: Core calculation methods avoid side effects and mutation of inputs, ensuring deterministic simulation results across multi-decade schedules.
- **Test Coverage & Edge Cases**: All financial computation paths must maintain high test coverage (>99%), explicitly testing edge conditions such as zero balance, payments below minimums, negative contributions, and non-integer interest rates.
- **Strict TypeScript**: Code must adhere to strict type checking without `any`, with exported types declared in `build/index.d.ts`.
- **No Emojis**: Do not use emojis anywhere in the codebase (code comments, commit messages, documentation, or tests). Use clean text or standard characters.
- **Unused Parameters & Code Cleanliness**: Omit unused callback parameters completely (e.g. `() => ...`) rather than keeping unused identifiers or underscore prefixes.
