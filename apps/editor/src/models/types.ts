import type { ColorMode, ErrorNotification, Theme } from "@visian/ui-shared";
import type React from "react";

import type { Tracker } from "./tracking";

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

  setError(error: ErrorNotification): void;

  getTracker(): Tracker | undefined;

  getColorMode(): ColorMode;
}

export interface ProgressNotification {
  label?: string;
  labelTx?: string;
  progress?: number;
  showSplash?: boolean;
}
