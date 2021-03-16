import { color, radius, sheetMixin, Subtitle, Text } from "@visian/ui-shared";
import React, { useCallback, useState } from "react";
import styled, { css } from "styled-components";

import { DropZoneProps } from "./drop-zone.props";

const StyledDiv = styled.div<{
  alwaysShown?: boolean;
  isDraggedOver?: boolean;
}>`
  ${(props) => (props.isDraggedOver || props.alwaysShown) && sheetMixin}
  ${(props) =>
    props.isDraggedOver &&
    css`
      border: 2px solid ${color("text")};
    `}
  border-radius: ${radius("default")};
  align-items: center;
  display: flex;
  justify-content: center;
`;

export const DropZone: React.FC<DropZoneProps> = (props) => {
  const {
    alwaysShown,
    children,
    label,
    onDragEnd,
    onDragLeave,
    onDragOver,
    onDrop,
    onFileDrop,
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
      alwaysShown={alwaysShown}
      isDraggedOver={isDraggedOver}
    >
      {children}
      {label && (isDraggedOver || alwaysShown) && <Subtitle text={label} />}
    </StyledDiv>
  );
};

export default DropZone;
