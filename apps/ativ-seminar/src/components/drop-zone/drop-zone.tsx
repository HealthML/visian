import React, { useCallback, useState } from "react";
import styled from "styled-components";

import { DropZoneProps } from "./drop-zone.props";

const StyledDiv = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

export const DropZone: React.FC<DropZoneProps> = (props) => {
  const {
    children,
    className,
    onDragEnd,
    onDragLeave,
    onDragOver,
    onDrop,
    onFileDrop,
    style,
    ...rest
  } = props;

  // Use this if we want to add styling for the drag event.
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  const dragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (onDragOver) onDragOver(event);
      setIsDraggedOver(true);
    },
    [onDragOver],
  );

  const endDrag = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      setIsDraggedOver(false);
      if (event.type === "dragend") {
        if (onDragEnd) onDragEnd(event);
      } else if (onDragLeave) onDragLeave(event);
    },
    [onDragEnd, onDragLeave],
  );

  const drop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDraggedOver(false);
      if (onDrop) onDrop(event);
      if (onFileDrop) onFileDrop(event.dataTransfer.files);
    },
    [onDrop, onFileDrop],
  );

  return (
    <StyledDiv
      {...rest}
      onDrop={drop}
      onDragOver={dragOver}
      onDragLeave={endDrag}
      onDragEnd={endDrag}
    >
      {children}
    </StyledDiv>
  );
};

export default DropZone;
