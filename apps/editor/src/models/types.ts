export interface StoreContext {
  /**
   * Requests changes to be persisted.
   * The may not be flushed to local storage for a while.
   */
  persist(): Promise<void>;

  /**
   * Forces an immediate save.
   * All changes will be flushed to local storage asap.
   */
  persistImmediately(): Promise<void>;
}
