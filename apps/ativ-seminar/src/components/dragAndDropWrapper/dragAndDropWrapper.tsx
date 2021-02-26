import React, { useCallback, useState } from "react";
import styled from "styled-components";

import { DragAndDropWrapperProps } from "./dragAndDropWrapper.props";

const StyledDiv = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const DragAndDropWrapper: React.FC<DragAndDropWrapperProps> = (props) => {
  const {
    children,
    className,
    onDragEnd,
    onDragLeave,
    onDragOver,
    onDrop,
    style,
    processFiles,
    ...rest
  } = props;

  // Use this if we want to add styling for the drag event.
  const [isDraggable, setIsDraggable] = useState(false);

  const dragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (onDragOver) onDragOver(event);
      setIsDraggable(true);
    },
    [onDragOver],
  );

  const endDrag = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      setIsDraggable(false);
      if (event.type === "dragend") {
        if (onDragEnd) onDragEnd(event);
      } else if (onDragLeave) onDragLeave(event);
    },
    [onDragEnd, onDragLeave],
  );

  const drop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDraggable(false);
      if (onDrop) onDrop(event);
      if (processFiles) processFiles(event.dataTransfer.files);
    },
    [onDrop, processFiles],
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

export default DragAndDropWrapper;
