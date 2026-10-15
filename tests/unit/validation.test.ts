import { describe, expect, it } from 'vitest';
import {
  InvalidChannelError,
  InvalidVoltageError,
  ValidationError,
} from '../../src/errors.js';
import type { Channel, Voltage } from '../../src/validation.js';
import {
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
} from '../../src/validation.js';

describe('Validation Constants', () => {
  it('should have correct channel range', () => {
    expect(CHANNEL_MIN).toBe(0);
    expect(CHANNEL_MAX).toBe(7);
  });

  it('should have correct voltage range', () => {
    expect(VOLTAGE_MIN).toBe(0.0);
    expect(VOLTAGE_MAX).toBe(4.08);
  });

  it('should have correct byte range', () => {
    expect(BYTE_MIN).toBe(0);
    expect(BYTE_MAX).toBe(255);
  });

  it('should have correct repeat interval range', () => {
    expect(REPEAT_INTERVAL_MIN).toBe(100);
    expect(REPEAT_INTERVAL_MAX).toBe(65535);
  });
});

describe('validateBinaryInput', () => {
  it('should accept 0 and 1', () => {
    expect(() => validateBinaryInput('A', 0)).not.toThrow();
    expect(() => validateBinaryInput('B', 1)).not.toThrow();
  });

  it('should reject non-numbers', () => {
    expect(() => validateBinaryInput('A', Number.NaN)).toThrow(ValidationError);
    expect(() => validateBinaryInput('A', '1' as unknown as number)).toThrow(
      ValidationError
    );
  });

  it('should reject values other than 0 or 1', () => {
    expect(() => validateBinaryInput('C', 2)).toThrow(ValidationError);
    expect(() => validateBinaryInput('D', 1.5)).toThrow(ValidationError);
  });
});

describe('validateChannel', () => {
  it('should accept valid channels', () => {
    expect(() => validateChannel(0)).not.toThrow();
    expect(() => validateChannel(3)).not.toThrow();
    expect(() => validateChannel(7)).not.toThrow();
  });

  it('should throw InvalidChannelError for out of range values', () => {
    expect(() => validateChannel(-1)).toThrow(InvalidChannelError);
    expect(() => validateChannel(8)).toThrow(InvalidChannelError);
    expect(() => validateChannel(100)).toThrow(InvalidChannelError);
  });

  it('should throw ValidationError for non-number values', () => {
    expect(() => validateChannel('0' as unknown as number)).toThrow(
      ValidationError
    );
    expect(() => validateChannel(null as unknown as number)).toThrow(
      ValidationError
    );
    expect(() => validateChannel(undefined as unknown as number)).toThrow(
      ValidationError
    );
    expect(() => validateChannel(Number.NaN)).toThrow(ValidationError);
  });
});

describe('validateVoltage', () => {
  it('should accept valid voltages', () => {
    expect(() => validateVoltage(0)).not.toThrow();
    expect(() => validateVoltage(2.04)).not.toThrow();
    expect(() => validateVoltage(4.08)).not.toThrow();
  });

  it('should throw InvalidVoltageError for out of range values', () => {
    expect(() => validateVoltage(-0.1)).toThrow(InvalidVoltageError);
    expect(() => validateVoltage(4.09)).toThrow(InvalidVoltageError);
    expect(() => validateVoltage(10)).toThrow(InvalidVoltageError);
  });

  it('should throw ValidationError for non-number values', () => {
    expect(() => validateVoltage('2.0' as unknown as number)).toThrow(
      ValidationError
    );
    expect(() => validateVoltage(null as unknown as number)).toThrow(
      ValidationError
    );
    expect(() => validateVoltage(undefined as unknown as number)).toThrow(
      ValidationError
    );
    expect(() => validateVoltage(Number.NaN)).toThrow(ValidationError);
  });
});

describe('validateByte', () => {
  it('should accept valid byte values', () => {
    expect(() => validateByte(0)).not.toThrow();
    expect(() => validateByte(128)).not.toThrow();
    expect(() => validateByte(255)).not.toThrow();
  });

  it('should throw ValidationError for out of range values', () => {
    expect(() => validateByte(-1)).toThrow(ValidationError);
    expect(() => validateByte(256)).toThrow(ValidationError);
    expect(() => validateByte(1000)).toThrow(ValidationError);
  });

  it('should throw ValidationError for non-number values', () => {
    expect(() => validateByte('128' as unknown as number)).toThrow(
      ValidationError
    );
    expect(() => validateByte(null as unknown as number)).toThrow(
      ValidationError
    );
    expect(() => validateByte(undefined as unknown as number)).toThrow(
      ValidationError
    );
    expect(() => validateByte(Number.NaN)).toThrow(ValidationError);
  });
});

describe('validateRepeatInterval', () => {
  it('should accept valid intervals', () => {
    expect(() => validateRepeatInterval(100)).not.toThrow();
    expect(() => validateRepeatInterval(1000)).not.toThrow();
    expect(() => validateRepeatInterval(65535)).not.toThrow();
  });

  it('should throw ValidationError for out of range values', () => {
    expect(() => validateRepeatInterval(99)).toThrow(ValidationError);
    expect(() => validateRepeatInterval(65536)).toThrow(ValidationError);
    expect(() => validateRepeatInterval(0)).toThrow(ValidationError);
  });

  it('should throw ValidationError for non-number values', () => {
    expect(() => validateRepeatInterval('1000' as unknown as number)).toThrow(
      ValidationError
    );
    expect(() => validateRepeatInterval(null as unknown as number)).toThrow(
      ValidationError
    );
    expect(() =>
      validateRepeatInterval(undefined as unknown as number)
    ).toThrow(ValidationError);
    expect(() => validateRepeatInterval(Number.NaN)).toThrow(ValidationError);
  });
});

describe('validateDuration', () => {
  it('should accept valid durations', () => {
    expect(() => validateDuration(0.001)).not.toThrow();
    expect(() => validateDuration(1)).not.toThrow();
    expect(() => validateDuration(100)).not.toThrow();
  });

  it('should throw ValidationError for zero or negative values', () => {
    expect(() => validateDuration(0)).toThrow(ValidationError);
    expect(() => validateDuration(-1)).toThrow(ValidationError);
    expect(() => validateDuration(-0.001)).toThrow(ValidationError);
  });

  it('should throw ValidationError for non-number values', () => {
    expect(() => validateDuration('1' as unknown as number)).toThrow(
      ValidationError
    );
    expect(() => validateDuration(null as unknown as number)).toThrow(
      ValidationError
    );
    expect(() => validateDuration(undefined as unknown as number)).toThrow(
      ValidationError
    );
    expect(() => validateDuration(Number.NaN)).toThrow(ValidationError);
  });
});

describe('validateImpedanceMode', () => {
  it('should accept valid impedance modes', () => {
    expect(() => validateImpedanceMode('highz')).not.toThrow();
    expect(() => validateImpedanceMode('50ohm')).not.toThrow();
    expect(() => validateImpedanceMode('HIGHZ')).not.toThrow();
    expect(() => validateImpedanceMode('50OHM')).not.toThrow();
  });

  it('should throw ValidationError for invalid modes', () => {
    expect(() => validateImpedanceMode('100ohm')).toThrow(ValidationError);
    expect(() => validateImpedanceMode('invalid')).toThrow(ValidationError);
    expect(() => validateImpedanceMode('')).toThrow(ValidationError);
  });

  it('should throw ValidationError for non-string values', () => {
    expect(() => validateImpedanceMode(50 as unknown as string)).toThrow(
      ValidationError
    );
    expect(() => validateImpedanceMode(null as unknown as string)).toThrow(
      ValidationError
    );
    expect(() => validateImpedanceMode(undefined as unknown as string)).toThrow(
      ValidationError
    );
  });
});

describe('validateBoolean', () => {
  it('should accept boolean values', () => {
    expect(() => validateBoolean('enabled', true)).not.toThrow();
    expect(() => validateBoolean('disabled', false)).not.toThrow();
  });

  it('should throw ValidationError for non-boolean values', () => {
    expect(() => validateBoolean('flag', 1)).toThrow(ValidationError);
    expect(() => validateBoolean('flag', 0)).toThrow(ValidationError);
    expect(() => validateBoolean('flag', 'true')).toThrow(ValidationError);
    expect(() => validateBoolean('flag', null)).toThrow(ValidationError);
    expect(() => validateBoolean('flag', undefined)).toThrow(ValidationError);
  });
});

describe('clamp', () => {
  it('should return value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });

  it('should clamp to minimum when below range', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(-100, 0, 10)).toBe(0);
  });

  it('should clamp to maximum when above range', () => {
    expect(clamp(15, 0, 10)).toBe(10);
    expect(clamp(100, 0, 10)).toBe(10);
  });
});

describe('clampVoltage', () => {
  it('should clamp voltage to valid range', () => {
    expect(clampVoltage(-1)).toBe(0);
    expect(clampVoltage(0)).toBe(0);
    expect(clampVoltage(2.04)).toBe(2.04);
    expect(clampVoltage(4.08)).toBe(4.08);
    expect(clampVoltage(5)).toBe(4.08);
  });
});

describe('clampRepeatInterval', () => {
  it('should clamp interval to valid range', () => {
    expect(clampRepeatInterval(50)).toBe(100);
    expect(clampRepeatInterval(100)).toBe(100);
    expect(clampRepeatInterval(1000)).toBe(1000);
    expect(clampRepeatInterval(65535)).toBe(65535);
    expect(clampRepeatInterval(70000)).toBe(65535);
  });
});

describe('voltageToByte', () => {
  it('should convert voltage to byte correctly', () => {
    expect(voltageToByte(0)).toBe(0);
    expect(voltageToByte(4.08)).toBe(255);
    expect(voltageToByte(2.04)).toBe(128);
  });

  it('should clamp and convert out of range voltages', () => {
    expect(voltageToByte(-1)).toBe(0);
    expect(voltageToByte(5)).toBe(255);
  });
});

describe('byteToVoltage', () => {
  it('should convert byte to voltage correctly', () => {
    expect(byteToVoltage(0)).toBe(0);
    expect(byteToVoltage(255)).toBe(4.08);
    expect(byteToVoltage(128)).toBeCloseTo(2.048, 2);
  });

  it('should throw for invalid byte values', () => {
    expect(() => byteToVoltage(-1)).toThrow(ValidationError);
    expect(() => byteToVoltage(256)).toThrow(ValidationError);
    expect(() => byteToVoltage('128' as unknown as number)).toThrow(
      ValidationError
    );
  });
});

// ============================================================================
// Branded Types Tests
// ============================================================================

describe('isValidChannel', () => {
  it('should return true for valid channel numbers', () => {
    expect(isValidChannel(0)).toBe(true);
    expect(isValidChannel(1)).toBe(true);
    expect(isValidChannel(7)).toBe(true);
  });

  it('should return false for out of range values', () => {
    expect(isValidChannel(-1)).toBe(false);
    expect(isValidChannel(8)).toBe(false);
    expect(isValidChannel(100)).toBe(false);
  });

  it('should return false for non-integer values', () => {
    expect(isValidChannel(0.5)).toBe(false);
    expect(isValidChannel(3.14)).toBe(false);
    expect(isValidChannel(1.999)).toBe(false);
  });

  it('should return false for NaN', () => {
    expect(isValidChannel(Number.NaN)).toBe(false);
  });

  it('should narrow type correctly', () => {
    const value = 3;
    if (isValidChannel(value)) {
      // TypeScript should recognize value as Channel here
      const channel: Channel = value;
      expect(channel).toBe(3);
    }
  });
});

describe('isValidVoltage', () => {
  it('should return true for valid voltage values', () => {
    expect(isValidVoltage(0)).toBe(true);
    expect(isValidVoltage(2.04)).toBe(true);
    expect(isValidVoltage(4.08)).toBe(true);
  });

  it('should return false for out of range values', () => {
    expect(isValidVoltage(-0.01)).toBe(false);
    expect(isValidVoltage(4.09)).toBe(false);
    expect(isValidVoltage(10)).toBe(false);
  });

  it('should return false for NaN', () => {
    expect(isValidVoltage(Number.NaN)).toBe(false);
  });

  it('should narrow type correctly', () => {
    const value = 2.5;
    if (isValidVoltage(value)) {
      // TypeScript should recognize value as Voltage here
      const voltage: Voltage = value;
      expect(voltage).toBe(2.5);
    }
  });
});

describe('createChannel', () => {
  it('should create a Channel for valid values', () => {
    const ch0 = createChannel(0);
    const ch3 = createChannel(3);
    const ch7 = createChannel(7);

    expect(ch0).toBe(0);
    expect(ch3).toBe(3);
    expect(ch7).toBe(7);
  });

  it('should throw InvalidChannelError for out of range values', () => {
    expect(() => createChannel(-1)).toThrow(InvalidChannelError);
    expect(() => createChannel(8)).toThrow(InvalidChannelError);
    expect(() => createChannel(100)).toThrow(InvalidChannelError);
  });

  it('should throw ValidationError for non-integer values', () => {
    expect(() => createChannel(0.5)).toThrow(InvalidChannelError);
    expect(() => createChannel(3.14)).toThrow(InvalidChannelError);
  });

  it('should throw ValidationError for NaN', () => {
    expect(() => createChannel(Number.NaN)).toThrow(ValidationError);
  });

  it('should throw ValidationError for non-number values', () => {
    expect(() => createChannel('3' as unknown as number)).toThrow(
      ValidationError
    );
    expect(() => createChannel(null as unknown as number)).toThrow(
      ValidationError
    );
    expect(() => createChannel(undefined as unknown as number)).toThrow(
      ValidationError
    );
  });

  it('should return a value usable as Channel type', () => {
    const channel: Channel = createChannel(5);
    // Channel is branded but still a number at runtime
    expect(typeof channel).toBe('number');
    expect(channel + 1).toBe(6);
  });
});

describe('createVoltage', () => {
  it('should create a Voltage for valid values', () => {
    const v0 = createVoltage(0);
    const v2 = createVoltage(2.04);
    const vMax = createVoltage(4.08);

    expect(v0).toBe(0);
    expect(v2).toBe(2.04);
    expect(vMax).toBe(4.08);
  });

  it('should throw InvalidVoltageError for out of range values', () => {
    expect(() => createVoltage(-0.01)).toThrow(InvalidVoltageError);
    expect(() => createVoltage(4.09)).toThrow(InvalidVoltageError);
    expect(() => createVoltage(10)).toThrow(InvalidVoltageError);
  });

  it('should throw ValidationError for NaN', () => {
    expect(() => createVoltage(Number.NaN)).toThrow(ValidationError);
  });

  it('should throw ValidationError for non-number values', () => {
    expect(() => createVoltage('2.5' as unknown as number)).toThrow(
      ValidationError
    );
    expect(() => createVoltage(null as unknown as number)).toThrow(
      ValidationError
    );
    expect(() => createVoltage(undefined as unknown as number)).toThrow(
      ValidationError
    );
  });

  it('should return a value usable as Voltage type', () => {
    const voltage: Voltage = createVoltage(2.5);
    // Voltage is branded but still a number at runtime
    expect(typeof voltage).toBe('number');
    expect(voltage * 2).toBe(5.0);
  });
});

describe('createClampedVoltage', () => {
  it('should create a Voltage for values within range', () => {
    expect(createClampedVoltage(0)).toBe(0);
    expect(createClampedVoltage(2.04)).toBe(2.04);
    expect(createClampedVoltage(4.08)).toBe(4.08);
  });

  it('should clamp values below minimum to 0', () => {
    expect(createClampedVoltage(-1)).toBe(0);
    expect(createClampedVoltage(-100)).toBe(0);
  });

  it('should clamp values above maximum to 4.08', () => {
    expect(createClampedVoltage(5)).toBe(4.08);
    expect(createClampedVoltage(100)).toBe(4.08);
  });

  it('should return a value usable as Voltage type', () => {
    const voltage: Voltage = createClampedVoltage(10);
    expect(voltage).toBe(4.08);
    expect(typeof voltage).toBe('number');
  });

  it('should not throw for any numeric input', () => {
    expect(() => createClampedVoltage(-1000)).not.toThrow();
    expect(() => createClampedVoltage(1000)).not.toThrow();
    expect(() => createClampedVoltage(0)).not.toThrow();
  });
});
