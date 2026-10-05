/**
 * Custom error classes for CD48 operations
 */

/**
 * Base error class for CD48-related errors
 */
export class CD48Error extends Error {
  public override readonly name: string = 'CD48Error';

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Error thrown when Web Serial API is not supported
 */
export class UnsupportedBrowserError extends CD48Error {
  public override readonly name: string = 'UnsupportedBrowserError';

  constructor() {
    super(
      'Web Serial API not supported. Use Chrome 89+, Edge 89+, or Opera 76+.'
    );
  }
}

/**
 * Error thrown when device is not connected
 */
export class NotConnectedError extends CD48Error {
  public override readonly name: string = 'NotConnectedError';
  public readonly operation: string;

  constructor(operation: string) {
    super(
      `Cannot perform operation '${operation}' - device not connected. Call connect() first.`
    );
    this.operation = operation;
  }
}

/**
 * Error thrown when connection fails
 */
export class ConnectionError extends CD48Error {
  public override readonly name: string = 'ConnectionError';
  public readonly originalError: Error | undefined;

  constructor(message: string, cause?: Error) {
    super(`Connection failed: ${message}`);
    this.originalError = cause;
  }
}

/**
 * Error thrown when user cancels device selection
 */
export class DeviceSelectionCancelledError extends CD48Error {
  public override readonly name: string = 'DeviceSelectionCancelledError';

  constructor() {
    super('No CD48 device selected by user');
  }
}

/**
 * Error thrown when command times out
 */
export class CommandTimeoutError extends CD48Error {
  public override readonly name: string = 'CommandTimeoutError';
  public readonly command: string;
  public readonly timeout: number;

  constructor(command: string, timeout: number) {
    super(`Command '${command}' timed out after ${timeout}ms`);
    this.command = command;
    this.timeout = timeout;
  }
}

/**
 * Error thrown when response format is invalid
 */
export class InvalidResponseError extends CD48Error {
  public override readonly name: string = 'InvalidResponseError';
  public readonly response: string;
  public readonly expected: string;

  constructor(response: string, expected: string) {
    super(`Invalid response format. Got: '${response}', expected: ${expected}`);
    this.response = response;
    this.expected = expected;
  }
}

/**
 * Error thrown when parameter validation fails
 */
export class ValidationError extends CD48Error {
  public override readonly name: string = 'ValidationError';
  public readonly parameter: string;
  public readonly value: unknown;
  public readonly constraints: string;

  constructor(parameter: string, value: unknown, constraints: string) {
    super(
      `Invalid parameter '${parameter}': ${String(value)}. Constraints: ${constraints}`
    );
    this.parameter = parameter;
    this.value = value;
    this.constraints = constraints;
  }
}

/**
 * Error thrown when channel number is out of range
 */
export class InvalidChannelError extends ValidationError {
  public override readonly name: string = 'InvalidChannelError';

  constructor(channel: number) {
    super('channel', channel, '0-7');
  }
}

/**
 * Error thrown when voltage is out of range
 */
export class InvalidVoltageError extends ValidationError {
  public override readonly name: string = 'InvalidVoltageError';

  constructor(voltage: number) {
    super('voltage', voltage, '0.0-4.08V');
  }
}

/**
 * Error thrown when a measured channel's overflow bit is set.
 * The raw count would understate the rate.
 */
export class OverflowError extends CD48Error {
  public override readonly name: string = 'OverflowError';
  public readonly channels: readonly number[];
  public readonly overflow: number;

  constructor(channels: readonly number[], overflow: number) {
    super(
      `Counter overflow on channel(s) ${channels.join(', ')}; rate would be understated (overflow=${overflow})`
    );
    this.channels = channels;
    this.overflow = overflow;
  }
}

/**
 * Error thrown when communication with device fails
 */
export class CommunicationError extends CD48Error {
  public override readonly name: string = 'CommunicationError';
  public readonly originalError: Error | undefined;

  constructor(message: string, cause?: Error) {
    super(`Communication error: ${message}`);
    this.originalError = cause;
  }
}

/**
 * Error thrown when an operation is aborted
 */
export class OperationAbortedError extends CD48Error {
  public override readonly name: string = 'OperationAbortedError';
  public readonly operation: string;

  constructor(operation: string) {
    super(`Operation '${operation}' was aborted`);
    this.operation = operation;
  }
}

/**
 * Error thrown when firmware version is incompatible
 */
export class FirmwareIncompatibleError extends CD48Error {
  public override readonly name: string = 'FirmwareIncompatibleError';
  public readonly currentVersion: string;
  public readonly minimumVersion: string;

  constructor(currentVersion: string, minimumVersion: string) {
    super(
      `Firmware version ${currentVersion} is not supported. Minimum required: ${minimumVersion}`
    );
    this.currentVersion = currentVersion;
    this.minimumVersion = minimumVersion;
  }
}
