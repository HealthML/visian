import type React from "react";
import { ContextMenuPositionConfig } from "./utils";

export interface ContextMenuProps
  extends React.HTMLAttributes<HTMLDivElement>,
    Pick<ContextMenuPositionConfig, "anchor" | "distance"> {
  /** The z-index of the surface below. */
  baseZIndex?: number;

  /** If set to `false`, hides the context menu. */
  isOpen?: boolean;

  /** A reference to pass to the handlers of the context menu. */
  value?: unknown;

  /**
   * If provided, this handler will be called on pointer downs outside the
   * context menu.
   */
  onOutsidePress?: (value?: unknown) => void;
}
