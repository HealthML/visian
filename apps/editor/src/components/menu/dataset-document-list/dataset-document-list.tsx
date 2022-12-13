import { List, stopPropagation } from "@visian/ui-shared";
import styled from "styled-components";

import { Dataset, DocumentItem } from "../data-types";
import { DocumentListItem } from "./document-list-item";

const DocumentList = styled(List)`
  width: 100%;
  height: 400px;
  overflow-y: auto;
`;

export const DatasetDocumentList = ({
  inSelectMode,
  dataset,
  setSelection,
  toggleShowAnnotations,
}: {
  inSelectMode: boolean;
  dataset: Dataset;
  setSelection: (id: string, selction: boolean) => void;
  toggleShowAnnotations: (id: string) => void;
}) => {
  const documentList = dataset.map((documentItem: DocumentItem) => (
    <DocumentListItem
      inSelectMode={inSelectMode}
      documentItem={documentItem}
      toggleSelection={() =>
        setSelection(documentItem.id, !documentItem.props.isSelected)
      }
      toggleShowAnnotations={() => toggleShowAnnotations(documentItem.id)}
      key={documentItem.id}
    />
  ));

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <DocumentList onWheel={stopPropagation}>{documentList}</DocumentList>;
};
