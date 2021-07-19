export interface UIOverlayProps {
  /** Set to true to indicate a file is dragged over the screen. */
  isDraggedOver?: boolean;

  /** A function that is called when a file drop completes successfully. */
  onDropCompleted: () => void;
}
