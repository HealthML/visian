import { FileItem } from "./file-item";

export const DatasetFileList = ({
  inSelectMode,
  dataset,
  setSelection,
}: {
  inSelectMode: boolean;
  dataset: any;
  setSelection: any;
}) => {
  const fileList = dataset.map((file: any) => (
    <FileItem
      inSelectMode={inSelectMode}
      file={file}
      toggleSelection={() => setSelection(file.id, !file.isSelected)}
      key={file.id}
    />
  ));

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <div style={{ width: "100%" }}>{fileList}</div>;
};
