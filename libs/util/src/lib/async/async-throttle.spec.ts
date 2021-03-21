/* eslint-disable @typescript-eslint/no-explicit-any */
import { asyncThrottle } from "./async-throttle";

jest.mock("lodash.throttle", () => {
  let wrappedFn: ((...args: any[]) => any) | undefined;
  let lastArgs: any[] | undefined;

  const release = () => {
    if (wrappedFn) wrappedFn(...(lastArgs as any[]));
  };

  return {
    __esModule: true,
    clear() {
      wrappedFn = undefined;
      lastArgs = undefined;
    },
    default: jest.fn((fn: (...args: any[]) => any) => {
      wrappedFn = fn;
      return (...args: any[]) => {
        if (!lastArgs && wrappedFn) wrappedFn(...args);
        lastArgs = args;
      };
    }),
    release,
  };
});
const { clear, release } = jest.requireMock("lodash.throttle");

describe("asyncThrottle", () => {
  const fn = jest.fn((param: any) => param);
  let throttledFn: (
    ...args: Parameters<typeof fn>
  ) => Promise<ReturnType<typeof fn>>;

  beforeEach(() => {
    clear();
    throttledFn = asyncThrottle(fn, 1000);
  });

  it("should trigger one call immediately", async () => {
    await expect(throttledFn(0)).resolves.toBe(0);
  });

  it("should hold consecutive calls until released", async () => {
    const promise1 = throttledFn(1);
    const promise2 = throttledFn(2);
    const promise3 = throttledFn(3);
    await expect(promise1).resolves.toBe(1);

    release();
    await expect(promise2).resolves.toBe(3);
    await expect(promise3).resolves.toBe(3);

    const promise4 = throttledFn(4);
    release();
    await expect(promise4).resolves.toBe(4);
  });

  it("should reject the Promise if an error occurs", async () => {
    clear();
    throttledFn = asyncThrottle(() => {
      throw new Error();
    }, 1000);

    const promise1 = throttledFn(1);
    const promise2 = throttledFn(2);
    release();
    await expect(promise1).rejects.toThrow(Error);
    await expect(promise2).rejects.toThrow(Error);
  });
});
