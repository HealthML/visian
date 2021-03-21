import throttle from "lodash.throttle";

// TODO: Use generic type here to capture the throttled function's type
export const asyncThrottle = (...args: Parameters<typeof throttle>) => {
  const [fn, ...rest] = args;

  let pendingRequests: [
    (value: ReturnType<typeof fn>) => void,
    (exception: Error) => void,
  ][] = [];
  const throttledFn = throttle((...args2: Parameters<typeof fn>) => {
    try {
      const result = fn(...args2);
      pendingRequests.forEach((request) => {
        request[0](result);
      });
    } catch (exception) {
      pendingRequests.forEach((request) => {
        request[1](exception);
      });
    }
    pendingRequests = [];
  }, ...rest);

  return (...args2: Parameters<typeof fn>) =>
    new Promise<ReturnType<typeof fn>>((resolve, reject) => {
      pendingRequests.push([resolve, reject]);
      throttledFn(...args2);
    });
};
