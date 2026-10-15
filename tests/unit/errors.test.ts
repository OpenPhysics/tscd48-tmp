import { describe, expect, it } from 'vitest';
import {
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
} from '../../src/errors.js';

describe('CD48 Error Classes', () => {
  describe('CD48Error', () => {
    it('should create base error with message', () => {
      const error = new CD48Error('test error');
      expect(error.message).toBe('test error');
      expect(error.name).toBe('CD48Error');
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('UnsupportedBrowserError', () => {
    it('should create error with correct message', () => {
      const error = new UnsupportedBrowserError();
      expect(error.message).toContain('Web Serial API not supported');
      expect(error.name).toBe('UnsupportedBrowserError');
      expect(error instanceof CD48Error).toBe(true);
    });
  });

  describe('NotConnectedError', () => {
    it('should create error with operation name', () => {
      const error = new NotConnectedError('getVersion');
      expect(error.message).toContain('getVersion');
      expect(error.message).toContain('not connected');
      expect(error.name).toBe('NotConnectedError');
      expect(error.operation).toBe('getVersion');
      expect(error instanceof CD48Error).toBe(true);
    });
  });

  describe('ConnectionError', () => {
    it('should create error with message and cause', () => {
      const cause = new Error('underlying error');
      const error = new ConnectionError('port busy', cause);
      expect(error.message).toContain('Connection failed');
      expect(error.message).toContain('port busy');
      expect(error.name).toBe('ConnectionError');
      expect(error.originalError).toBe(cause);
      expect(error instanceof CD48Error).toBe(true);
    });
  });

  describe('DeviceSelectionCancelledError', () => {
    it('should create error with correct message', () => {
      const error = new DeviceSelectionCancelledError();
      expect(error.message).toContain('No CD48 device selected');
      expect(error.name).toBe('DeviceSelectionCancelledError');
      expect(error instanceof CD48Error).toBe(true);
    });
  });

  describe('CommandTimeoutError', () => {
    it('should create error with command and timeout', () => {
      const error = new CommandTimeoutError('v', 1000);
      expect(error.message).toContain("Command 'v'");
      expect(error.message).toContain('timed out');
      expect(error.message).toContain('1000ms');
      expect(error.name).toBe('CommandTimeoutError');
      expect(error.command).toBe('v');
      expect(error.timeout).toBe(1000);
      expect(error instanceof CD48Error).toBe(true);
    });
  });

  describe('InvalidResponseError', () => {
    it('should create error with response and expected format', () => {
      const error = new InvalidResponseError('abc', '8 counts + overflow');
      expect(error.message).toContain('Invalid response format');
      expect(error.message).toContain('abc');
      expect(error.message).toContain('8 counts + overflow');
      expect(error.name).toBe('InvalidResponseError');
      expect(error.response).toBe('abc');
      expect(error.expected).toBe('8 counts + overflow');
      expect(error instanceof CD48Error).toBe(true);
    });
  });

  describe('ValidationError', () => {
    it('should create error with parameter details', () => {
      const error = new ValidationError('channel', 10, '0-7');
      expect(error.message).toContain('Invalid parameter');
      expect(error.message).toContain('channel');
      expect(error.message).toContain('10');
      expect(error.message).toContain('0-7');
      expect(error.name).toBe('ValidationError');
      expect(error.parameter).toBe('channel');
      expect(error.value).toBe(10);
      expect(error.constraints).toBe('0-7');
      expect(error instanceof CD48Error).toBe(true);
    });
  });

  describe('InvalidChannelError', () => {
    it('should create error for invalid channel', () => {
      const error = new InvalidChannelError(8);
      expect(error.message).toContain('channel');
      expect(error.message).toContain('8');
      expect(error.name).toBe('InvalidChannelError');
      expect(error instanceof ValidationError).toBe(true);
      expect(error instanceof CD48Error).toBe(true);
    });
  });

  describe('InvalidVoltageError', () => {
    it('should create error for invalid voltage', () => {
      const error = new InvalidVoltageError(5.5);
      expect(error.message).toContain('voltage');
      expect(error.message).toContain('5.5');
      expect(error.name).toBe('InvalidVoltageError');
      expect(error instanceof ValidationError).toBe(true);
      expect(error instanceof CD48Error).toBe(true);
    });
  });

  describe('CommunicationError', () => {
    it('should create error with message and cause', () => {
      const cause = new Error('serial port error');
      const error = new CommunicationError('read failed', cause);
      expect(error.message).toContain('Communication error');
      expect(error.message).toContain('read failed');
      expect(error.name).toBe('CommunicationError');
      expect(error.originalError).toBe(cause);
      expect(error instanceof CD48Error).toBe(true);
    });

    it('should create error without cause', () => {
      const error = new CommunicationError('read failed');
      expect(error.message).toContain('Communication error');
      expect(error.message).toContain('read failed');
      expect(error.name).toBe('CommunicationError');
      expect(error.originalError).toBeUndefined();
      expect(error instanceof CD48Error).toBe(true);
    });
  });

  describe('OverflowError', () => {
    it('should name the overflowed channels and the raw flag', () => {
      const error = new OverflowError([0, 3], 9);
      expect(error.message).toContain('channel(s) 0, 3');
      expect(error.message).toContain('overflow=9');
      expect(error.name).toBe('OverflowError');
      expect(error.channels).toEqual([0, 3]);
      expect(error.overflow).toBe(9);
      expect(error instanceof CD48Error).toBe(true);
    });
  });

  describe('OperationAbortedError', () => {
    it('should create error with operation name', () => {
      const error = new OperationAbortedError('measureRate');
      expect(error.message).toContain('measureRate');
      expect(error.message).toContain('aborted');
      expect(error.name).toBe('OperationAbortedError');
      expect(error.operation).toBe('measureRate');
      expect(error instanceof CD48Error).toBe(true);
    });
  });

  describe('FirmwareIncompatibleError', () => {
    it('should create error with version information', () => {
      const error = new FirmwareIncompatibleError('0.9.0', '1.0.0');
      expect(error.message).toContain('0.9.0');
      expect(error.message).toContain('not supported');
      expect(error.message).toContain('1.0.0');
      expect(error.name).toBe('FirmwareIncompatibleError');
      expect(error.currentVersion).toBe('0.9.0');
      expect(error.minimumVersion).toBe('1.0.0');
      expect(error instanceof CD48Error).toBe(true);
    });
  });

  describe('ConnectionError without cause', () => {
    it('should create error without cause', () => {
      const error = new ConnectionError('port not found');
      expect(error.message).toContain('Connection failed');
      expect(error.message).toContain('port not found');
      expect(error.name).toBe('ConnectionError');
      expect(error.originalError).toBeUndefined();
      expect(error instanceof CD48Error).toBe(true);
    });
  });
});
