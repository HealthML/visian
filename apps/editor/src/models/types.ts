import type { ColorMode } from "@visian/ui-shared";

export interface StoreContext {
  /**
   * Requests changes to be persisted.
   * They may not be flushed to local storage for a while.
   */
  persist(): Promise<void>;

  /**
   * Forces an immediate save.
   * All changes will be flushed to local storage asap.
   */
  persistImmediately(): Promise<void>;

  getTheme(): ColorMode;
}
