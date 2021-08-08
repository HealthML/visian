export interface IStorageBackend<T = unknown> {
  /** Deletes all keys in storage. */
  clear(): Promise<void>;

  /** Deletes the data behind given key. */
  delete(key: string): Promise<void>;

  /** Writes data to storage, throttled per key. */
  persist(
    key: string,
    data: T | (() => T | Promise<T>),
    setDirty?: (dirty: boolean) => void,
  ): Promise<void>;

  /**
   * Writes data to storage, skipping throttle.
   * If another write to the same key is already scheduled, it will be cancelled.
   */
  persistImmediately(
    key: string,
    data: T | (() => T | Promise<T>),
  ): Promise<void>;

  /** Reads data from storage. */
  retrieve(key: string): Promise<T | null | undefined>;
}
