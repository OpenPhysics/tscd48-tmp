/**
 * Validation utilities for CD48 parameters
 */

import {
  InvalidChannelError,
  InvalidVoltageError,
  ValidationError,
} from './errors.js';

/**
 * Valid channel range (0-7)
 */
export const CHANNEL_MIN = 0;
export const CHANNEL_MAX = 7;

/**
 * Valid voltage range (0-4.08V)
 */
export const VOLTAGE_MIN = 0.0;
export const VOLTAGE_MAX = 4.08;

// ============================================================================
// Branded Types
// ============================================================================

/**
 * Unique symbol for Channel brand
 * @internal
 */
declare const ChannelBrand: unique symbol;

/**
 * Unique symbol for Voltage brand
 * @internal
 */
declare const VoltageBrand: unique symbol;

/**
 * Branded type for validated channel numbers (0-7)
 * Use `createChannel()` to create instances safely
 */
export type Channel = number & { readonly [ChannelBrand]: typeof ChannelBrand };

/**
 * Branded type for validated voltage values (0-4.08V)
 * Use `createVoltage()` to create instances safely
 */
export type Voltage = number & { readonly [VoltageBrand]: typeof VoltageBrand };

/**
 * Type guard to check if a number is a valid Channel
 * @param value - Value to check
 * @returns True if value is a valid channel (0-7)
 */
export function isValidChannel(value: number): value is Channel {
  return (
    typeof value === 'number' &&
    !Number.isNaN(value) &&
    Number.isInteger(value) &&
    value >= CHANNEL_MIN &&
    value <= CHANNEL_MAX
  );
}

/**
 * Type guard to check if a number is a valid Voltage
 * @param value - Value to check
 * @returns True if value is a valid voltage (0-4.08)
 */
export function isValidVoltage(value: number): value is Voltage {
  return (
    typeof value === 'number' &&
    !Number.isNaN(value) &&
    value >= VOLTAGE_MIN &&
    value <= VOLTAGE_MAX
  );
}

/**
 * Create a validated Channel from a number
 * @param value - Channel number (0-7)
 * @returns Branded Channel type
 * @throws InvalidChannelError if value is out of range
 */
export function createChannel(value: number): Channel {
  if (!isValidChannel(value)) {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      throw new ValidationError(
        'channel',
        value,
        'must be an integer between 0 and 7'
      );
    }
    throw new InvalidChannelError(value);
  }
  return value;
}

/**
 * Create a validated Voltage from a number
 * @param value - Voltage value (0-4.08V)
 * @returns Branded Voltage type
 * @throws InvalidVoltageError if value is out of range
 */
export function createVoltage(value: number): Voltage {
  if (!isValidVoltage(value)) {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      throw new ValidationError(
        'voltage',
        value,
        'must be a number between 0.0 and 4.08'
      );
    }
    throw new InvalidVoltageError(value);
  }
  return value;
}

/**
 * Create a Voltage by clamping the value to valid range
 * @param value - Voltage value
 * @returns Clamped and branded Voltage
 */
export function createClampedVoltage(value: number): Voltage {
  const clamped = Math.max(VOLTAGE_MIN, Math.min(VOLTAGE_MAX, value));
  // Use createVoltage for runtime validation instead of type assertion
  return createVoltage(clamped);
}

/**
 * Valid byte range (0-255)
 */
export const BYTE_MIN = 0;
export const BYTE_MAX = 255;

/**
 * Valid repeat interval range (100-65535 ms)
 */
export const REPEAT_INTERVAL_MIN = 100;
export const REPEAT_INTERVAL_MAX = 65535;

/**
 * Impedance mode type
 */
export type ImpedanceMode = 'highz' | '50ohm';

/**
 * Validate channel number
 * @param channel - Channel number to validate
 * @throws InvalidChannelError If channel is out of range
 */
export function validateChannel(channel: number): void {
  if (typeof channel !== 'number' || Number.isNaN(channel)) {
    throw new ValidationError(
      'channel',
      channel,
      'must be a number between 0 and 7'
    );
  }

  if (
    !Number.isInteger(channel) ||
    channel < CHANNEL_MIN ||
    channel > CHANNEL_MAX
  ) {
    throw new InvalidChannelError(channel);
  }
}

/**
 * Validate a counter input enable (0 or 1).
 * @param name - Input name (A, B, C, or D)
 * @param value - Value to validate
 * @throws ValidationError If value is not 0 or 1
 */
export function validateBinaryInput(name: string, value: number): void {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new ValidationError(name, value, 'must be 0 or 1');
  }
  if (!Number.isInteger(value) || (value !== 0 && value !== 1)) {
    throw new ValidationError(name, value, 'must be 0 or 1');
  }
}

/**
 * Validate voltage value
 * @param voltage - Voltage to validate
 * @throws InvalidVoltageError If voltage is out of range
 */
export function validateVoltage(voltage: number): void {
  if (typeof voltage !== 'number' || Number.isNaN(voltage)) {
    throw new ValidationError(
      'voltage',
      voltage,
      'must be a number between 0.0 and 4.08'
    );
  }

  if (voltage < VOLTAGE_MIN || voltage > VOLTAGE_MAX) {
    throw new InvalidVoltageError(voltage);
  }
}

/**
 * Validate byte value
 * @param byte - Byte value to validate
 * @throws ValidationError If byte is out of range
 */
export function validateByte(byte: number): void {
  if (typeof byte !== 'number' || Number.isNaN(byte)) {
    throw new ValidationError(
      'byte',
      byte,
      'must be a number between 0 and 255'
    );
  }

  if (byte < BYTE_MIN || byte > BYTE_MAX) {
    throw new ValidationError('byte', byte, '0-255');
  }
}

/**
 * Validate repeat interval
 * @param interval - Interval in milliseconds
 * @throws ValidationError If interval is out of range
 */
export function validateRepeatInterval(interval: number): void {
  if (typeof interval !== 'number' || Number.isNaN(interval)) {
    throw new ValidationError(
      'repeat_interval',
      interval,
      'must be a number between 100 and 65535'
    );
  }

  if (interval < REPEAT_INTERVAL_MIN || interval > REPEAT_INTERVAL_MAX) {
    throw new ValidationError('repeat_interval', interval, '100-65535 ms');
  }
}

/**
 * Validate duration
 * @param duration - Duration in seconds
 * @throws ValidationError If duration is invalid
 */
export function validateDuration(duration: number): void {
  if (typeof duration !== 'number' || Number.isNaN(duration)) {
    throw new ValidationError(
      'duration',
      duration,
      'must be a positive number'
    );
  }

  if (duration <= 0) {
    throw new ValidationError('duration', duration, 'must be greater than 0');
  }
}

/**
 * Type guard to check if a string is a valid ImpedanceMode
 */
function isImpedanceMode(value: string): value is ImpedanceMode {
  return value === 'highz' || value === '50ohm';
}

/**
 * Validate impedance mode
 * @param mode - Impedance mode ('highz' or '50ohm')
 * @throws ValidationError If mode is invalid
 */
export function validateImpedanceMode(
  mode: string
): asserts mode is ImpedanceMode {
  if (typeof mode !== 'string') {
    throw new ValidationError('impedance', mode, "must be 'highz' or '50ohm'");
  }

  const normalized = mode.toLowerCase();
  if (!isImpedanceMode(normalized)) {
    throw new ValidationError('impedance', mode, "must be 'highz' or '50ohm'");
  }
}

/**
 * Validate boolean parameter
 * @param paramName - Parameter name
 * @param value - Value to validate
 * @throws ValidationError If value is not boolean
 */
export function validateBoolean(
  paramName: string,
  value: unknown
): asserts value is boolean {
  if (typeof value !== 'boolean') {
    throw new ValidationError(paramName, value, 'must be true or false');
  }
}

/**
 * Clamp value to range
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Clamp voltage to valid range
 * @param voltage - Voltage to clamp
 * @returns Clamped voltage
 */
export function clampVoltage(voltage: number): number {
  return clamp(voltage, VOLTAGE_MIN, VOLTAGE_MAX);
}

/**
 * Clamp repeat interval to valid range
 * @param interval - Interval to clamp
 * @returns Clamped interval
 */
export function clampRepeatInterval(interval: number): number {
  return clamp(interval, REPEAT_INTERVAL_MIN, REPEAT_INTERVAL_MAX);
}

/**
 * Convert voltage to byte value (0-255)
 * @param voltage - Voltage (0-4.08V)
 * @returns Byte value (0-255)
 */
export function voltageToByte(voltage: number): number {
  const clamped = clampVoltage(voltage);
  return Math.round((clamped / VOLTAGE_MAX) * BYTE_MAX);
}

/**
 * Convert byte value to voltage
 * @param byte - Byte value (0-255)
 * @returns Voltage (0-4.08V)
 */
export function byteToVoltage(byte: number): number {
  validateByte(byte);
  return (byte / BYTE_MAX) * VOLTAGE_MAX;
}
