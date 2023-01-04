import { Modal } from "@visian/ui-shared";
import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";

import { Dataset, DocumentWithProps } from "../../../types";
import { DatasetDocumentList } from "../dataset-document-list";
import { DatasetNavigationbar } from "../dataset-navigationbar";

const StyledModal = styled(Modal)`
  vertical-align: middle;
  width: 100%;
`;

export const DatasetModal = ({
  dataset,
  deleteDocuments,
}: {
  dataset: Dataset;
  deleteDocuments: (ids: string[]) => void;
}) => {
  const [isInSelectMode, setIsInSelectMode] = useState(false);
  const [datasetWithProps, setDatasetWithProps] = useState(
    dataset.map((document) => ({
      documentItem: document,
      props: { isSelected: false },
    })),
  );
  const [selectCount, setSelectCount] = useState(0);

  // sync dataset with datasetProps
  useEffect(() => {
    setDatasetWithProps(
      dataset.map((document) => ({
        documentItem: document,
        props: { isSelected: false },
      })),
    );
  }, [dataset]);

  const setSelection = useCallback((id: string, selection: boolean) => {
    setDatasetWithProps((prevDatasetWithProps: DocumentWithProps[]) =>
      prevDatasetWithProps.map((documentWithProps: DocumentWithProps) => {
        if (documentWithProps.documentItem.id !== id) return documentWithProps;
        if (documentWithProps.props.isSelected !== selection) {
          setSelectCount(
            (prevCount) =>
              prevCount +
              (documentWithProps.props.isSelected && !selection ? -1 : 1),
          );
        }
        return {
          ...documentWithProps,
          props: { ...documentWithProps.props, isSelected: selection },
        };
      }),
    );
  }, []);

  const setSelectAll = useCallback(
    (selection: boolean) => {
      setSelectCount(selection ? datasetWithProps.length : 0);
      setDatasetWithProps((prevDatasetWithProps: DocumentWithProps[]) =>
        prevDatasetWithProps.map((documentWithProps: DocumentWithProps) => ({
          ...documentWithProps,
          props: { ...documentWithProps.props, isSelected: selection },
        })),
      );
    },
    [datasetWithProps],
  );

  const deleteSelectedDocuments = useCallback(() => {
    const selectedIds = datasetWithProps
      .filter(
        (documentWithProps: DocumentWithProps) =>
          documentWithProps.props.isSelected,
      )
      .map(
        (documentWithProps: DocumentWithProps) =>
          documentWithProps.documentItem.id,
      );
    deleteDocuments(selectedIds);
  }, [deleteDocuments, datasetWithProps]);

  useEffect(() => {
    console.log(selectCount);
  });

  return (
    <StyledModal
      hideHeaderDivider={false}
      label="Example Dataset"
      position="right"
      headerChildren={
        <DatasetNavigationbar
          isInSelectMode={isInSelectMode}
          allSelected={selectCount === datasetWithProps.length}
          toggleSelectMode={() => {
            if (isInSelectMode) {
              setSelectAll(false);
            }
            setIsInSelectMode((prev: boolean) => !prev);
          }}
          toggleSelectAll={() =>
            selectCount === datasetWithProps.length
              ? setSelectAll(false)
              : setSelectAll(true)
          }
          deleteSelectedDocuments={deleteSelectedDocuments}
        />
      }
    >
      <DatasetDocumentList
        isInSelectMode={isInSelectMode}
        datasetWithProps={datasetWithProps}
        setSelection={setSelection}
      />
    </StyledModal>
  );
};
