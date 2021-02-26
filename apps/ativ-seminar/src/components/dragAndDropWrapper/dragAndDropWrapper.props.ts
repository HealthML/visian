import React from "react";

export interface DragAndDropWrapperProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** The function that is executed with the dropped files. */
  processFiles?: (files: FileList) => void;
}
