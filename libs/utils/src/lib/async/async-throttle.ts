import throttle from "lodash.throttle";

import { isPromise } from "./utils";

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * A debounce function.
 * @see lodash
 */
export interface AsyncDebouncedFunc<T extends (...args: any[]) => any> {
  /**
   * Call the original function, but applying the debounce rules.
   *
   * If the debounced function can be run immediately, this calls it and returns its return
   * value.
   *
   * Otherwise, it returns the return value of the last invocation, or undefined if the debounced
   * function was not invoked yet.
   */
  (...args: Parameters<T>): ReturnType<T> | Promise<void>;

  /** Throw away any pending invocation of the debounced function. */
  cancel(): void;

  /**
   * If there is a pending invocation of the debounced function, invoke it immediately and return
   * its return value.
   *
   * Otherwise, return the value from the last invocation, or undefined if the debounced function
   * was never invoked.
   */
  flush(): ReturnType<T> | undefined;
}
/* eslint-enable */

// TODO: Use generic type here to capture the throttled function's type
export const asyncThrottle = (...args: Parameters<typeof throttle>) => {
  const [fn, ...rest] = args;

  let pendingRequests: [
    (value: ReturnType<typeof fn>) => void,
    (exception: Error) => void,
  ][] = [];
  const throttledFn = throttle((...throttledArgs: Parameters<typeof fn>) => {
    try {
      const result = fn(...throttledArgs);
      if (isPromise(result)) {
        result
          .then(() => {
            pendingRequests.forEach((request) => {
              request[0](result);
            });
          })
          .catch((exception) => {
            pendingRequests.forEach((request) => {
              request[1](exception);
            });
          })
          .finally(() => {
            pendingRequests = [];
          });
      } else {
        pendingRequests.forEach((request) => {
          request[0](result);
        });
        pendingRequests = [];
      }
    } catch (exception) {
      pendingRequests.forEach((request) => {
        request[1](exception as Error);
      });
      pendingRequests = [];
    }
  }, ...rest);

  const returnedFunction = (...throttledArgs: Parameters<typeof fn>) =>
    new Promise<ReturnType<typeof fn>>((resolve, reject) => {
      pendingRequests.push([resolve, reject]);
      throttledFn(...throttledArgs);
    });

  returnedFunction.cancel = () => throttledFn.cancel();
  returnedFunction.flush = () => throttledFn.flush();
  return returnedFunction as AsyncDebouncedFunc<
    (
      ...throttledArgs: Parameters<typeof fn>
    ) => ReturnType<typeof fn> | undefined
  >;
};
