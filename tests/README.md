# Tests

| Layer | Location | Tooling | Command |
|---|---|---|---|
| Unit | `tests/unit/` | Vitest | `npm test` (`test:coverage`, `test:ui`) |
| Integration (mock hardware) | `tests/integration/` | Vitest | `npm run test:integration` |
| Benchmarks | `tests/benchmarks/` | Vitest | `npm run test:bench` |
| E2E (example pages, main UI, accessibility, error scenarios) | `tests/e2e/` | Playwright | `npm run test:e2e` |
| Visual regression | `tests/e2e/visual-regression.spec.ts` | Playwright | `npm run test:e2e:visual` |
| Link/button fuzzing | `tests/e2e/link-button-fuzzing.spec.ts` | Playwright | `npm run test:e2e -- tests/e2e/link-button-fuzzing.spec.ts` |

`npm run test:all` runs unit, integration and E2E. Other Playwright variants: `test:e2e:headed`, `test:e2e:ui`, `test:e2e:debug`, `test:e2e:report`.

## Mocks
- `tests/mocks/web-serial.ts` mocks the Web Serial API.
- `tests/mock-cd48.ts` exports `MockCD48`, a hardware-free device with auto-incrementing counts, configurable command delay, and helpers such as `setCounts`, `failNextCommand` and `setDisconnectAfter`.

## Visual baselines
Screenshots are compared against stored baselines. After an intentional UI change, regenerate them with `npm run test:e2e:update-snapshots` and review the diff before committing.

## Fuzzing
See `tests/e2e/FUZZING_README.md`.
