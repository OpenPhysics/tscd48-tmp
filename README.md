# tscd48 - TypeScript Interface for CD48 Coincidence Counter

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/OpenPhysics/tscd48/workflows/CI/badge.svg)](https://github.com/OpenPhysics/tscd48/actions)
[![codecov](https://codecov.io/gh/OpenPhysics/tscd48/branch/main/graph/badge.svg)](https://codecov.io/gh/OpenPhysics/tscd48)
[![npm version](https://img.shields.io/npm/v/tscd48.svg)](https://www.npmjs.com/package/tscd48)
[![TypeScript](https://img.shields.io/badge/TypeScript-7-3178C6.svg)](https://www.typescriptlang.org/)
[![Chrome](https://img.shields.io/badge/Chrome-89+-green.svg)](https://www.google.com/chrome/)
[![Edge](https://img.shields.io/badge/Edge-89+-blue.svg)](https://www.microsoft.com/edge)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen.svg)](https://openphysics.github.io/tscd48/)

A comprehensive browser-based TypeScript library and web interface for controlling the [Red Dog Physics CD48 Coincidence Counter](https://www.reddogphysics.com/cd48.html) using the Web Serial API.

**No installation required** - just open the web page in Chrome or Edge and connect to your CD48.

## 🌟 Highlights

- **Zero installation** - Works directly in modern browsers
- **Native TypeScript** - Written in TypeScript with strict type checking, zero `any` types
- **11 interactive examples** - From simple monitoring to advanced analysis
- **Live code playground** - Test and experiment with the API in real-time
- **Advanced analytics** - Statistical analysis, histograms, time-series tools
- **Calibration wizard** - Step-by-step calibration with profile management
- **Module bundles** - ESM, UMD, and minified builds for any project
- **Comprehensive tests** - Unit, integration, E2E, accessibility, and visual regression tests
- **Hot reload dev server** - Instant feedback during development

## 🚀 Live Demo

**[https://openphysics.github.io/tscd48/](https://openphysics.github.io/tscd48/)**

Open the link above in Chrome or Edge, connect your CD48 via USB, and click "Connect".

## 📦 Installation

### Option 1: NPM Package

Install from npm for use in your projects:

```bash
npm install tscd48
```

**TypeScript / ES Modules:**

```typescript
import CD48, {
  type CD48Options,
  type CountData,
  Statistics,
  Histogram,
  TimeSeries,
  CalibrationWizard,
  type CalibrationProfile,
} from 'tscd48';

const options: CD48Options = {
  baudRate: 115200,
  autoReconnect: true,
};

const cd48 = new CD48(options);
await cd48.connect();

// Full type inference on all methods
const counts: CountData = await cd48.getCounts();
console.log(counts.counts); // number[]
```

**JavaScript / CommonJS:**

```javascript
const CD48 = require('tscd48');
const cd48 = new CD48();
await cd48.connect();
```

### Option 2: CDN - UMD Bundle

Use via unpkg CDN for quick prototyping:

```html
<!-- Minified UMD bundle -->
<script src="https://unpkg.com/tscd48@latest/dist/cd48.umd.min.js"></script>
<script>
  const cd48 = new CD48();
</script>
```

### Option 3: CDN - ES Module

```html
<script type="module">
  import CD48 from 'https://unpkg.com/tscd48@latest/dist/cd48.esm.min.js';
  const cd48 = new CD48();
</script>
```

### Option 4: Build from Source

Clone the repository and run `npm install && npm run build`; the bundles are written to `dist/`.

## ✨ Features

### Core Features

- **Zero installation** - Works directly in Chrome/Edge browser
- **Real-time monitoring** - Live count display with rate calculation
- **Full device control** - Trigger levels, impedance, DAC output
- **High-level measurements** - Rate and coincidence measurement with accidental correction
- **Native TypeScript** - Written in TypeScript with strict mode, zero `any` types
- **Full type inference** - Comprehensive types for all APIs
- **Comprehensive testing** - Unit, integration, E2E, and visual regression suites

### Advanced Analysis Tools 📊

- **Statistics Module** - Mean, median, std dev, variance, Poisson analysis
- **Histogram Generation** - Automatic binning with Sturges and Freedman-Diaconis rules
- **Time-Series Analysis** - Moving averages, outlier detection, autocorrelation
- **Coincidence Analysis** - Accidental rate calculation, true coincidence extraction

### Calibration Support 🎯

- **CalibrationProfile** - Manage voltage, threshold, gain, and offset calibrations
- **CalibrationStorage** - Persistent profile storage with localStorage
- **VoltageCalibration** - Two-point and multi-point calibration utilities
- **CalibrationWizard** - Step-by-step guided calibration workflow

### Development Tools 🛠️

- **DevLogger** - Enhanced console logging with colors and timestamps
- **ErrorOverlay** - Visual error display with stack traces and context
- **PerformanceMonitor** - Track and analyze performance metrics
- **Hot Reload** - Vite dev server with instant feedback
- **Mock Device** - Test without hardware using MockCD48

### Example Applications (11 Total)

Browse all examples at **[/examples/](/examples/)**

#### Basic Examples

- **Simple Monitor** - Basic real-time monitoring of all 8 channels
- **Error Handling** - Comprehensive error handling patterns
- **Demo Mode** - Try the interface without hardware (simulated data)
- **Data Export** - Export measurements to CSV, JSON formats

#### Advanced Examples

- **Multi-Channel Display** - Professional real-time visualization
- **Continuous Monitoring** - Long-term data collection with persistence
- **Coincidence Measurement** - Specialized coincidence experiments
- **Graphing Interface** - Live count rate graphs with Chart.js
- **Statistical Analysis** - Advanced statistical tools and histograms
- **Calibration Wizard** - Interactive calibration workflow
- **Code Playground** - Live code editor with syntax highlighting

## 🎮 Quick Start

### Web Interface

1. Download or clone this repository
2. Start the development server:

   ```bash
   # Using npm
   npm install
   npm run dev       # Vite dev server; open http://localhost:5173/examples/

   # Or serve the repository root statically (http://localhost:3000)
   npx serve .
   ```

3. Open the URL in Chrome or Edge
4. Click **Connect** and select your CD48

### JavaScript API

Basic usage example:

```javascript
const cd48 = new CD48();
await cd48.connect();

const version = await cd48.getVersion();
console.log('Firmware:', version);

const counts = await cd48.getCounts();
console.log('Counts:', counts.counts);

await cd48.disconnect();
```

### Statistical Analysis Example

```javascript
import CD48, { Statistics, Histogram } from 'tscd48';

const cd48 = new CD48();
await cd48.connect();

// Collect data
const samples = [];
for (let i = 0; i < 100; i++) {
  const data = await cd48.getCounts();
  samples.push(data.counts[0]);
  await cd48.sleep(100);
}

// Analyze
const stats = Statistics.summary(samples);
console.log(`Mean: ${stats.mean}, StdDev: ${stats.std}`);

// Create histogram
const hist = Histogram.autobin(samples);
console.log('Histogram:', hist);
```

### Calibration Example

```javascript
import CD48, { CalibrationWizard } from 'tscd48';

const cd48 = new CD48();
await cd48.connect();

const wizard = new CalibrationWizard(cd48);

// Measure background
const backgrounds = await wizard.measureBackground([0, 1, 2, 3], 10.0);

// Calibrate channel 0
await wizard.calibrateVoltage(0, 5.0); // Known 5V reference
await wizard.calibrateGain(0, 1000, 10.0); // Known 1000 cps reference

// Save profile
wizard.save('Lab Setup 2025-01-17');
```

## 📚 API Reference

### Core CD48 API

#### Connection

```javascript
CD48.isSupported(); // Check browser support
await cd48.connect(); // Connect to device
cd48.isConnected(); // Check connection status
await cd48.disconnect(); // Disconnect
```

#### Reading Counts

```javascript
await cd48.getCounts(); // Get all channel counts
await cd48.clearCounts(); // Clear all counters
await cd48.getOverflow(); // Check overflow status
```

#### Configuration

```javascript
await cd48.setTriggerLevel(0.5); // Set trigger (0-4.08V)
await cd48.setImpedance50Ohm(); // Set 50Ω impedance
await cd48.setImpedanceHighZ(); // Set high-Z impedance
await cd48.setDacVoltage(2.0); // Set DAC (0-4.08V)
await cd48.setChannel(4, { A: 1, B: 1 }); // Configure channel
```

#### Measurements

```javascript
// Measure rate on a channel
const rate = await cd48.measureRate(0, 10);
// Returns: { counts, duration, rate, channel, uncertainty }

// Measure coincidence rate with accidental correction
const result = await cd48.measureCoincidenceRate({
  duration: 60,
  singlesAChannel: 0,
  singlesBChannel: 1,
  coincidenceChannel: 4,
  coincidenceWindow: 25e-9,
});
// Returns: { singlesA, singlesB, coincidences, rateA, rateB,
//            coincidenceRate, accidentalRate, trueCoincidenceRate }
```

### Analysis API

#### Statistics

```javascript
import { Statistics } from 'tscd48';

Statistics.mean(data);
Statistics.median(data);
Statistics.standardDeviation(data);
Statistics.variance(data);
Statistics.poissonUncertainty(count);
Statistics.linearRegression(x, y);
Statistics.summary(data); // All stats at once
```

#### Histogram

```javascript
import { Histogram } from 'tscd48';

Histogram.create(data, { bins: 10 });
Histogram.autobin(data); // Sturges' rule
Histogram.freedmanDiaconis(data); // F-D rule
Histogram.cumulative(data); // Cumulative histogram
```

#### Time-Series

```javascript
import { TimeSeries } from 'tscd48';

TimeSeries.movingAverage(data, window);
TimeSeries.exponentialMovingAverage(data, alpha);
TimeSeries.detectOutliers(data, threshold);
TimeSeries.autocorrelation(data, lag);
```

### Calibration API

```javascript
import {
  CalibrationProfile,
  CalibrationStorage,
  VoltageCalibration,
  CalibrationWizard,
} from 'tscd48';

// Create profile
const profile = new CalibrationProfile({ name: 'My Profile' });
profile.setVoltage(0, 5.0);
profile.setGain(0, 1.2);

// Storage
const storage = new CalibrationStorage();
storage.save(profile);
const loaded = storage.load('My Profile');

// Voltage calibration
const cal = VoltageCalibration.twoPoint(
  { raw: 100, actual: 5.0 },
  { raw: 200, actual: 10.0 }
);

// Wizard
const wizard = new CalibrationWizard(cd48);
await wizard.measureBackground([0, 1, 2, 3], 10.0);
```

## 🏗️ Module Bundles

The package provides multiple bundle formats:

```
dist/
├── cd48.esm.js          # ES Module
├── cd48.esm.min.js      # ES Module, minified
├── cd48.umd.js          # UMD bundle (global `CD48`)
└── cd48.umd.min.js      # UMD bundle, minified
```

**Package exports:**

```json
{
  ".": {
    "types": "./dist/index.d.ts",
    "import": "./dist/cd48.esm.js",
    "require": "./dist/cd48.umd.js"
  }
}
```

All modules (analysis, calibration, errors, validation, export, dev-utils) are exported from the main entry point.

## 🧪 Testing

The project includes unit, integration, E2E, and visual regression tests, all written in TypeScript:

```bash
# Unit tests
npm test                    # Run unit tests
npm run test:coverage       # With coverage
npm run test:ui             # Vitest UI
npm run typecheck           # TypeScript type checking

# Integration tests
npm run test:integration    # Test with mock hardware

# Benchmarks
npm run test:bench          # Performance benchmarks

# E2E tests
npm run test:e2e            # All E2E tests
npm run test:e2e:examples   # Test all 11 examples
npm run test:e2e:visual     # Visual regression tests
npm run test:e2e:errors     # Error scenario tests
npm run test:e2e:headed     # Run with browser visible

# All tests
npm run test:all            # Run everything
```

**Test Coverage:**

- Unit tests for core functionality (TypeScript)
- Integration tests with MockCD48 (TypeScript)
- Performance benchmarks (TypeScript)
- E2E tests for all 11 example pages
- Visual regression and accessibility testing
- Error scenario testing
- Cross-browser (Chromium, WebKit, Firefox)
- Strict TypeScript checking with zero `any` types

See [tests/README.md](tests/README.md) for detailed testing documentation.

## 🛠️ Development

### Setup

```bash
git clone https://github.com/OpenPhysics/tscd48.git
cd tscd48
npm install
```

### Development Server

```bash
npm run dev          # Start Vite dev server with hot reload
npm run preview      # Preview production build
```

The dev server runs on Vite's default port (`http://localhost:5173`; browse to `/examples/`) with hot module replacement enabled.

### Building

```bash
npm run build        # Build all bundles (ESM, UMD, minified)
npm run docs         # Generate TypeDoc API documentation (docs/api/)
```

### Code Quality

**Automated Git Hooks:**

- **Pre-commit** - Lints and formats staged files
- **Commit-msg** - Validates conventional commits format
- **Pre-push** - Runs the Biome check, type check, and unit tests

**Manual Commands:**

```bash
npm run lint         # Check code quality
npm run lint:fix     # Fix linting issues
npm run format       # Format all files
npm run format:check # Biome check (format + lint) without writing
npm run commit       # Interactive commit (guided)
```

### Project Structure

```
tscd48/
├── src/                     # TypeScript source files
│   ├── cd48.ts                 # Main library
│   ├── analysis.ts             # Statistical analysis tools
│   ├── calibration.ts          # Calibration utilities
│   ├── constants.ts            # Protocol and firmware constants
│   ├── dev-utils.ts            # Development utilities
│   ├── export.ts               # Data export (JSON, CSV, MAT)
│   ├── errors.ts               # Error classes
│   ├── validation.ts           # Input validation
│   ├── types.ts                # Shared types
│   └── index.ts                # Main entry point
│
├── dist/                    # Built bundles (generated)
│   ├── cd48.esm.js
│   ├── cd48.esm.min.js
│   ├── cd48.umd.js
│   ├── cd48.umd.min.js
│   └── *.d.ts                  # Auto-generated type definitions
│
├── examples/                # 11 example applications
│   ├── index.html              # Examples browser
│   ├── code-playground.html    # Live code editor
│   ├── statistical-analysis.html
│   ├── calibration-wizard.html
│   └── ... (7 more)
│
├── tests/                   # Comprehensive test suite (TypeScript)
│   ├── unit/                   # Unit tests
│   ├── integration/            # Integration tests
│   ├── e2e/                    # End-to-end tests (Playwright)
│   ├── benchmarks/             # Performance benchmarks
│   └── mocks/                  # Mock implementations
│
├── tsconfig.json            # TypeScript configuration
├── vite.config.build.ts     # Build configuration
├── vitest.config.ts         # Test configuration
│
├── .github/workflows/       # CI/CD pipelines
│   ├── ci.yml                  # Continuous integration
│   ├── deploy.yml              # GitHub Pages deployment
│   ├── prerelease.yml          # Pre-release builds
│   ├── release.yml             # Automated releases
│   └── changelog.yml           # Changelog generation
│
└── docs/                    # Generated documentation
```

## 📖 Documentation

- **[README.md](README.md)** - This file
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and solutions
- **[ERROR_HANDLING.md](ERROR_HANDLING.md)** - Error handling guide
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contributing guidelines
- **[CHANGELOG.md](CHANGELOG.md)** - Version history
- **[ACCESSIBILITY.md](ACCESSIBILITY.md)** - Accessibility features
- **[tests/README.md](tests/README.md)** - Testing documentation
- **[.github/BRANCH_PROTECTION.md](.github/BRANCH_PROTECTION.md)** - Recommended branch protection and required CI checks
- **[API Docs](docs/api/)** - Auto-generated TypeDoc (generated by `npm run docs`)

## 🌐 Browser Compatibility

| Browser | Version | Status        |
| ------- | ------- | ------------- |
| Chrome  | 89+     | Full support  |
| Edge    | 89+     | Full support  |
| Opera   | 76+     | Full support  |
| Firefox | -       | Not supported |
| Safari  | -       | Not supported |

The Web Serial API requires Chrome, Edge, or Opera. Firefox and Safari do not support this API.

## 📋 Requirements

- **Browser**: Chrome 89+, Edge 89+, or Opera 76+
- **CD48 Device**: Connected via USB
- **HTTPS or localhost**: Required for Web Serial API

## 💡 Troubleshooting

### Common Issues

**"Web Serial API not supported"**

- Use Chrome 89+, Edge 89+, or Opera 76+
- Firefox and Safari don't support Web Serial

**"No CD48 device selected"**

- Ensure the CD48 is connected via USB
- Close any other applications using the serial port
- Try unplugging and reconnecting the device

**Connection works but no response**

- The CD48 uses Cypress VID `0x04B4`
- Make sure you select the correct device
- Try refreshing the page and reconnecting

**Port picker shows no devices (Linux)**

```bash
sudo usermod -a -G dialout $USER
# Log out and back in
```

See **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** for comprehensive troubleshooting guide.

## 🔒 Security

The Web Serial API requires:

- **User gesture** - Connection must be initiated by a click
- **Explicit selection** - User chooses the port from a picker
- **Secure context** - HTTPS or localhost only

This prevents websites from silently accessing serial devices.

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details.

Quick start:

```bash
# Fork and clone
git clone https://github.com/YOUR-USERNAME/tscd48.git
cd tscd48

# Install (sets up Git hooks)
npm install

# Create feature branch
git checkout -b feat/my-feature

# Make changes and commit (hooks run automatically)
git commit -m "feat: add my feature"

# Push and create PR
git push origin feat/my-feature
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file.

## 🙏 Acknowledgments

This library interfaces with the CD48 Coincidence Counter designed and manufactured by [Red Dog Physics](https://www.reddogphysics.com/).

## 🔗 Related Projects

- [pycd48](https://github.com/OpenPhysics/pycd48) - Python interface for CD48
- [jscd48-tmp](https://github.com/OpenPhysics/jscd48-tmp) - Archived JavaScript predecessor of this library
- [Red Dog Physics CD48](https://www.reddogphysics.com/cd48.html) - Official hardware

---

**Made with ❤️ by the OpenPhysics community**
