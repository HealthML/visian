import { InvisibleButton, List, ListItem, Text } from "@visian/ui-shared";
import { useCallback, useState } from "react";
import styled from "styled-components";

import { DocumentWithProps } from "../../../types";

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

export const DocumentListItem = ({
  isInSelectMode,
  documentWithProps,
  toggleSelection,
}: {
  isInSelectMode: boolean;
  documentWithProps: DocumentWithProps;
  toggleSelection: () => void;
}) => {
  const [showAnnotations, setShowAnnotations] = useState(false);

  const toggleShowAnnotations = useCallback(
    () => setShowAnnotations((prevShowAnnotations) => !prevShowAnnotations),
    [],
  );

  return (
    <>
      <ListItem>
        {isInSelectMode && (
          <>
            <IconButton
              icon={
                documentWithProps.props.isSelected === false
                  ? "unchecked"
                  : "checked"
              }
              onPointerDown={toggleSelection}
            />
            <Spacer />
          </>
        )}
        <Text>{documentWithProps.documentItem.name}</Text>
        <ExpandedSpacer />
        <IconButton
          icon={showAnnotations ? "arrowDown" : "arrowLeft"}
          onPointerDown={toggleShowAnnotations}
        />
      </ListItem>
      {showAnnotations && (
        <AnnotationsList>
          {documentWithProps.documentItem.annotations.map((annotation) => (
            <ListItem key={annotation.id}>{annotation.name}</ListItem>
          ))}
        </AnnotationsList>
      )}
    </>
  );
};
