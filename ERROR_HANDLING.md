# Error Handling Guide

This document describes the error handling patterns and custom error types in the tscd48 library.

## Error Classes

The library provides specific error types for different failure scenarios. All custom errors extend the base `CD48Error` class.

### Available Error Types

#### `CD48Error`

Base class for all CD48-related errors.

```javascript
import { CD48Error } from 'tscd48';

try {
  // CD48 operation
} catch (error) {
  if (error instanceof CD48Error) {
    console.error('CD48-specific error:', error.message);
  }
}
```

#### `UnsupportedBrowserError`

Thrown when the Web Serial API is not supported by the browser.

```javascript
import { UnsupportedBrowserError } from 'tscd48';

if (!CD48.isSupported()) {
  throw new UnsupportedBrowserError();
  // Error: "Web Serial API not supported. Use Chrome 89+, Edge 89+, or Opera 76+."
}
```

#### `NotConnectedError`

Thrown when attempting an operation that requires a connected device.

```javascript
import { NotConnectedError } from 'tscd48';

if (!cd48.isConnected()) {
  throw new NotConnectedError('getCounts');
  // Error: "Cannot perform operation 'getCounts' - device not connected. Call connect() first."
}
```

Properties:

- `operation` - The operation that was attempted

#### `ConnectionError`

Thrown when device connection fails.

```javascript
import { ConnectionError } from 'tscd48';

try {
  await cd48.connect();
} catch (error) {
  if (error instanceof ConnectionError) {
    console.error('Connection failed:', error.message);
    console.error('Cause:', error.cause);
  }
}
```

Properties:

- `cause` - The underlying error that caused the connection failure

#### `DeviceSelectionCancelledError`

Thrown when the user cancels the device selection dialog.

```javascript
import { DeviceSelectionCancelledError } from 'tscd48';

try {
  await cd48.connect();
} catch (error) {
  if (error instanceof DeviceSelectionCancelledError) {
    console.log('User cancelled device selection');
  }
}
```

#### `CommandTimeoutError`

Thrown when a command times out waiting for a response.

```javascript
import { CommandTimeoutError } from 'tscd48';

try {
  const version = await cd48.getVersion();
} catch (error) {
  if (error instanceof CommandTimeoutError) {
    console.error(
      `Command '${error.command}' timed out after ${error.timeout}ms`
    );
  }
}
```

Properties:

- `command` - The command that timed out
- `timeout` - The timeout duration in milliseconds

#### `InvalidResponseError`

Thrown when the device returns an unexpected or malformed response.

```javascript
import { InvalidResponseError } from 'tscd48';

try {
  const counts = await cd48.getCounts();
} catch (error) {
  if (error instanceof InvalidResponseError) {
    console.error(`Invalid response: ${error.response}`);
    console.error(`Expected: ${error.expected}`);
  }
}
```

Properties:

- `response` - The actual response received
- `expected` - Description of the expected response format

#### `ValidationError`

Base class for parameter validation errors.

```javascript
import { ValidationError } from 'tscd48';

try {
  validateChannel(10);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(`Invalid ${error.parameter}: ${error.value}`);
    console.error(`Constraints: ${error.constraints}`);
  }
}
```

Properties:

- `parameter` - The parameter that failed validation
- `value` - The invalid value
- `constraints` - Description of the validation constraints

#### `InvalidChannelError`

Thrown when a channel number is out of the valid range (0-7).

```javascript
import { InvalidChannelError } from 'tscd48';

try {
  await cd48.setChannel(10, true, true, true);
} catch (error) {
  if (error instanceof InvalidChannelError) {
    console.error('Invalid channel number');
  }
}
```

#### `InvalidVoltageError`

Thrown when a voltage is out of the valid range (0-4.08V).

```javascript
import { InvalidVoltageError } from 'tscd48';

try {
  await cd48.setTriggerLevel(5.0);
} catch (error) {
  if (error instanceof InvalidVoltageError) {
    console.error('Voltage out of range (0-4.08V)');
  }
}
```

#### `CommunicationError`

Thrown when communication with the device fails.

```javascript
import { CommunicationError } from 'tscd48';

try {
  await cd48.sendCommand('VER\r');
} catch (error) {
  if (error instanceof CommunicationError) {
    console.error('Communication error:', error.message);
    console.error('Cause:', error.cause);
  }
}
```

Properties:

- `cause` - The underlying error that caused the communication failure

## Validation Functions

The validation module provides functions for validating parameters before sending commands to the device.

### Channel Validation

```javascript
import { validateChannel, CHANNEL_MIN, CHANNEL_MAX } from 'tscd48';

// Valid channel (0-7)
validateChannel(0); // OK
validateChannel(7); // OK

// Invalid channels
validateChannel(-1); // Throws InvalidChannelError
validateChannel(8); // Throws InvalidChannelError
validateChannel('0'); // Throws ValidationError (not a number)
```

### Voltage Validation

```javascript
import {
  validateVoltage,
  clampVoltage,
  VOLTAGE_MIN,
  VOLTAGE_MAX,
} from 'tscd48';

// Validate voltage (throws on invalid)
validateVoltage(2.5); // OK
validateVoltage(-0.1); // Throws InvalidVoltageError
validateVoltage(5.0); // Throws InvalidVoltageError

// Clamp voltage to valid range (no throw)
const voltage = clampVoltage(5.0); // Returns 4.08
const voltage2 = clampVoltage(-0.5); // Returns 0.0
```

### Duration Validation

```javascript
import { validateDuration } from 'tscd48';

validateDuration(1.0); // OK
validateDuration(0.5); // OK
validateDuration(0); // Throws ValidationError (must be > 0)
validateDuration(-1); // Throws ValidationError (must be > 0)
```

### Impedance Mode Validation

```javascript
import { validateImpedanceMode } from 'tscd48';

validateImpedanceMode('highz'); // OK
validateImpedanceMode('50ohm'); // OK
validateImpedanceMode('invalid'); // Throws ValidationError
```

### Repeat Interval Validation

```javascript
import {
  validateRepeatInterval,
  clampRepeatInterval,
  REPEAT_INTERVAL_MIN,
  REPEAT_INTERVAL_MAX,
} from 'tscd48';

validateRepeatInterval(1000); // OK
validateRepeatInterval(50); // Throws ValidationError (min is 100)
validateRepeatInterval(100000); // Throws ValidationError (max is 65535)

// Clamp to valid range
const interval = clampRepeatInterval(50); // Returns 100
const interval2 = clampRepeatInterval(100000); // Returns 65535
```

## Best Practices

### 1. Catch Specific Errors

Catch specific error types to handle different failure scenarios appropriately:

```javascript
try {
  await cd48.connect();
  const counts = await cd48.getCounts();
} catch (error) {
  if (error instanceof DeviceSelectionCancelledError) {
    // User cancelled - show gentle message
    console.log('Please select a device to continue');
  } else if (error instanceof UnsupportedBrowserError) {
    // Wrong browser - show compatibility info
    showBrowserCompatibilityWarning();
  } else if (error instanceof ConnectionError) {
    // Connection failed - show troubleshooting
    showConnectionTroubleshooting();
  } else if (error instanceof NotConnectedError) {
    // Not connected - prompt to connect
    console.error('Please connect to the device first');
  } else if (error instanceof CommandTimeoutError) {
    // Timeout - suggest retry
    console.error('Command timed out. Please try again.');
  } else {
    // Unknown error - show generic message
    console.error('An error occurred:', error.message);
  }
}
```

### 2. Validate Early

Validate parameters before sending commands to catch errors early:

```javascript
import { validateChannel, validateVoltage } from 'tscd48';

async function setChannelConfiguration(channel, voltage) {
  // Validate before doing any work
  validateChannel(channel);
  validateVoltage(voltage);

  // Now safe to proceed
  await cd48.setChannel(channel, true, false, false);
  await cd48.setTriggerLevel(voltage);
}
```

### 3. Use Type Checking

Check error types with `instanceof`:

```javascript
if (error instanceof CD48Error) {
  // CD48-specific error
  logToAnalytics('cd48_error', {
    type: error.name,
    message: error.message,
  });
}
```

### 4. Provide Context

Include context when rethrowing errors:

```javascript
async function measureMultipleChannels(channels) {
  for (const channel of channels) {
    try {
      await cd48.measureRate(channel, 1.0);
    } catch (error) {
      // Add context before rethrowing
      throw new Error(`Failed to measure channel ${channel}: ${error.message}`);
    }
  }
}
```

### 5. Clean Up on Errors

Always disconnect on errors to avoid leaving the port open:

```javascript
try {
  await cd48.connect();
  await cd48.getCounts();
} catch (error) {
  console.error('Error:', error);
} finally {
  // Always disconnect
  if (cd48.isConnected()) {
    await cd48.disconnect();
  }
}
```

## Error Message Examples

Here are the error messages you can expect from each error type:

| Error Type                    | Message Example                                                                    |
| ----------------------------- | ---------------------------------------------------------------------------------- |
| UnsupportedBrowserError       | "Web Serial API not supported. Use Chrome 89+, Edge 89+, or Opera 76+."            |
| NotConnectedError             | "Cannot perform operation 'getCounts' - device not connected. Call connect() first |
| ."                            |
| ConnectionError               | "Connection failed: Port open() failed"                                            |
| DeviceSelectionCancelledError | "No CD48 device selected by user"                                                  |
| CommandTimeoutError           | "Command 'VER' timed out after 1000ms"                                             |
| InvalidResponseError          | "Invalid response format. Got: 'ERROR', expected: version string"                  |
| ValidationError               | "Invalid parameter 'duration': -1. Constraints: must be greater than 0"            |
| InvalidChannelError           | "Invalid parameter 'channel': 10. Constraints: 0-7"                                |
| InvalidVoltageError           | "Invalid parameter 'voltage': 5.0. Constraints: 0.0-4.08V"                         |
| CommunicationError            | "Communication error: Failed to read response"                                     |

## Migrating from Generic Errors

If you're migrating code that catches generic `Error` objects, here's how to update:

### Before (Generic Errors)

```javascript
try {
  await cd48.connect();
} catch (error) {
  if (error.message.includes('not supported')) {
    // Handle unsupported browser
  } else if (error.message.includes('not connected')) {
    // Handle not connected
  } else if (error.message.includes('timeout')) {
    // Handle timeout
  }
}
```

### After (Specific Errors)

```javascript
try {
  await cd48.connect();
} catch (error) {
  if (error instanceof UnsupportedBrowserError) {
    // Handle unsupported browser
  } else if (error instanceof NotConnectedError) {
    // Handle not connected
  } else if (error instanceof CommandTimeoutError) {
    // Handle timeout
  }
}
```

## Testing Error Conditions

When writing tests, you can use the error classes to verify error handling:

```javascript
import { describe, it, expect } from 'vitest';
import { InvalidChannelError } from 'tscd48';
import { validateChannel } from 'tscd48';

describe('Channel Validation', () => {
  it('should throw InvalidChannelError for channel > 7', () => {
    expect(() => validateChannel(8)).toThrow(InvalidChannelError);
  });

  it('should throw InvalidChannelError for channel < 0', () => {
    expect(() => validateChannel(-1)).toThrow(InvalidChannelError);
  });

  it('should not throw for valid channel', () => {
    expect(() => validateChannel(3)).not.toThrow();
  });
});
```

---

For more information, see the source code in `errors.js` and `validation.js`.
