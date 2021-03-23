/** Returns true if `maybePromise` is a Promise. */
export const isPromise = <T>(
  maybePromise: T | Promise<T>,
): maybePromise is Promise<T> =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Boolean(typeof (maybePromise as any)?.then === "function");

export const ensurePromise = <T>(maybePromise: T | Promise<T>) =>
  isPromise(maybePromise) ? maybePromise : Promise.resolve(maybePromise);

/** Calls `then` with the value of `maybePromise`. */
export const handleMaybePromise = <T, R>(
  maybePromise: T | Promise<T>,
  then: (value: T) => R | Promise<R>,
) => {
  if (isPromise(maybePromise)) return maybePromise.then(then);
  const returnValue = then(maybePromise);
  return isPromise(returnValue) ? returnValue : Promise.resolve(returnValue);
};
