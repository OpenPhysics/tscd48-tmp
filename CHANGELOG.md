# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- Connection cleanup, a read race, and a calibration plateau-detection bug
- Examples: added SRI for CDN scripts, escaped HTML in the error overlay, and bounded the firmware version regex

### Changed

- CI: lint, type-check, test, and build now run as one `verify` job on Node 24 (see `.github/BRANCH_PROTECTION.md`)
- Reusable `dependency-review` and `codeql` workflows now come from `OpenPhysics/relay`

## [2.0.0] - 2025-01-18

### ⚠️ BREAKING CHANGES

- **Full TypeScript Migration**: The entire codebase has been converted from JavaScript to TypeScript
- **New Module Structure**: Source files moved from root to `src/` directory
- **New Build Output**: Built files now output to `dist/` directory instead of root
- **Import Path Changes**:
  - Old: `import CD48 from 'tscd48/cd48.js'`
  - New: `import { CD48 } from 'tscd48'` or `import CD48 from 'tscd48'`

### Added

- **Branded Types**: Type-safe `Channel` and `Voltage` types that prevent invalid values at compile time
  - `createChannel(n)` - Create validated channel (0-7)
  - `createVoltage(v)` - Create validated voltage (0-4.08V)
  - `createClampedVoltage(v)` - Create voltage clamped to valid range
  - `isValidChannel(n)` - Type guard for channels
  - `isValidVoltage(v)` - Type guard for voltages
- **Strict TypeScript Configuration**:
  - `strict: true` with all strict flags enabled
  - `noImplicitAny: true` - No implicit any types
  - `strictNullChecks: true` - Null safety
  - `noUncheckedIndexedAccess: true` - Safe array/object access
  - `exactOptionalPropertyTypes: true` - Stricter optional properties
  - `verbatimModuleSyntax: true` - Explicit type imports
- **Runtime Validation**: JSON.parse operations now validate data structure at runtime
- **TypeScript ESLint**: Full TypeScript linting support
- **CI TypeScript Check**: Dedicated typecheck job in CI pipeline
- **Generated Type Declarations**: Automatic `.d.ts` generation from source

### Changed

- All source files converted from `.js` to `.ts`
- All test files converted to TypeScript
- Build output now includes ESM and UMD bundles with source maps
- Package exports simplified to single entry point
- Updated all HTML examples to use ES module imports

### Removed

- Individual module exports (`tscd48/errors`, `tscd48/validation`, etc.) - use main export instead
- Root-level JavaScript files (now in `src/` as TypeScript)

### Migration Guide

```typescript
// Before (v1.x)
import CD48 from './cd48.js';

// After (v2.0)
import { CD48 } from 'tscd48';
// or
import CD48 from 'tscd48';

// New: Use branded types for type safety
import {
  createChannel,
  createVoltage,
  type Channel,
  type Voltage,
} from 'tscd48';
const ch: Channel = createChannel(3); // Validated at runtime, typed at compile time
const v: Voltage = createVoltage(2.5); // Throws if invalid
```

## [1.0.0] - 2025-01-17

### Added

- Comprehensive testing infrastructure with Vitest
- ESLint for code linting and quality checks
- Prettier for consistent code formatting
- TypeScript definitions (cd48.d.ts) for better IDE support
- JSDoc documentation generation
- CI workflow for automated testing and linting
- Release automation workflow
- Multiple example applications:
  - Error handling example
  - Data export example (CSV/JSON)
  - Continuous monitoring example
  - Demo mode example
- GitHub issue templates
- Pull request template
- Content Security Policy headers in web interface
- `.gitignore` file for better repository management

### Changed

- Updated package.json with npm publishing configuration
- Improved README.md with better documentation
- Enhanced web interface with security improvements

### Fixed

- Various code quality improvements based on linting rules

## [0.1.0] - 2024-XX-XX

### Added

- Initial release
- CD48 JavaScript library (cd48.js)
- Web-based control interface (index.html)
- Web Serial API integration
- Full device control:
  - Read counts from all 8 channels
  - Configure trigger levels
  - Set input impedance (50Ω / High-Z)
  - Configure DAC output
  - Channel configuration
  - LED testing
- High-level measurement functions:
  - Rate measurements
  - Coincidence measurements with accidental correction
- Example applications:
  - Simple monitor
  - Coincidence measurement
- GitHub Pages deployment
- MIT License
- README.md with comprehensive documentation

[Unreleased]: https://github.com/OpenPhysics/tscd48-tmp/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/OpenPhysics/tscd48-tmp/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/OpenPhysics/tscd48-tmp/compare/v0.1.0...v1.0.0
[0.1.0]: https://github.com/OpenPhysics/tscd48-tmp/releases/tag/v0.1.0
