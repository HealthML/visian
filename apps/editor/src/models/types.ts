import type React from "react";
import type { Theme } from "@visian/ui-shared";

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

  setDirty(): void;

  getTheme(): Theme;

  getRefs(): { [key: string]: React.RefObject<HTMLElement> };
}

export interface ErrorNotification {
  title?: string;
  titleTx?: string;
  description?: string;
  descriptionTx?: string;
}
