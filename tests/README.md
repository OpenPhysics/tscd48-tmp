# Testing Infrastructure

Comprehensive test suite for the CD48 library including unit tests, integration tests, E2E tests, and visual regression testing.

## Test Structure

```
tests/
├── unit/                     # Unit tests (Vitest)
│   ├── cd48.test.ts
│   ├── errors.test.ts
│   └── validation.test.ts
├── integration/              # Integration tests
│   └── cd48-integration.test.ts   # Mock hardware tests
├── benchmarks/
│   └── cd48.bench.ts         # Benchmarks (npm run test:bench)
├── mocks/
│   └── web-serial.ts         # Web Serial API mock
├── e2e/                      # End-to-end tests (Playwright)
│   ├── examples.spec.ts      # Tests for all example pages
│   ├── main-interface.spec.ts     # Main interface tests
│   ├── accessibility.spec.ts      # Accessibility tests
│   ├── visual-regression.spec.ts  # Visual regression tests
│   ├── error-scenarios.spec.ts    # Error handling tests
│   ├── link-button-fuzzing.spec.ts  # Link/button fuzzing tests
│   └── FUZZING_README.md     # Fuzzing tests user guide
├── mock-cd48.ts             # Mock CD48 device for testing
└── README.md                # This file
```

## Running Tests

### All Tests

```bash
npm run test:all              # Run all tests (unit + integration + E2E)
```

### Unit Tests (Vitest)

```bash
npm test                      # Run unit tests
npm run test:ui               # Run with Vitest UI
npm run test:coverage         # Run with coverage report
npm run test:bench            # Run benchmark tests
```

### Integration Tests

```bash
npm run test:integration      # Run integration tests with mock hardware
```

### E2E Tests (Playwright)

```bash
npm run test:e2e              # Run all E2E tests
npm run test:e2e:examples     # Test all example pages
npm run test:e2e:visual       # Visual regression tests
npm run test:e2e:errors       # Error scenario tests
npm run test:e2e:headed       # Run with browser visible
npm run test:e2e:ui           # Run with Playwright UI
npm run test:e2e:debug        # Debug mode
npm run test:e2e:report       # View HTML report

# Fuzzing tests (link and button validation)
npm run test:e2e -- tests/e2e/link-button-fuzzing.spec.ts
```

### Visual Regression Tests

```bash
npm run test:e2e:visual               # Compare against baselines
npm run test:e2e:update-snapshots     # Update baseline screenshots
```

## Test Coverage

### Unit Tests

Located in `tests/unit/`:

- Core CD48 functionality
- Validation utilities
- Error classes

### Integration Tests

Tests using MockCD48 device:

- ✅ Connection lifecycle
- ✅ Rapid connect/disconnect cycles
- ✅ Data acquisition
- ✅ Auto-incrementing counts
- ✅ Rate measurements
- ✅ Error handling
- ✅ Concurrent operations
- ✅ Edge cases
- ✅ Long-running operations
- ✅ Data consistency

### E2E Tests - Example Pages

Tests for all 11 example pages:

- ✅ Examples Index
- ✅ Simple Monitor
- ✅ Error Handling Demo
- ✅ Demo Mode
- ✅ Multi-Channel Display
- ✅ Continuous Monitoring
- ✅ Coincidence Measurement
- ✅ Graphing & Charts
- ✅ Data Export
- ✅ Statistical Analysis
- ✅ Calibration Wizard
- ✅ Code Playground

### E2E Tests - Functionality

- ✅ Page loading without errors
- ✅ Search functionality
- ✅ Category filtering
- ✅ Code editor (CodeMirror)
- ✅ Template selection
- ✅ Tab switching
- ✅ Responsive design
- ✅ Accessibility

### Link and Button Fuzzing Tests

Automated testing of all interactive elements across all HTML pages:

- ✅ Link validation (internal and external)
- ✅ Button functionality verification
- ✅ Navigation consistency
- ✅ Security attributes on external links
- ✅ Keyboard accessibility
- ✅ Interactive UI elements (search, filters, etc.)
- ✅ Comprehensive inventory reporting

See [tests/e2e/FUZZING_README.md](e2e/FUZZING_README.md) for detailed usage guide.

### Error Scenario Tests

- ✅ Syntax errors in code playground
- ✅ Runtime errors
- ✅ Missing resources
- ✅ No search results
- ✅ Network failures
- ✅ Unhandled JavaScript errors
- ✅ Console errors
- ✅ Empty code execution
- ✅ Special characters in input
- ✅ Missing Web Serial API
- ✅ Invalid data
- ✅ Error recovery

### Visual Regression Tests

Screenshots captured for:

- ✅ Examples index (initial, search, filtered)
- ✅ Code playground (initial, with code)
- ✅ Simple monitor
- ✅ Statistical analysis
- ✅ Calibration wizard
- ✅ Component states (hover, active)
- ✅ Responsive (mobile, tablet, desktop)
- ✅ Dark theme consistency

## Mock CD48 Device

The `MockCD48` class simulates a real CD48 device without hardware:

```javascript
import { MockCD48 } from './mock-cd48.ts';

const cd48 = new MockCD48({
  autoIncrement: true,          // Auto-increment counts
  incrementRate: 10,            // counts/sec per channel
  commandDelay: 10,             // Command response delay (ms)
  version: 'Mock v1.0.0',       // Firmware version
  initialCounts: [0, 0, ...],   // Starting counts
});

await cd48.connect();
const data = await cd48.getCounts();
```

### Mock Features

- Simulates all CD48 methods
- Auto-incrementing counts (configurable)
- Configurable delays and error conditions
- Test helpers (setCounts, failNextCommand, setDisconnectAfter)
- No hardware required

## Visual Regression Testing

Visual tests capture screenshots and compare against baseline images.

### Initial Setup

1. Run tests to create baseline screenshots:

   ```bash
   npm run test:e2e:update-snapshots
   ```

2. Baselines are stored in `tests/e2e/*.spec.ts-snapshots/`

### Running Visual Tests

```bash
npm run test:e2e:visual
```

### Updating Baselines

When intentional UI changes are made:

```bash
npm run test:e2e:update-snapshots
```

### Screenshot Locations

- Desktop: `tests/e2e/visual-regression.spec.ts-snapshots/chromium/`
- Mobile: `tests/e2e/visual-regression.spec.ts-snapshots/chromium/*-mobile.png`
- Tablet: `tests/e2e/visual-regression.spec.ts-snapshots/chromium/*-tablet.png`

## Continuous Integration

Tests run automatically on:

- Pull requests
- Main branch commits
- Manual workflow dispatch

### CI Configuration

- The `verify` job runs unit and integration tests with coverage (`npm run test:coverage`)
- The `e2e` job (pull requests only) runs Playwright on Chromium with 2 retries
- Uploads e2e failure artifacts when the e2e job fails

## Writing New Tests

### Unit Tests (Vitest)

```javascript
import { describe, it, expect } from 'vitest';

describe('MyFeature', () => {
  it('should work correctly', () => {
    expect(true).toBe(true);
  });
});
```

### Integration Tests

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { MockCD48 } from '../mock-cd48.js';

describe('Integration Test', () => {
  let cd48;

  beforeEach(() => {
    cd48 = new MockCD48();
  });

  it('should connect and get data', async () => {
    await cd48.connect();
    const data = await cd48.getCounts();
    expect(data.counts).toHaveLength(8);
  });
});
```

### E2E Tests (Playwright)

```javascript
import { test, expect } from '@playwright/test';

test('my new feature', async ({ page }) => {
  await page.goto('/examples/my-example.html');
  await expect(page.locator('h1')).toBeVisible();
});
```

### Visual Regression Tests

```javascript
test('my visual test', async ({ page }) => {
  await page.goto('/my-page');
  await expect(page).toHaveScreenshot('my-screenshot.png', {
    fullPage: true,
    animations: 'disabled',
  });
});
```

## Test Best Practices

1. **Keep tests isolated** - Each test should be independent
2. **Use meaningful names** - Describe what the test does
3. **Test one thing** - Focus on a single behavior
4. **Mock external dependencies** - Use MockCD48 for hardware
5. **Clean up resources** - Disconnect devices, clear state
6. **Handle async properly** - Use async/await
7. **Use appropriate timeouts** - Don't make tests flaky
8. **Update snapshots carefully** - Review visual changes

## Debugging Tests

### Vitest

```bash
# Run specific test file
npm test tests/integration/cd48-integration.test.ts

# Run in watch mode
npm test -- --watch

# Run with UI
npm run test:ui
```

### Playwright

```bash
# Run with browser visible
npm run test:e2e:headed

# Debug mode (pause and inspect)
npm run test:e2e:debug

# Run specific test
npm run test:e2e -- tests/e2e/examples.spec.ts

# Run with trace
npm run test:e2e -- --trace on
```

### Visual Regression

```bash
# Compare and show diff
npm run test:e2e:visual

# View diffs in report
npm run test:e2e:report
```

## Test Metrics

- **E2E Coverage**: 11 example pages
- **Visual Tests**: 15+ screenshots
- **Error Scenarios**: 15+ cases

## Troubleshooting

### Tests Failing Locally

1. Ensure dev server is not already running
2. Clear test artifacts: `rm -rf tests/e2e-report`
3. Update dependencies: `npm install`
4. Check for port conflicts (8080)

### Visual Tests Failing

1. Different screen resolution? Update viewport settings
2. Font rendering differences? Update baselines
3. Animation timing? Increase wait times
4. Legitimate change? Update snapshots

### Flaky Tests

1. Increase timeouts
2. Add explicit waits
3. Check for race conditions
4. Use `waitForLoadState('networkidle')`

## Contributing

When adding new features:

1. Add unit tests for core functionality
2. Add integration tests for workflows
3. Add E2E tests for UI features
4. Add visual tests for new pages
5. Update this README if needed
