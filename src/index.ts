/**
 * tscd48 - JavaScript/TypeScript interface for the CD48 Coincidence Counter
 *
 * @packageDocumentation
 */

export type {
  CumulativeHistogramResult,
  HistogramOptions,
  HistogramResult,
  LinearRegressionResult,
  StatisticalSummary,
} from './analysis.js';
// Analysis utilities
export { Coincidence, Histogram, Statistics, TimeSeries } from './analysis.js';
export type {
  CalibrationCoefficients,
  CalibrationErrorStats,
  CalibrationPoint,
  CalibrationProfileJSON,
  CalibrationProfileOptions,
  CalibrationReport,
  CalibrationValidationResult,
  ChannelCalibrationMap,
  OptimalThresholdResult,
} from './calibration.js';
// Calibration utilities
export {
  CALIBRATION_PROFILE_VERSION,
  CalibrationProfile,
  CalibrationStorage,
  CalibrationWizard,
  VoltageCalibration,
} from './calibration.js';
// Export types from CD48
export type {
  CD48Options,
  ChannelInputs,
  CoincidenceMeasurement,
  CoincidenceMeasurementOptions,
  CoincidenceUncertainty,
  ConnectionState,
  ConnectionStateChangeCallback,
  ConnectionStateChangeData,
  CountData,
  DisconnectCallback,
  FirmwareInfo,
  MeasurementOptions,
  MeasurementUncertainty,
  RateMeasurement,
  ReconnectCallback,
  ReconnectFailedCallback,
} from './cd48.js';
// Main CD48 class
export { default as CD48, default } from './cd48.js';
// Firmware version constants
export {
  MIN_FIRMWARE_MAJOR,
  MIN_FIRMWARE_MINOR,
  MIN_FIRMWARE_PATCH,
  MIN_FIRMWARE_VERSION,
} from './constants.js';
export type {
  DevLoggerOptions,
  DevModeUtilities,
  ErrorContext,
  GlobalDevUtilities,
  LoggerColors,
  LogLevel,
  PerformanceStats,
  SetupDevModeOptions,
  StoredError,
} from './dev-utils.js';
// Development utilities
export {
  DevLogger,
  ErrorOverlay,
  PerformanceMonitor,
  setupDevMode,
} from './dev-utils.js';
// Error classes
export {
  CD48Error,
  CommandTimeoutError,
  CommunicationError,
  ConnectionError,
  DeviceSelectionCancelledError,
  FirmwareIncompatibleError,
  InvalidChannelError,
  InvalidResponseError,
  InvalidVoltageError,
  NotConnectedError,
  OperationAbortedError,
  OverflowError,
  UnsupportedBrowserError,
  ValidationError,
} from './errors.js';
export type {
  ExportableMeasurement,
  ExportFormat,
  ExportOptions,
} from './export.js';

// Data export utilities
export { DataExport } from './export.js';
// Branded types for type-safe channel and voltage values
export type { Channel, ImpedanceMode, Voltage } from './validation.js';
// Validation utilities
export {
  BYTE_MAX,
  BYTE_MIN,
  byteToVoltage,
  CHANNEL_MAX,
  CHANNEL_MIN,
  clamp,
  clampRepeatInterval,
  clampVoltage,
  // Branded type constructors
  createChannel,
  createClampedVoltage,
  createVoltage,
  // Type guards
  isValidChannel,
  isValidVoltage,
  REPEAT_INTERVAL_MAX,
  REPEAT_INTERVAL_MIN,
  VOLTAGE_MAX,
  VOLTAGE_MIN,
  validateBinaryInput,
  validateBoolean,
  validateByte,
  // Validation functions
  validateChannel,
  validateDuration,
  validateImpedanceMode,
  validateRepeatInterval,
  validateVoltage,
  voltageToByte,
} from './validation.js';
