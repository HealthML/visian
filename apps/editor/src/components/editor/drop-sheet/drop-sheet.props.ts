export interface DropSheetProps {
  /** A function called when a file drop inside the drop zone completes successfully. */
  onDropCompleted: () => void;
  /** A function called when a file drop is initiated inside the drop zone. */
  onDropStarted?: () => void;
  /** A function called when a file is dropped outside the drop zone. */
  onOutsideDrop?: () => void;
}
