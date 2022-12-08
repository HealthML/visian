import { Dataset, DatasetProps, DocumentItem } from "../data-types";
import { FileItem } from "./file-item";

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
    <FileItem
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
  return <div style={{ width: "100%" }}>{documentList}</div>;
};
