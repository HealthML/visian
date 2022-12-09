import { List, stopPropagation } from "@visian/ui-shared";
import styled from "styled-components";

import { Dataset, DatasetProps, DocumentItem } from "../data-types";
import { DocumentListItem } from "./document-list-item";

const DocumentList = styled(List)`
  width: 100%;
  height: 400px;
  overflow-y: auto;
`;

export const DatasetDocumentList = ({
  inSelectMode,
  dataset,
  datasetProps,
  setSelection,
}: {
  inSelectMode: boolean;
  dataset: Dataset;
  datasetProps: DatasetProps;
  setSelection: (id: string, selction: boolean) => void;
}) => {
  const documentList = dataset.map((documentItem: DocumentItem) => (
    <DocumentListItem
      inSelectMode={inSelectMode}
      documentItem={documentItem}
      documentProp={datasetProps[documentItem.id]}
      toggleSelection={() =>
        setSelection(documentItem.id, !datasetProps[documentItem.id].isSelected)
      }
      key={documentItem.id}
    />
  ));

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <DocumentList onWheel={stopPropagation}>{documentList}</DocumentList>;
};
