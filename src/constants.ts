/**
 * Central constants file for CD48 library
 * This file contains all magic numbers and configuration values used across the codebase
 */

import type { LoggerColors } from './dev-utils.js';

// ============================================================================
// Device Communication Configuration
// ============================================================================

/** Serial port baud rate for CD48 device communication */
export const BAUD_RATE = 115200;

/** Delay between commands sent to device (milliseconds) */
export const COMMAND_DELAY_MS = 50;

/** Default timeout for command responses (milliseconds) */
export const COMMAND_TIMEOUT_MS = 1000;

/** Delay after connection initialization (milliseconds) */
export const CONNECTION_INIT_DELAY_MS = 500;

/** Interval for read timeout checks (milliseconds) */
export const READ_TIMEOUT_INTERVAL_MS = 100;

/** How long to discard bytes already sitting in the reader before a write. */
export const INPUT_DRAIN_MS = 15;

/**
 * After at least one line, stop when no further bytes arrive for this long.
 * Multi-line H/P/C replies are otherwise truncated at the first terminator.
 */
export const RESPONSE_IDLE_GAP_MS = 50;

/** Number of automatic reconnection attempts */
export const RECONNECT_ATTEMPTS = 5;

/** Delay between reconnection attempts (milliseconds) */
export const RECONNECT_DELAY_MS = 1000;

/** Default number of command retries for transient errors */
export const DEFAULT_COMMAND_RETRIES = 0;

/** Default delay between command retries (milliseconds) */
export const DEFAULT_RETRY_DELAY_MS = 100;

/** Web Locks API lock name for CD48 serial communication */
export const WEB_LOCK_NAME = 'cd48-serial-lock';

// ============================================================================
// Firmware Version Constants
// ============================================================================

/** Minimum supported firmware major version */
export const MIN_FIRMWARE_MAJOR = 1;

/** Minimum supported firmware minor version */
export const MIN_FIRMWARE_MINOR = 0;

/** Minimum supported firmware patch version */
export const MIN_FIRMWARE_PATCH = 0;

/** Firmware version string for minimum supported version */
export const MIN_FIRMWARE_VERSION = `${MIN_FIRMWARE_MAJOR}.${MIN_FIRMWARE_MINOR}.${MIN_FIRMWARE_PATCH}`;

// ============================================================================
// Hardware Specifications
// ============================================================================

/** USB Vendor ID for Cypress-based CD48 device */
export const USB_VENDOR_ID = 0x04b4;

/** Number of channels supported by CD48 hardware */
export const EXPECTED_CHANNEL_COUNT = 8;

/** Expected number of values in count response (channels + overflow flag) */
export const EXPECTED_COUNT_RESPONSE_LENGTH = 9;

/** Coincidence window width in seconds (25 nanoseconds) */
export const COINCIDENCE_WINDOW_SECONDS = 25e-9;

// ============================================================================
// Measurement Configuration
// ============================================================================

/** Multiplier for accidental coincidence rate calculation */
export const ACCIDENTAL_RATE_MULTIPLIER = 2;

/** Default channel for singles measurement A in coincidence measurements */
export const DEFAULT_SINGLES_A_CHANNEL = 0;

/** Default channel for singles measurement B in coincidence measurements */
export const DEFAULT_SINGLES_B_CHANNEL = 1;

/** Default channel for coincidence measurement */
export const DEFAULT_COINCIDENCE_CHANNEL = 4;

/** Default measurement duration in seconds */
export const DEFAULT_MEASUREMENT_DURATION = 1.0;

/** Default background measurement duration in seconds */
export const DEFAULT_BACKGROUND_DURATION = 10.0;

/** Default calibration measurement duration in seconds */
export const DEFAULT_CALIBRATION_DURATION = 5.0;

/** Milliseconds per second conversion factor */
export const MILLISECONDS_PER_SECOND = 1000;

/** Percentage conversion factor (multiply by 100 to convert to percent) */
export const PERCENT_CONVERSION = 100;

// ============================================================================
// Statistical Analysis Constants
// ============================================================================

/** Default number of bins for histogram generation */
export const DEFAULT_HISTOGRAM_BINS = 10;

/** Z-score threshold for outlier detection (standard deviations from mean) */
export const OUTLIER_Z_SCORE_THRESHOLD = 3;

/** Default alpha parameter for exponential moving average (0-1) */
export const EXPONENTIAL_MA_DEFAULT_ALPHA = 0.3;

/** Q1 quartile position (25th percentile) */
export const QUARTILE_Q1 = 0.25;

/** Q3 quartile position (75th percentile) */
export const QUARTILE_Q3 = 0.75;

/** Freedman-Diaconis rule divisor for bin width calculation */
export const FREEDMAN_DIACONIS_DIVISOR = 1 / 3;

// ============================================================================
// Calibration Constants
// ============================================================================

/** Lower threshold for plateau region detection (95% of max) */
export const PLATEAU_REGION_THRESHOLD_LOWER = 0.95;

/** Upper threshold for plateau region detection (105% of max) */
export const PLATEAU_REGION_THRESHOLD_UPPER = 1.05;

/** Minimum allowed gain value */
export const GAIN_MIN = 0.1;

/** Maximum allowed gain value */
export const GAIN_MAX = 10;

/** Minimum number of points required for calibration */
export const MIN_CALIBRATION_POINTS = 2;

/** Default settling time after setting threshold during calibration (milliseconds) */
export const DEFAULT_SETTLING_TIME_MS = 100;

/** JSON formatting indentation spaces */
export const JSON_INDENT_SPACES = 2;

// ============================================================================
// UI and Display Constants
// ============================================================================

/** Z-index for error overlay (ensures it appears above all other elements) */
export const ERROR_OVERLAY_Z_INDEX = 999999;

/** Font size for error overlay content (pixels) */
export const ERROR_OVERLAY_FONT_SIZE = 14;

/** Font size for error overlay title (pixels) */
export const ERROR_OVERLAY_TITLE_FONT_SIZE = 24;

/** Padding for error overlay content (pixels) */
export const ERROR_OVERLAY_PADDING = 20;

/** Top padding for error overlay content (pixels) */
export const ERROR_OVERLAY_PADDING_TOP = 10;

/** Border radius for error overlay (pixels) */
export const ERROR_OVERLAY_BORDER_RADIUS = 6;

/** 95th percentile index */
export const PERCENTILE_95 = 0.95;

/** 99th percentile index */
export const PERCENTILE_99 = 0.99;

// ============================================================================
// Logger Configuration
// ============================================================================

/** Color codes for different log levels */
export const LOGGER_COLORS = {
  debug: '#6366f1',
  info: '#3b82f6',
  warn: '#f59e0b',
  error: '#ef4444',
  success: '#10b981',
} as const satisfies LoggerColors;

/** Log level priority values (lower = more verbose) */
export const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
} as const satisfies Record<'debug' | 'info' | 'warn' | 'error', number>;

/** Padding for milliseconds in timestamp display */
export const LOGGER_TIMESTAMP_PADDING = 3;

// ============================================================================
// Numeric Radix Constants
// ============================================================================

/** Decimal radix for parseInt operations */
export const DECIMAL_RADIX = 10;
