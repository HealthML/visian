import { List, ListItem, SquareButton } from "@visian/ui-shared";
import styled from "styled-components";

import { DocumentItem } from "../data-types";

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

const AnnotationsListItem = styled(ListItem)`
  margin-left: 30px;
`;

export const DocumentListItem = ({
  isInSelectMode,
  documentItem,
  toggleSelection,
  toggleShowAnnotations,
}: {
  isInSelectMode: boolean;
  documentItem: DocumentItem;
  toggleSelection: () => void;
  toggleShowAnnotations: () => void;
}) => {
  const annotations = documentItem.annotations.map((annotation) => (
    <AnnotationsListItem key={annotation.id}>
      {annotation.name}
    </AnnotationsListItem>
  ));

  return (
    <>
      <ListItem>
        {isInSelectMode && (
          <>
            <InvisibleButton
              icon={
                documentItem.props.isSelected === false
                  ? "unchecked"
                  : "checked"
              }
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
            transform: documentItem.props.showAnnotations
              ? "rotate(-180deg)"
              : "rotate(-90deg)",
          }}
          tooltipTx="Select"
          onPointerDown={toggleShowAnnotations}
        />
      </ListItem>
      {documentItem.props.showAnnotations && <List>{annotations}</List>}
    </>
  );
};
