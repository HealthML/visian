import React, { useCallback, useEffect, useState } from "react";
import styled, { css } from "styled-components";
import { useTranslation } from "../../i18n";

import { color, radius } from "../../theme";
import { sheetMixin } from "../sheet";
import { Subtitle } from "../text";
import { DropZoneProps } from "./drop-zone.props";

const StyledDiv = styled.div<{
  isAlwaysVisible?: boolean;
  isDraggedOver?: boolean;
}>`
  ${(props) => (props.isAlwaysVisible || props.isDraggedOver) && sheetMixin}
  ${(props) =>
    props.isDraggedOver &&
    css`
      border-color: ${color("text")};
    `}
  align-items: center;
  border-radius: ${radius("default")};
  display: flex;
  justify-content: center;
  pointer-events: auto;
`;

export const DropZone: React.FC<DropZoneProps> = (props) => {
  const {
    children,
    isAlwaysVisible,
    label,
    labelTx,
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
      event.dataTransfer.dropEffect = "copy";
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

  const { t } = useTranslation();
  return (
    <StyledDiv
      {...rest}
      onDrop={drop}
      onDragOver={dragOver}
      onDragLeave={endDrag}
      onDragEnd={endDrag}
      isAlwaysVisible={isAlwaysVisible}
      isDraggedOver={isDraggedOver}
    >
      {(labelTx || label) && (isAlwaysVisible || isDraggedOver) ? (
        <Subtitle text={label} tx={labelTx} />
      ) : (
        children
      )}
    </StyledDiv>
  );
};

export default DropZone;
