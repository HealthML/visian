import { Icon, ListItem, Text } from "@visian/ui-shared";
import React, { useMemo } from "react";
import styled, { css } from "styled-components";

import { useAnnotationsByImage } from "../../../queries";
import { handleImageSelection } from "../util";
import { VerifiedTag } from "../verified-tag";
import { ProjectDataExplorerImageListItemProps } from "./project-data-explorer-image-list-item.props";

const StyledListItem = styled(ListItem)<{ isActive?: boolean }>`
  user-select: none;
  // Fix too thick line on intersection between active items
  margin: 1px 3%;
  // Fix items moving by 1px on selection / deselection
  ${(props) =>
    !props.isActive &&
    css`
      padding: 1px 0;
    `}
`;

const StyledIcon = styled(Icon)`
  width: 2rem;
  height: 2rem;
  padding-right: 0.8rem;
`;

export const ProjectDataExplorerImageListItem: React.FC<
  ProjectDataExplorerImageListItemProps
> = ({
  image,
  index,
  images,
  selectedImages,
  isShiftPressed,
  selectedRange,
  setSelectedRange,
  setImageSelection,
  setSelectedImages,
}) => {
  const { annotations } = useAnnotationsByImage(image.id);

  const hasVerifiedAnnotation = useMemo(
    () => annotations?.some((annotation) => annotation.verified) ?? false,
    [annotations],
  );

  return (
    <StyledListItem
      isLast
      isActive={selectedImages.has(image.id)}
      onPointerDown={() =>
        handleImageSelection(
          image.id,
          index,
          selectedImages,
          isShiftPressed,
          selectedRange,
          setSelectedRange,
          images,
          setImageSelection,
          setSelectedImages,
        )
      }
    >
      <StyledIcon icon="document" />
      <Text>{image.dataUri.split("/").pop()}</Text>
      {hasVerifiedAnnotation && <VerifiedTag hasSpacing />}
    </StyledListItem>
  );
};
