import React from "react";

export interface DropZoneProps extends React.HTMLAttributes<HTMLDivElement> {
  /** An event handler that is called after a successful file drop. */
  onFileDrop?: (files: FileList) => void;
}
