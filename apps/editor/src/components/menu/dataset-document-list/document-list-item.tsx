import { List, ListItem, SquareButton } from "@visian/ui-shared";
import { useState } from "react";
import styled from "styled-components";

import { DocumentItem, DocumentProp } from "../data-types";

const Spacer = styled.div`
  width: 10px;
`;

const ExpandedSpacer = styled.div`
  margin-right: auto;
`;

const InvisibleButton = styled(SquareButton)`
  border: none;
  padding: 12px;
`;

export const DocumentListItem = ({
  inSelectMode,
  documentItem,
  documentProp,
  toggleSelection,
}: {
  inSelectMode: boolean;
  documentItem: DocumentItem;
  documentProp: DocumentProp;
  toggleSelection: () => void;
}) => {
  const [showAnnotations, setShowAnnotations] = useState(false);

  const annotations = documentItem.annoations.map((annotation) => (
    <ListItem>{annotation.name}</ListItem>
  ));

  return (
    <>
      <ListItem>
        {inSelectMode && (
          <>
            <InvisibleButton
              icon={documentProp.isSelected === false ? "unchecked" : "checked"}
              tooltipTx="Select"
              onPointerDown={toggleSelection}
            />
            <Spacer />
          </>
        )}
        <h4>{documentItem.name}</h4>
        <ExpandedSpacer />
        <InvisibleButton
          icon="chevron"
          style={{
            transform: showAnnotations ? "rotate(-180deg)" : "rotate(-90deg)",
          }}
          tooltipTx="Select"
          onPointerDown={toggleSelection}
        />
      </ListItem>
      <List>{annotations}</List>
    </>
  );
};
