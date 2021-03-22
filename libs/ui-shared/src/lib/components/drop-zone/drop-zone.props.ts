import type React from "react";

export interface DropZoneProps extends React.HTMLAttributes<HTMLDivElement> {
  /** An event handler that is called after a successful file drop. */
  onFileDrop?: (files: FileList) => void;

  /** An optional label to display that indicates the drop action (preceeds `children`). */
  label?: string;

  /** The key for i18n translation of the label (preceeds `label` & `children`). */
  labelTx?: string;

  /**
   * Should the drop zone be visible even if nothing is dragged over it?
   * Defaults to `false`.
   */
  isAlwaysVisible?: boolean;
}
