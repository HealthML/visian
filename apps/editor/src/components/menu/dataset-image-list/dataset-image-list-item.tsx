import { InvisibleButton, List, ListItem, Text } from "@visian/ui-shared";
import { useCallback, useState } from "react";
import styled from "styled-components";

import { Annotation, Image } from "../../../types";

const Spacer = styled.div`
  width: 10px;
`;

const ExpandedSpacer = styled.div`
  margin-right: auto;
`;

const IconButton = styled(InvisibleButton)`
  width: 30px;
`;

const AnnotationsList = styled(List)`
  margin-left: 30px;
  width: calc(100% - 30px);
`;

export const DatasetImageListItem = ({
  isInSelectMode,
  image,
  isSelected,
  toggleSelection,
}: {
  isInSelectMode: boolean;
  image: Image;
  isSelected: boolean;
  toggleSelection: () => void;
}) => {
  const [showAnnotations, setShowAnnotations] = useState(false);

  const toggleShowAnnotations = useCallback(
    () => setShowAnnotations((prev: boolean) => !prev),
    [],
  );

  return (
    <>
      <ListItem>
        {isInSelectMode && (
          <>
            <IconButton
              icon={isSelected ? "checked" : "unchecked"}
              onPointerDown={toggleSelection}
            />
            <Spacer />
          </>
        )}
        <Text>{image.dataUri}</Text>
        <ExpandedSpacer />
        <IconButton
          icon={showAnnotations ? "arrowDown" : "arrowLeft"}
          onPointerDown={toggleShowAnnotations}
        />
      </ListItem>
      {showAnnotations && (
        <AnnotationsList>
          {image.annotations.map((annotation: Annotation) => (
            <ListItem key={annotation.id}>{annotation.dataUri}</ListItem>
          ))}
        </AnnotationsList>
      )}
    </>
  );
};
