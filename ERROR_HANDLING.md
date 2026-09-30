# Error Handling

All library errors extend `CD48Error` (see `src/errors.ts`). Catch specific types to react to specific failures.

| Error | Thrown when | Extra properties |
|---|---|---|
| `CD48Error` | Base class | — |
| `UnsupportedBrowserError` | Web Serial API unavailable | — |
| `NotConnectedError` | Operation needs a connected device | `operation` |
| `ConnectionError` | Connecting fails | `originalError` |
| `DeviceSelectionCancelledError` | User dismisses the port picker | — |
| `CommandTimeoutError` | Device does not answer in time | `command`, `timeout` |
| `InvalidResponseError` | Response does not match expectation | `response`, `expected` |
| `ValidationError` | A parameter is out of range or the wrong type | `parameter`, `value`, `constraints` |
| `InvalidChannelError` | Channel outside 0–7 (extends `ValidationError`) | — |
| `InvalidVoltageError` | Voltage outside 0–4.08 V (extends `ValidationError`) | — |
| `CommunicationError` | Serial read/write fails | `originalError` |
| `OperationAbortedError` | Operation cancelled | `operation` |
| `FirmwareIncompatibleError` | Device firmware is not supported | — |

## Validation

`src/validation.ts` exports `validateChannel`, `validateVoltage`, `validateByte`, `validateRepeatInterval` (100–65535), `validateDuration` (> 0), `validateImpedanceMode` and `validateBoolean`. They throw `ValidationError` (or a subclass) and return nothing. `clampVoltage` and `clampRepeatInterval` coerce instead of throwing. The `CD48` methods already validate their arguments, so you usually only need these for input handling in your own UI.

## Example

```typescript
import {
  CD48,
  CD48Error,
  CommandTimeoutError,
  DeviceSelectionCancelledError,
  NotConnectedError,
  ValidationError,
} from 'tscd48';

const cd48 = new CD48();

try {
  await cd48.connect();
  await cd48.setTriggerLevel(2.5);
} catch (error) {
  if (error instanceof DeviceSelectionCancelledError) {
    // user closed the picker; not a failure
  } else if (error instanceof ValidationError) {
    console.error(`Bad ${error.parameter}: ${error.constraints}`);
  } else if (error instanceof CommandTimeoutError) {
    console.error(`${error.command} timed out after ${error.timeout} ms`);
  } else if (error instanceof NotConnectedError || error instanceof CD48Error) {
    console.error(error.message);
  } else {
    throw error;
  }
} finally {
  await cd48.disconnect();
}
```
