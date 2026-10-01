/**
 * CD48 Coincidence Counter - Web Serial API Interface
 *
 * A TypeScript library for controlling the Red Dog Physics CD48
 * Coincidence Counter via the Web Serial API.
 *
 * Requires Chrome 89+ or Edge 89+
 *
 * @example
 * const cd48 = new CD48();
 * await cd48.connect();
 * const version = await cd48.getVersion();
 * console.log('Firmware:', version);
 * const counts = await cd48.getCounts();
 * console.log('Counts:', counts);
 * await cd48.disconnect();
 */

import {
  ACCIDENTAL_RATE_MULTIPLIER,
  BAUD_RATE,
  COINCIDENCE_WINDOW_SECONDS,
  COMMAND_DELAY_MS,
  COMMAND_TIMEOUT_MS,
  CONNECTION_INIT_DELAY_MS,
  DECIMAL_RADIX,
  DEFAULT_COINCIDENCE_CHANNEL,
  DEFAULT_COMMAND_RETRIES,
  DEFAULT_MEASUREMENT_DURATION,
  DEFAULT_RETRY_DELAY_MS,
  DEFAULT_SINGLES_A_CHANNEL,
  DEFAULT_SINGLES_B_CHANNEL,
  EXPECTED_CHANNEL_COUNT,
  EXPECTED_COUNT_RESPONSE_LENGTH,
  MILLISECONDS_PER_SECOND,
  MIN_FIRMWARE_MAJOR,
  MIN_FIRMWARE_MINOR,
  MIN_FIRMWARE_PATCH,
  MIN_FIRMWARE_VERSION,
  PERCENT_CONVERSION,
  READ_TIMEOUT_INTERVAL_MS,
  RECONNECT_ATTEMPTS,
  RECONNECT_DELAY_MS,
  USB_VENDOR_ID,
  WEB_LOCK_NAME,
} from './constants.js';
import {
  CommandTimeoutError,
  CommunicationError,
  ConnectionError,
  DeviceSelectionCancelledError,
  FirmwareIncompatibleError,
  InvalidResponseError,
  NotConnectedError,
  OperationAbortedError,
  UnsupportedBrowserError,
} from './errors.js';
import {
  byteToVoltage,
  REPEAT_INTERVAL_MAX,
  REPEAT_INTERVAL_MIN,
  validateChannel,
  voltageToByte,
} from './validation.js';

/**
 * CD48 configuration options
 */
export interface CD48Options {
  /** Baud rate (default: 115200) */
  baudRate?: number;
  /** Delay after commands in ms (default: 50) */
  commandDelay?: number;
  /** Enable auto-reconnection (default: false) */
  autoReconnect?: boolean;
  /** Max reconnection attempts (default: 5) */
  reconnectAttempts?: number;
  /** Delay between reconnect attempts in ms (default: 1000) */
  reconnectDelay?: number;
  /** Minimum ms between commands (default: 0) */
  rateLimitMs?: number;
  /** Number of retries for failed commands (default: 0) */
  commandRetries?: number;
  /** Delay between retries in ms (default: 100) */
  retryDelay?: number;
  /** Use Web Locks API to prevent concurrent commands (default: false) */
  useWebLocks?: boolean;
}

/**
 * Connection state for the CD48 device
 */
export type ConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting';

/**
 * Connection state change event data
 */
export interface ConnectionStateChangeData {
  readonly previousState: ConnectionState;
  readonly currentState: ConnectionState;
}

/**
 * Connection state change callback type
 */
export type ConnectionStateChangeCallback = (
  data: ConnectionStateChangeData
) => void;

/**
 * Measurement options with abort support
 */
export interface MeasurementOptions {
  /** AbortSignal to cancel the measurement */
  signal?: AbortSignal;
}

/**
 * Channel input configuration
 */
export interface ChannelInputs {
  A?: 0 | 1;
  B?: 0 | 1;
  C?: 0 | 1;
  D?: 0 | 1;
}

/**
 * Count data from device
 */
export interface CountData {
  readonly counts: ReadonlyArray<number>;
  readonly overflow: number;
}

/**
 * Measurement uncertainty data
 */
export interface MeasurementUncertainty {
  readonly counts: number;
  readonly rate: number;
  readonly relative: number;
}

/**
 * Rate measurement result
 */
export interface RateMeasurement {
  readonly counts: number;
  readonly duration: number;
  readonly rate: number;
  readonly channel: number;
  readonly uncertainty: Readonly<MeasurementUncertainty>;
}

/**
 * Coincidence measurement uncertainty
 */
export interface CoincidenceUncertainty {
  readonly singlesA: number;
  readonly singlesB: number;
  readonly coincidences: number;
  readonly rateA: number;
  readonly rateB: number;
  readonly coincidenceRate: number;
  readonly accidentalRate: number;
  readonly trueCoincidenceRate: number;
}

/**
 * Coincidence measurement options
 */
export interface CoincidenceMeasurementOptions extends MeasurementOptions {
  /** Measurement duration in seconds */
  duration?: number;
  /** Channel for singles A (default: 0) */
  singlesAChannel?: number;
  /** Channel for singles B (default: 1) */
  singlesBChannel?: number;
  /** Channel for coincidences (default: 4) */
  coincidenceChannel?: number;
  /** Window in seconds (default: 25e-9) */
  coincidenceWindow?: number;
}

/**
 * Coincidence measurement result
 */
export interface CoincidenceMeasurement {
  readonly singlesA: number;
  readonly singlesB: number;
  readonly coincidences: number;
  readonly duration: number;
  readonly rateA: number;
  readonly rateB: number;
  readonly coincidenceRate: number;
  readonly accidentalRate: number;
  readonly trueCoincidenceRate: number;
  readonly uncertainty: Readonly<CoincidenceUncertainty>;
}

/**
 * Reconnect event data
 */
export interface ReconnectEventData {
  readonly attempt: number;
}

/**
 * Reconnect failed event data
 */
export interface ReconnectFailedEventData {
  readonly attempts: number;
}

/**
 * Disconnect callback type
 */
export type DisconnectCallback = () => void;

/**
 * Reconnect callback type
 */
export type ReconnectCallback = (data: ReconnectEventData) => void;

/**
 * Reconnect failed callback type
 */
export type ReconnectFailedCallback = (data: ReconnectFailedEventData) => void;

/**
 * Firmware version information
 */
export interface FirmwareInfo {
  /** Raw version string from device */
  readonly versionString: string;
  /** Parsed major version number */
  readonly major: number;
  /** Parsed minor version number */
  readonly minor: number;
  /** Parsed patch version number */
  readonly patch: number;
  /** Whether this version meets minimum requirements */
  readonly isCompatible: boolean;
  /** Minimum supported version string */
  readonly minimumVersion: string;
}

/**
 * Read result with timeout flag
 */
interface ReadResult {
  value: string;
  done: boolean;
  timeout?: boolean;
}

/**
 * CD48 Coincidence Counter interface class
 */
class CD48 {
  private readonly baudRate: number;
  private readonly commandDelay: number;
  private readonly autoReconnect: boolean;
  private readonly reconnectAttempts: number;
  private readonly reconnectDelay: number;
  private readonly rateLimitMs: number;
  private readonly commandRetries: number;
  private readonly retryDelay: number;
  private readonly useWebLocks: boolean;
  private port: SerialPort | null;
  private reader: ReadableStreamDefaultReader<string> | null;
  private writer: WritableStreamDefaultWriter<string> | null;
  private readableStreamClosed: Promise<void> | null;
  private writableStreamClosed: Promise<void> | null;
  private _lastCommandTime: number;
  private _rateLimitLock: Promise<void>;
  private _reconnecting: boolean;
  private _connectionState: ConnectionState;
  private _onDisconnect: DisconnectCallback | null;
  private _onReconnect: ReconnectCallback | null;
  private _onReconnectFailed: ReconnectFailedCallback | null;
  private _onConnectionStateChange: ConnectionStateChangeCallback | null;
  private _boundHandleDisconnect: (() => void) | null;

  /**
   * Create a CD48 interface instance.
   * @param options - Configuration options
   */
  constructor(options: CD48Options = {}) {
    this.baudRate = options.baudRate ?? BAUD_RATE;
    this.commandDelay = options.commandDelay ?? COMMAND_DELAY_MS;
    this.autoReconnect = options.autoReconnect ?? false;
    this.reconnectAttempts = options.reconnectAttempts ?? RECONNECT_ATTEMPTS;
    this.reconnectDelay = options.reconnectDelay ?? RECONNECT_DELAY_MS;
    this.rateLimitMs = options.rateLimitMs ?? 0;
    this.commandRetries = options.commandRetries ?? DEFAULT_COMMAND_RETRIES;
    this.retryDelay = options.retryDelay ?? DEFAULT_RETRY_DELAY_MS;
    this.useWebLocks = options.useWebLocks ?? false;
    this.port = null;
    this.reader = null;
    this.writer = null;
    this.readableStreamClosed = null;
    this.writableStreamClosed = null;
    this._lastCommandTime = 0;
    this._rateLimitLock = Promise.resolve();
    this._reconnecting = false;
    this._connectionState = 'disconnected';
    this._onDisconnect = null;
    this._onReconnect = null;
    this._onReconnectFailed = null;
    this._onConnectionStateChange = null;
    this._boundHandleDisconnect = null;
  }

  /**
   * Check if Web Serial API is supported.
   * @returns True if supported
   */
  public static isSupported(): boolean {
    return 'serial' in navigator;
  }

  /**
   * Check if Web Locks API is supported.
   * @returns True if supported
   */
  public static isWebLocksSupported(): boolean {
    return 'locks' in navigator;
  }

  /**
   * Get trigger level as voltage.
   * @param byteValue - Raw byte value (0-255)
   * @returns Voltage (0.0 to 4.08V)
   */
  public static byteToVoltage(byteValue: number): number {
    return byteToVoltage(byteValue);
  }

  /**
   * Parse firmware version string into components.
   * Handles formats like "CD48 v1.2.3", "1.2.3", "v1.2", etc.
   * @param versionString - Raw version string from device
   * @returns Parsed version components
   */
  public static parseFirmwareVersion(versionString: string): {
    major: number;
    minor: number;
    patch: number;
  } {
    // Extract version number pattern (e.g., "1.2.3" or "1.2"). Bounded repeats
    // avoid polynomial backtracking on crafted inputs (CodeQL js/polynomial-redos).
    const match = versionString.match(
      /(\d{1,10})\.(\d{1,10})(?:\.(\d{1,10}))?/
    );
    if (match !== null) {
      return {
        major: Number.parseInt(match[1] ?? '0', DECIMAL_RADIX),
        minor: Number.parseInt(match[2] ?? '0', DECIMAL_RADIX),
        patch: Number.parseInt(match[3] ?? '0', DECIMAL_RADIX),
      };
    }
    // If no pattern found, return zeros
    return { major: 0, minor: 0, patch: 0 };
  }

  /**
   * Compare two firmware versions.
   * @param a - First version
   * @param b - Second version
   * @returns Negative if a < b, positive if a > b, zero if equal
   */
  public static compareFirmwareVersions(
    a: { major: number; minor: number; patch: number },
    b: { major: number; minor: number; patch: number }
  ): number {
    if (a.major !== b.major) return a.major - b.major;
    if (a.minor !== b.minor) return a.minor - b.minor;
    return a.patch - b.patch;
  }

  /**
   * Set callback for disconnect events.
   * @param callback - Function called on disconnect
   */
  public onDisconnect(callback: DisconnectCallback): void {
    this._onDisconnect = callback;
  }

  /**
   * Set callback for reconnect events.
   * @param callback - Function called on successful reconnect
   */
  public onReconnect(callback: ReconnectCallback): void {
    this._onReconnect = callback;
  }

  /**
   * Set callback for reconnect failed events.
   * @param callback - Function called when all reconnection attempts fail
   */
  public onReconnectFailed(callback: ReconnectFailedCallback): void {
    this._onReconnectFailed = callback;
  }

  /**
   * Set callback for connection state change events.
   * @param callback - Function called when connection state changes
   */
  public onConnectionStateChange(
    callback: ConnectionStateChangeCallback
  ): void {
    this._onConnectionStateChange = callback;
  }

  /**
   * Get current connection state.
   * @returns Current connection state
   */
  public getConnectionState(): ConnectionState {
    return this._connectionState;
  }

  /**
   * Connect to the CD48 device.
   * Opens a serial port picker dialog for the user.
   * @returns True if connected successfully
   */
  public async connect(): Promise<boolean> {
    if (!CD48.isSupported()) {
      throw new UnsupportedBrowserError();
    }

    this._setConnectionState('connecting');

    try {
      // Request port with Cypress VID filter
      this.port = await navigator.serial.requestPort({
        filters: [{ usbVendorId: USB_VENDOR_ID }], // Cypress Semiconductor
      });

      await this._setupConnection();
      this._setConnectionState('connected');
      return true;
    } catch (error) {
      await this._cleanupConnection();
      this._setConnectionState('disconnected');
      if (error instanceof Error && error.name === 'NotFoundError') {
        throw new DeviceSelectionCancelledError();
      }
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorCause = error instanceof Error ? error : undefined;
      throw new ConnectionError(errorMessage, errorCause);
    }
  }

  /**
   * Attempt to reconnect to the device.
   * @returns True if reconnected successfully
   */
  public async reconnect(): Promise<boolean> {
    if (this._reconnecting) {
      return false;
    }

    this._reconnecting = true;
    this._setConnectionState('reconnecting');

    try {
      // Clean up existing connection
      await this._cleanupConnection();

      // Get previously granted ports
      const ports = await navigator.serial.getPorts();
      const cd48Port = ports.find((p) => {
        const info = p.getInfo();
        return info.usbVendorId === USB_VENDOR_ID;
      });

      if (cd48Port === undefined) {
        this._setConnectionState('disconnected');
        throw new ConnectionError('No previously connected CD48 device found');
      }

      this.port = cd48Port;
      await this._setupConnection();
      this._setConnectionState('connected');

      return true;
    } catch (error) {
      await this._cleanupConnection();
      this._setConnectionState('disconnected');
      throw error;
    } finally {
      this._reconnecting = false;
    }
  }

  /**
   * Disconnect from the CD48 device.
   */
  public async disconnect(): Promise<void> {
    await this._cleanupConnection();
    this._setConnectionState('disconnected');
    if (this._onDisconnect !== null) {
      this._onDisconnect();
    }
  }

  /**
   * Check if connected to device.
   * @returns True if connected
   */
  public isConnected(): boolean {
    return this.port !== null && this.reader !== null;
  }

  /**
   * Sleep for specified milliseconds.
   * @param ms - Milliseconds to sleep
   */
  public async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Sleep for specified milliseconds with abort support.
   * @param ms - Milliseconds to sleep
   * @param signal - Optional AbortSignal to cancel the sleep
   * @throws OperationAbortedError if aborted
   */
  public async sleepWithAbort(ms: number, signal?: AbortSignal): Promise<void> {
    if (signal?.aborted === true) {
      throw new OperationAbortedError('sleep');
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(resolve, ms);

      if (signal !== undefined) {
        const abortHandler = (): void => {
          clearTimeout(timeoutId);
          reject(new OperationAbortedError('sleep'));
        };

        signal.addEventListener('abort', abortHandler, { once: true });

        // Clean up abort listener after sleep completes
        setTimeout(() => {
          signal.removeEventListener('abort', abortHandler);
        }, ms + 1);
      }
    });
  }

  /**
   * Send a command and read the response.
   * Includes automatic retry logic for transient errors.
   * Uses Web Locks API when enabled to prevent concurrent commands.
   * @param command - Command to send
   * @returns Response from device
   */
  public async sendCommand(command: string): Promise<string> {
    // Use Web Locks if enabled and supported
    if (this.useWebLocks && CD48.isWebLocksSupported()) {
      return navigator.locks.request(WEB_LOCK_NAME, async () => {
        return this._sendCommandWithRetry(command);
      });
    }
    return this._sendCommandWithRetry(command);
  }

  /**
   * Get firmware version.
   * @returns Firmware version string
   */
  public async getVersion(): Promise<string> {
    return await this.sendCommand('v');
  }

  /**
   * Get detailed firmware information including compatibility status.
   * @returns Firmware information with compatibility check
   */
  public async getFirmwareInfo(): Promise<FirmwareInfo> {
    const versionString = await this.getVersion();
    const { major, minor, patch } = CD48.parseFirmwareVersion(versionString);
    const minVersion = {
      major: MIN_FIRMWARE_MAJOR,
      minor: MIN_FIRMWARE_MINOR,
      patch: MIN_FIRMWARE_PATCH,
    };
    const isCompatible =
      CD48.compareFirmwareVersions({ major, minor, patch }, minVersion) >= 0;

    return {
      versionString,
      major,
      minor,
      patch,
      isCompatible,
      minimumVersion: MIN_FIRMWARE_VERSION,
    };
  }

  /**
   * Check if the connected device has compatible firmware.
   * @throws FirmwareIncompatibleError if firmware is too old
   * @returns Firmware info if compatible
   */
  public async checkFirmwareCompatibility(): Promise<FirmwareInfo> {
    const info = await this.getFirmwareInfo();
    if (!info.isCompatible) {
      throw new FirmwareIncompatibleError(
        `${info.major}.${info.minor}.${info.patch}`,
        info.minimumVersion
      );
    }
    return info;
  }

  /**
   * Get help text from device.
   * @returns Help text
   */
  public async getHelp(): Promise<string> {
    return await this.sendCommand('H');
  }

  /**
   * Get current counts from all channels.
   * @param humanReadable - If true, returns formatted string
   * @returns Counts data or formatted string
   */
  public async getCounts(humanReadable: true): Promise<string>;
  public async getCounts(humanReadable?: false): Promise<CountData>;
  public async getCounts(humanReadable = false): Promise<CountData | string> {
    if (humanReadable) {
      return await this.sendCommand('C');
    }

    const response = await this.sendCommand('c');
    const parts = response.split(/\s+/).filter((p) => p.length > 0);

    if (parts.length >= EXPECTED_COUNT_RESPONSE_LENGTH) {
      return {
        counts: parts.slice(0, EXPECTED_CHANNEL_COUNT).map(Number),
        overflow: Number.parseInt(
          parts[EXPECTED_CHANNEL_COUNT] ?? '0',
          DECIMAL_RADIX
        ),
      };
    }

    throw new InvalidResponseError(
      response,
      `${EXPECTED_CHANNEL_COUNT} counts + overflow flag`
    );
  }

  /**
   * Clear all counters by reading them.
   */
  public async clearCounts(): Promise<void> {
    await this.getCounts(false);
  }

  /**
   * Get current settings.
   * @param humanReadable - If true, returns formatted string
   * @returns Settings string
   */
  public async getSettings(humanReadable = true): Promise<string> {
    return await this.sendCommand(humanReadable ? 'P' : 'p');
  }

  /**
   * Configure a counter channel.
   * @param channel - Channel number (0-7)
   * @param inputs - Input configuration
   * @returns Response from device
   */
  public async setChannel(
    channel: number,
    inputs: ChannelInputs = {}
  ): Promise<string> {
    validateChannel(channel);
    const { A = 0, B = 0, C = 0, D = 0 } = inputs;
    return await this.sendCommand(`S${channel}${A}${B}${C}${D}`);
  }

  /**
   * Set trigger level voltage.
   * @param voltage - Voltage threshold (0.0 to 4.08V)
   * @returns Response from device
   */
  public async setTriggerLevel(voltage: number): Promise<string> {
    // Clamp voltage to valid range instead of throwing
    const byteVal = voltageToByte(voltage);
    return await this.sendCommand(`L${byteVal}`);
  }

  /**
   * Set input impedance to 50 Ohms.
   * @returns Response from device
   */
  public async setImpedance50Ohm(): Promise<string> {
    return await this.sendCommand('z');
  }

  /**
   * Set input impedance to High-Z.
   * @returns Response from device
   */
  public async setImpedanceHighZ(): Promise<string> {
    return await this.sendCommand('Z');
  }

  /**
   * Set automatic repeat interval.
   * @param intervalMs - Interval in milliseconds (100-65535)
   * @returns Response from device
   */
  public async setRepeat(intervalMs: number): Promise<string> {
    const clamped = Math.max(
      REPEAT_INTERVAL_MIN,
      Math.min(REPEAT_INTERVAL_MAX, intervalMs)
    );
    return await this.sendCommand(`r${clamped}`);
  }

  /**
   * Toggle automatic repeat mode.
   * @returns Response from device
   */
  public async toggleRepeat(): Promise<string> {
    return await this.sendCommand('R');
  }

  /**
   * Set DAC output voltage.
   * @param voltage - Output voltage (0.0 to 4.08V)
   * @returns Response from device
   */
  public async setDacVoltage(voltage: number): Promise<string> {
    const byteVal = voltageToByte(voltage);
    return await this.sendCommand(`V${byteVal}`);
  }

  /**
   * Get and clear overflow status.
   * @returns 8-bit overflow flag
   */
  public async getOverflow(): Promise<number> {
    const response = await this.sendCommand('E');
    const overflow = Number.parseInt(response, DECIMAL_RADIX);
    if (Number.isNaN(overflow)) {
      throw new InvalidResponseError(response, '8-bit overflow flag');
    }
    return overflow;
  }

  /**
   * Test all LEDs (lights for 1 second).
   * @returns Response from device
   */
  public async testLeds(): Promise<string> {
    return await this.sendCommand('T');
  }

  /**
   * Measure count rate on a channel with Poisson uncertainty.
   * @param channel - Channel number (0-7)
   * @param duration - Measurement duration in seconds
   * @param options - Optional measurement options including AbortSignal
   * @returns Rate measurement result with uncertainties
   * @throws OperationAbortedError if aborted via signal
   */
  public async measureRate(
    channel = 0,
    duration = DEFAULT_MEASUREMENT_DURATION,
    options?: MeasurementOptions
  ): Promise<RateMeasurement> {
    validateChannel(channel);

    // Check if already aborted
    if (options?.signal?.aborted === true) {
      throw new OperationAbortedError('measureRate');
    }

    await this.clearCounts();
    await this.sleepWithAbort(
      duration * MILLISECONDS_PER_SECOND,
      options?.signal
    );
    const data = await this.getCounts(false);
    const counts = data.counts[channel] ?? 0;
    const rate = counts / duration;

    // Poisson uncertainty: sigma_N = sqrt(N)
    const countUncertainty = Math.sqrt(Math.max(0, counts));
    // Rate uncertainty: sigma_R = sigma_N / T
    const rateUncertainty = countUncertainty / duration;
    // Relative uncertainty as percentage
    const relativeUncertainty =
      counts > 0 ? (countUncertainty / counts) * PERCENT_CONVERSION : 0;

    return {
      counts,
      duration,
      rate,
      channel,
      uncertainty: {
        counts: countUncertainty,
        rate: rateUncertainty,
        relative: relativeUncertainty,
      },
    };
  }

  /**
   * Measure coincidence rate with accidental correction and uncertainties.
   * @param options - Measurement options
   * @returns Coincidence measurement result with uncertainties
   * @throws OperationAbortedError if aborted via signal
   */
  public async measureCoincidenceRate(
    options: CoincidenceMeasurementOptions = {}
  ): Promise<CoincidenceMeasurement> {
    const {
      duration = DEFAULT_MEASUREMENT_DURATION,
      singlesAChannel = DEFAULT_SINGLES_A_CHANNEL,
      singlesBChannel = DEFAULT_SINGLES_B_CHANNEL,
      coincidenceChannel = DEFAULT_COINCIDENCE_CHANNEL,
      coincidenceWindow = COINCIDENCE_WINDOW_SECONDS,
      signal,
    } = options;

    // Check if already aborted
    if (signal?.aborted === true) {
      throw new OperationAbortedError('measureCoincidenceRate');
    }

    await this.clearCounts();
    await this.sleepWithAbort(duration * MILLISECONDS_PER_SECOND, signal);
    const data = await this.getCounts(false);

    const singlesA = data.counts[singlesAChannel] ?? 0;
    const singlesB = data.counts[singlesBChannel] ?? 0;
    const coincidences = data.counts[coincidenceChannel] ?? 0;

    const rateA = singlesA / duration;
    const rateB = singlesB / duration;
    const coincidenceRate = coincidences / duration;
    const accidentalRate =
      ACCIDENTAL_RATE_MULTIPLIER * coincidenceWindow * rateA * rateB;
    const trueCoincidenceRate = Math.max(0, coincidenceRate - accidentalRate);

    // Poisson uncertainties for counts
    const sigmaA = Math.sqrt(Math.max(0, singlesA));
    const sigmaB = Math.sqrt(Math.max(0, singlesB));
    const sigmaC = Math.sqrt(Math.max(0, coincidences));

    // Rate uncertainties
    const rateAUncertainty = sigmaA / duration;
    const rateBUncertainty = sigmaB / duration;
    const coincidenceRateUncertainty = sigmaC / duration;

    // Accidental rate uncertainty (error propagation)
    // sigma_acc = 2 * tau * sqrt((R_B * sigma_A)^2 + (R_A * sigma_B)^2) / T
    const accidentalRateUncertainty =
      ((ACCIDENTAL_RATE_MULTIPLIER * coincidenceWindow) / duration) *
      Math.sqrt((rateB * sigmaA) ** 2 + (rateA * sigmaB) ** 2);

    // True coincidence rate uncertainty (quadrature sum)
    const trueCoincidenceRateUncertainty = Math.sqrt(
      coincidenceRateUncertainty ** 2 + accidentalRateUncertainty ** 2
    );

    return {
      singlesA,
      singlesB,
      coincidences,
      duration,
      rateA,
      rateB,
      coincidenceRate,
      accidentalRate,
      trueCoincidenceRate,
      uncertainty: {
        singlesA: sigmaA,
        singlesB: sigmaB,
        coincidences: sigmaC,
        rateA: rateAUncertainty,
        rateB: rateBUncertainty,
        coincidenceRate: coincidenceRateUncertainty,
        accidentalRate: accidentalRateUncertainty,
        trueCoincidenceRate: trueCoincidenceRateUncertainty,
      },
    };
  }

  /**
   * Update connection state and notify listeners.
   * @param newState - New connection state
   */
  private _setConnectionState(newState: ConnectionState): void {
    const previousState = this._connectionState;
    if (previousState !== newState) {
      this._connectionState = newState;
      if (this._onConnectionStateChange !== null) {
        this._onConnectionStateChange({
          previousState,
          currentState: newState,
        });
      }
    }
  }

  /**
   * Send a command with retry logic.
   * @param command - Command to send
   * @returns Response from device
   */
  private async _sendCommandWithRetry(command: string): Promise<string> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.commandRetries; attempt++) {
      try {
        return await this._sendCommandOnce(command);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry for non-retryable errors
        if (
          error instanceof NotConnectedError ||
          error instanceof InvalidResponseError
        ) {
          throw error;
        }

        // If we have retries left, wait and try again
        if (attempt < this.commandRetries) {
          if (error instanceof CommandTimeoutError) {
            // The timed-out read closed the stream; retry on a fresh port.
            await this.reconnect();
          }
          await this.sleep(this.retryDelay * (attempt + 1));
        }
      }
    }

    // All retries exhausted, throw the last error
    throw lastError ?? new CommunicationError('Unknown error after retries');
  }

  /**
   * Send a command once without retry logic.
   * @param command - Command to send
   * @returns Response from device
   */
  private async _sendCommandOnce(command: string): Promise<string> {
    if (!this.isConnected()) {
      // Attempt auto-reconnect if enabled
      if (this.autoReconnect) {
        const reconnected = await this._attemptAutoReconnect();
        if (!reconnected) {
          throw new NotConnectedError('sendCommand');
        }
      } else {
        throw new NotConnectedError('sendCommand');
      }
    }

    // Apply rate limiting
    await this._applyRateLimit();

    try {
      if (this.writer === null || this.reader === null) {
        throw new NotConnectedError('sendCommand');
      }

      // Clear any pending data
      await this.writer.write(`${command}\r`);
      await this.sleep(this.commandDelay);

      // Read response with timeout. A single reader.read() call is kept
      // pending across loop iterations - reissuing read() while an earlier
      // call is still outstanding would queue both on the stream, and any
      // data that arrives resolves the OLDEST queued read first, silently
      // dropping it since nothing awaits that earlier promise anymore.
      let response = '';
      const startTime = Date.now();
      const timeout = COMMAND_TIMEOUT_MS;
      let pendingRead: Promise<ReadResult> | null = null;

      while (Date.now() - startTime < timeout) {
        pendingRead ??= this.reader
          .read()
          .then((result) => ({ value: result.value ?? '', done: result.done }));

        const timeoutPromise: Promise<ReadResult> = this.sleep(
          READ_TIMEOUT_INTERVAL_MS
        ).then(() => ({
          value: '',
          done: false,
          timeout: true,
        }));

        const result = await Promise.race([pendingRead, timeoutPromise]);

        if (result.timeout === true) {
          // The read is still outstanding; keep racing the same promise.
          continue;
        }
        pendingRead = null;

        if (result.done) break;
        if (result.value !== '') response += result.value;

        // Check if we have a complete response
        if (response.includes('\r') || response.includes('\n')) {
          break;
        }
      }

      // Check if we timed out
      if (
        Date.now() - startTime >= timeout &&
        (pendingRead !== null || response === '')
      ) {
        throw new CommandTimeoutError(command, timeout);
      }

      return response.trim();
    } catch (error) {
      if (error instanceof CommandTimeoutError) {
        // The final reader.read() may still be pending when the deadline wins.
        // Cancel it before another command (or retry) can lose its reply.
        await this._cleanupConnection();
        this._setConnectionState('disconnected');
        throw error;
      }
      if (error instanceof NotConnectedError) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorCause = error instanceof Error ? error : undefined;
      throw new CommunicationError(errorMessage, errorCause);
    }
  }

  /**
   * Set up connection streams after port is opened.
   */
  private async _setupConnection(): Promise<void> {
    if (this.port === null) {
      throw new ConnectionError('No port available');
    }

    await this.port.open({ baudRate: this.baudRate });

    // Set up reader and writer
    const textDecoder = new TextDecoderStream();
    const readable = this.port.readable;
    if (readable === null) {
      throw new ConnectionError('Port readable stream not available');
    }
    /**
     * Type assertions needed here because Web Serial API uses BufferSource
     * but TextDecoderStream expects Uint8Array. They're compatible at runtime
     * since BufferSource = ArrayBuffer | ArrayBufferView (which includes Uint8Array)
     */
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    this.readableStreamClosed = (readable as ReadableStream<Uint8Array>).pipeTo(
      textDecoder.writable as WritableStream<Uint8Array>
    );
    this.reader = textDecoder.readable.getReader();

    const textEncoder = new TextEncoderStream();
    const writable = this.port.writable;
    if (writable === null) {
      throw new ConnectionError('Port writable stream not available');
    }
    this.writableStreamClosed = textEncoder.readable.pipeTo(
      writable as WritableStream<Uint8Array> // eslint-disable-line @typescript-eslint/no-unnecessary-type-assertion
    );
    this.writer = textEncoder.writable.getWriter();

    // Set up disconnect event listener for auto-reconnection
    this._boundHandleDisconnect = () => {
      void this._handleDisconnect();
    };
    this.port.addEventListener('disconnect', this._boundHandleDisconnect);

    // Wait for device to initialize
    await this.sleep(CONNECTION_INIT_DELAY_MS);
  }

  /**
   * Attempt auto-reconnection with retries.
   * @returns True if reconnected successfully
   */
  private async _attemptAutoReconnect(): Promise<boolean> {
    if (!this.autoReconnect || this._reconnecting) {
      return false;
    }

    for (let attempt = 1; attempt <= this.reconnectAttempts; attempt++) {
      try {
        await this.sleep(this.reconnectDelay * attempt);
        const success = await this.reconnect();
        if (success) {
          if (this._onReconnect !== null) {
            this._onReconnect({ attempt });
          }
          return true;
        }
      } catch {
        // Continue to next attempt
      }
    }

    if (this._onReconnectFailed !== null) {
      this._onReconnectFailed({ attempts: this.reconnectAttempts });
    }
    return false;
  }

  /**
   * Handle unexpected disconnection.
   * Triggers auto-reconnection if enabled.
   */
  private async _handleDisconnect(): Promise<void> {
    if (this._onDisconnect !== null) {
      this._onDisconnect();
    }

    if (this.autoReconnect) {
      await this._attemptAutoReconnect();
    }
  }

  /**
   * Clean up connection resources.
   */
  private async _cleanupConnection(): Promise<void> {
    if (this.reader !== null) {
      try {
        await this.reader.cancel();
        if (this.readableStreamClosed !== null) {
          await this.readableStreamClosed.catch(() => {});
        }
      } catch {
        // Ignore cleanup errors
      }
      this.reader = null;
    }
    if (this.writer !== null) {
      try {
        await this.writer.close();
        if (this.writableStreamClosed !== null) {
          await this.writableStreamClosed;
        }
      } catch {
        // Ignore cleanup errors
      }
      this.writer = null;
    }
    if (this.port !== null) {
      // Remove disconnect listener before closing
      if (this._boundHandleDisconnect !== null) {
        this.port.removeEventListener(
          'disconnect',
          this._boundHandleDisconnect
        );
        this._boundHandleDisconnect = null;
      }
      try {
        await this.port.close();
      } catch {
        // Ignore cleanup errors
      }
      this.port = null;
    }
  }

  /**
   * Apply rate limiting between commands using a mutex pattern.
   * This prevents race conditions when multiple commands are queued.
   */
  private async _applyRateLimit(): Promise<void> {
    // Chain onto the existing lock promise to serialize rate limiting
    const previousLock = this._rateLimitLock;

    // Create a new promise that will resolve when this command's rate limiting is done
    let resolveCurrentLock: (() => void) | undefined;
    this._rateLimitLock = new Promise((resolve) => {
      resolveCurrentLock = resolve;
    });

    try {
      // Wait for any previous rate-limited command to complete
      await previousLock;

      // Apply rate limiting if configured
      if (this.rateLimitMs > 0) {
        const elapsed = Date.now() - this._lastCommandTime;
        if (elapsed < this.rateLimitMs) {
          await this.sleep(this.rateLimitMs - elapsed);
        }
      }
      this._lastCommandTime = Date.now();
    } finally {
      // Release the lock for the next command
      if (resolveCurrentLock !== undefined) {
        resolveCurrentLock();
      }
    }
  }
}

export default CD48;
