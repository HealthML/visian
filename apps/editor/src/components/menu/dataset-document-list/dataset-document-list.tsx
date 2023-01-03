import { List, stopPropagation } from "@visian/ui-shared";
import styled from "styled-components";

import { Dataset, DocumentItem } from "../../../types/dataset-types";
import { DocumentListItem } from "./document-list-item";

const DocumentList = styled(List)`
  width: 100%;
  height: 400px;
  overflow-y: auto;
`;

export const DatasetDocumentList = ({
  isInSelectMode,
  dataset,
  setSelection,
}: {
  isInSelectMode: boolean;
  dataset: Dataset;
  setSelection: (id: string, selction: boolean) => void;
}) => (
  <DocumentList onWheel={stopPropagation}>
    {dataset.map((documentItem: DocumentItem) => (
      <DocumentListItem
        isInSelectMode={isInSelectMode}
        documentItem={documentItem}
        toggleSelection={() =>
          setSelection(documentItem.id, !documentItem.props.isSelected)
        }
        key={documentItem.id}
      />
    ))}
  </DocumentList>
);
