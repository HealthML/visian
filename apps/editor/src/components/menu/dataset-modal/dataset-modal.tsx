import { Modal } from "@visian/ui-shared";
import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";

import { Dataset, DocumentItem, DocumentWithProps } from "../../../types";
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
  // TODO: use a map for props
  const [datasetWithProps, setDatasetWithProps] = useState(
    dataset.map((document: DocumentItem) => ({
      documentItem: document,
      props: { isSelected: false },
    })),
  );

  // sync dataset with datasetProps and update selectCount
  useEffect(() => {
    setDatasetWithProps((prev: DocumentWithProps[]) =>
      dataset.map((document: DocumentItem) => ({
        documentItem: document,
        props: prev.find(
          (prevDocument: DocumentWithProps) =>
            prevDocument.documentItem.id === document.id,
        )?.props ?? { isSelected: false },
      })),
    );
  }, [dataset]);

  const setSelection = useCallback((id: string, selection: boolean) => {
    let countDiff = 0;
    setDatasetWithProps((prevDatasetWithProps: DocumentWithProps[]) =>
      prevDatasetWithProps.map((documentWithProps: DocumentWithProps) => {
        if (documentWithProps.documentItem.id !== id) return documentWithProps;
        if (documentWithProps.props.isSelected !== selection) {
          countDiff = documentWithProps.props.isSelected && !selection ? -1 : 1;
        }
        return {
          ...documentWithProps,
          props: { ...documentWithProps.props, isSelected: selection },
        };
      }),
    );
  }, []);

  const setSelectAll = useCallback((selection: boolean) => {
    setDatasetWithProps((prevDatasetWithProps: DocumentWithProps[]) =>
      prevDatasetWithProps.map((documentWithProps: DocumentWithProps) => ({
        ...documentWithProps,
        props: { ...documentWithProps.props, isSelected: selection },
      })),
    );
  }, []);

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

  const areAllSelected = useMemo(
    () =>
      datasetWithProps.filter(
        (document: DocumentWithProps) => document.props.isSelected,
      ).length === datasetWithProps.length,
    [datasetWithProps],
  );

  return (
    <StyledModal
      hideHeaderDivider={false}
      label="Example Dataset"
      position="right"
      headerChildren={
        <DatasetNavigationbar
          isInSelectMode={isInSelectMode}
          allSelected={areAllSelected}
          // TODO: Use a callback
          toggleSelectMode={() => {
            if (isInSelectMode) {
              setSelectAll(false);
            }
            setIsInSelectMode((prev: boolean) => !prev);
          }}
          // TODO: Use a callback
          toggleSelectAll={() =>
            areAllSelected ? setSelectAll(false) : setSelectAll(true)
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
