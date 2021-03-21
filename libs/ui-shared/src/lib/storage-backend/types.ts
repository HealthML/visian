export interface IStorageBackend<T> {
  /** Deletes the data behind given key. */
  delete(key: string): Promise<void>;

  /** Writes data to storage, throttled per key. */
  persist(key: string, data: T): Promise<void>;

  /** Reads data from storage. */
  retrieve(key: string): Promise<T | null | undefined>;
}
