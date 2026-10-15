import { afterEach, describe, expect, it, vi } from 'vitest';
import CD48 from '../../src/cd48.js';
import {
  CommandTimeoutError,
  InvalidChannelError,
  InvalidResponseError,
  OverflowError,
} from '../../src/errors.js';
import {
  cleanupWebSerialMock,
  setupWebSerialMock,
} from '../mocks/web-serial.js';

type ReadResult = { value: string; done: boolean };

describe('serial read edges', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    cleanupWebSerialMock();
  });

  async function connect(
    options: ConstructorParameters<typeof CD48>[0] = {}
  ): Promise<{
    cd48: CD48;
    mocks: ReturnType<typeof setupWebSerialMock>;
  }> {
    const mocks = setupWebSerialMock({ hasPreviousPort: true });
    const cd48 = new CD48({ commandDelay: 0, ...options });
    await cd48.connect();
    return { cd48, mocks };
  }

  function scriptReads(
    mocks: ReturnType<typeof setupWebSerialMock>,
    script: Array<ReadResult | 'hang'>,
    onRead?: (index: number) => void
  ): void {
    let index = 0;
    mocks.mockReader.read.mockImplementation(() => {
      const step = script[Math.min(index, script.length - 1)] ?? {
        value: '',
        done: false,
      };
      onRead?.(index);
      index += 1;
      if (step === 'hang') {
        return new Promise<ReadResult>(() => {});
      }
      return Promise.resolve(step);
    });
  }

  it('throws OverflowError when a measured channel overflows', async () => {
    const { cd48, mocks } = await connect();
    mocks.mockPort._setResponse('c\r', '4 0 0 0 0 0 0 0 1\r\n');

    await expect(cd48.measureRate(0, 0.001)).rejects.toBeInstanceOf(
      OverflowError
    );
    await expect(
      cd48.measureCoincidenceRate({ duration: 0.001 })
    ).rejects.toBeInstanceOf(OverflowError);
  });

  it('rejects a rate when the count array has no entry for the channel', async () => {
    const { cd48 } = await connect();
    vi.spyOn(cd48, 'getCounts').mockResolvedValue({
      counts: [],
      overflow: 0,
    });

    await expect(cd48.measureRate(0, 0.001)).rejects.toBeInstanceOf(
      InvalidChannelError
    );
    await expect(
      cd48.measureCoincidenceRate({ duration: 0.001 })
    ).rejects.toBeInstanceOf(InvalidResponseError);
  });

  it('reports a non-zero relative uncertainty', async () => {
    const { cd48, mocks } = await connect();
    mocks.mockPort._setResponse('c\r', '10 0 0 0 0 0 0 0 0\r\n');

    const result = await cd48.measureRate(0, 0.001);
    expect(result.counts).toBe(10);
    expect(result.uncertainty.relative).toBeGreaterThan(0);
  });

  it('returns once a line has been idle with no read in flight', async () => {
    const { cd48, mocks } = await connect();
    let step = 1;
    let now = 1_000_000;
    vi.spyOn(Date, 'now').mockImplementation(() => {
      now += step;
      return now;
    });
    scriptReads(
      mocks,
      [
        { value: '', done: false },
        { value: 'CD48 v1.0.0\r\n', done: false },
      ],
      (index) => {
        if (index === 1) step = 60;
      }
    );

    await expect(cd48.getVersion()).resolves.toBe('CD48 v1.0.0');
  });

  it('returns a partial line when the follow-up read times out after the idle gap', async () => {
    const { cd48, mocks } = await connect();
    scriptReads(mocks, [
      { value: '', done: false },
      { value: 'CD48 v1.0.0\r\n', done: false },
      'hang',
    ]);

    await expect(cd48.getVersion()).resolves.toBe('CD48 v1.0.0');
  });

  it('stops when the reader closes before a line arrives', async () => {
    const { cd48, mocks } = await connect();
    scriptReads(mocks, [
      { value: '', done: false },
      { value: '', done: true },
    ]);

    await expect(cd48.getVersion()).rejects.toBeInstanceOf(CommandTimeoutError);
  });

  it('treats a missing reader as a closed read', async () => {
    const { cd48, mocks } = await connect();
    scriptReads(mocks, [{ value: '', done: false }], () => {
      (cd48 as unknown as { reader: null }).reader = null;
    });

    await expect(cd48.getVersion()).rejects.toBeInstanceOf(CommandTimeoutError);
  });

  it('stops the framed read when the clock jumps past the deadline', async () => {
    const { cd48 } = await connect();
    let calls = 0;
    let origin = 8_000;
    vi.spyOn(Date, 'now').mockImplementation(() => {
      calls += 1;
      if (calls <= 2) {
        origin += 100;
        return origin;
      }
      if (calls === 3 || calls === 4) return origin;
      if (calls === 5) return origin + 10;
      return origin + 5_000;
    });

    await expect(cd48.getVersion()).rejects.toBeInstanceOf(CommandTimeoutError);
  });

  it('drops a trailing empty read once the command deadline has passed', async () => {
    const { cd48, mocks } = await connect();
    let step = 1;
    let now = 1_000_000;
    vi.spyOn(Date, 'now').mockImplementation(() => {
      now += step;
      return now;
    });
    scriptReads(
      mocks,
      [
        { value: '', done: false },
        { value: 'OK\r', done: false },
        { value: '', done: false },
      ],
      (index) => {
        if (index === 2) step = 2_000;
      }
    );

    await expect(cd48.getVersion()).rejects.toBeInstanceOf(CommandTimeoutError);
  });

  it('appends bytes from the follow-up read', async () => {
    const { cd48, mocks } = await connect();
    scriptReads(mocks, [
      { value: '', done: false },
      { value: 'CD48 v1.0.0\r', done: false },
      { value: '', done: false },
      { value: '\n', done: false },
      { value: '', done: false },
      { value: '', done: false },
    ]);

    await expect(cd48.getVersion()).resolves.toContain('v1.0.0');
  });

  it('reconnects and retries after a command timeout', async () => {
    const cd48 = new CD48({
      commandRetries: 1,
      retryDelay: 1,
      autoReconnect: false,
    });
    let attempt = 0;
    const internal = cd48 as unknown as {
      _sendCommandOnce(command: string): Promise<string>;
    };
    vi.spyOn(internal, '_sendCommandOnce').mockImplementation(
      async (command) => {
        attempt += 1;
        if (attempt === 1) {
          throw new CommandTimeoutError(command, 1000);
        }
        return 'CD48 v1.0.0';
      }
    );
    const reconnect = vi.spyOn(cd48, 'reconnect').mockResolvedValue(true);

    await expect(cd48.getVersion()).resolves.toBe('CD48 v1.0.0');
    expect(reconnect).toHaveBeenCalledOnce();
  });

  it('attaches a rejection handler when abandoning an in-flight read', async () => {
    const { cd48, mocks } = await connect();
    let rejectRead: (error: Error) => void = () => {};
    mocks.mockReader.read.mockImplementation(
      () =>
        new Promise<ReadResult>((_resolve, reject) => {
          rejectRead = reject;
        })
    );

    const pending = cd48.getVersion();
    const timedOut =
      expect(pending).rejects.toBeInstanceOf(CommandTimeoutError);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    rejectRead(new Error('cancelled'));
    await timedOut;
  });

  it('ignores a pipe failure while disconnecting', async () => {
    const mocks = setupWebSerialMock();
    let rejectPipe: (error: Error) => void = () => {};
    mocks.mockPort.readable.pipeTo.mockImplementation(
      () =>
        new Promise<void>((_resolve, reject) => {
          rejectPipe = reject;
        })
    );
    const cd48 = new CD48({ commandDelay: 0 });
    await cd48.connect();

    const closing = cd48.disconnect();
    rejectPipe(new Error('pipe closed'));
    await closing;
    expect(cd48.isConnected()).toBe(false);
  });
});
