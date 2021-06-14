export interface DropSheetProps {
  /** A function that is called when a file drop completes successfully. */
  onDropCompleted: () => void;
  /** A function called when a file is dropped outside the drop zone. */
  onOutsideDrop?: () => void;
}
