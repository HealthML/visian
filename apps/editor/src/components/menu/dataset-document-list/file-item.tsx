import { ListItem, SquareButton } from "@visian/ui-shared";
import styled from "styled-components";

import { DocumentItem, DocumentProp } from "../data-types";

const Spacer = styled.div`
  width: 10px;
`;

const InvisibleButton = styled(SquareButton)`
  border: none;
  padding: 12px;
`;

export const FileItem = ({
  inSelectMode,
  documentItem,
  documentProp,
  toggleSelection,
}: {
  inSelectMode: boolean;
  documentItem: DocumentItem;
  documentProp: DocumentProp;
  toggleSelection: () => void;
}) => (
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
  </ListItem>
);
