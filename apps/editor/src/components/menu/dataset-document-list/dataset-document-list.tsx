import { List, stopPropagation } from "@visian/ui-shared";
import styled from "styled-components";

import { DocumentWithProps } from "../../../types";
import { DocumentListItem } from "./document-list-item";

const DocumentList = styled(List)`
  width: 100%;
  height: 400px;
  overflow-y: auto;
`;

export const DatasetDocumentList = ({
  isInSelectMode,
  datasetWithProps,
  setSelection,
}: {
  isInSelectMode: boolean;
  datasetWithProps: DocumentWithProps[];
  setSelection: (id: string, selction: boolean) => void;
}) => (
  <DocumentList onWheel={stopPropagation}>
    {datasetWithProps.map((documentWithProps: DocumentWithProps) => (
      <DocumentListItem
        isInSelectMode={isInSelectMode}
        documentWithProps={documentWithProps}
        toggleSelection={() =>
          setSelection(
            documentWithProps.documentItem.id,
            !documentWithProps.props.isSelected,
          )
        }
        key={documentWithProps.documentItem.id}
      />
    ))}
  </DocumentList>
);
