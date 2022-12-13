import { Box, Modal, Screen, useIsDraggedOver } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { Dataset, DocumentItem } from "../components/menu/data-types";
import { DatasetDocumentList } from "../components/menu/dataset-document-list";
import { DatasetNavbar } from "../components/menu/dataset-navbar";
import {
  deleteDocumentFromDatabase,
  getDatasetFormDatabase,
} from "./hub-actions";

const Main = styled(Box)`
  display: flex;
  justify-content: center;
  height: 100%;
  padding-top: 5rem;
  padding-bottom: 5rem;
  padding-left: 10rem;
  padding-right: 10rem;
`;

const DatasetModal = styled(Modal)`
  vertical-align: middle;
  width: 100%;
`;

export const DatasetScreen: React.FC = observer(() => {
  const [isDraggedOver, { onDrop, ...dragListeners }] = useIsDraggedOver();

  const [inSelectMode, setInSelectMode] = useState(false);
  const [dataset, setDataset] = useState([] as Dataset);
  const [selectCount, setSelectCount] = useState(0);

  // fetch dataset
  useEffect(() => {
    (async () => setDataset(await getDatasetFormDatabase()))();
  }, []);

  const setSelection = (id: string, selection: boolean) => {
    setDataset((prevDataset: Dataset) =>
      prevDataset.map((document: DocumentItem) => {
        if (document.id !== id) return document;
        if (document.props.isSelected !== selection) {
          setSelectCount(
            (prevCount) =>
              prevCount + (document.props.isSelected && !selection ? -1 : 1),
          );
        }
        return {
          ...document,
          props: { ...document.props, isSelected: selection },
        };
      }),
    );
  };

  const setSelectAll = (selection: boolean) => {
    setSelectCount(selection ? dataset.length : 0);
    setDataset((prevDataset: Dataset) =>
      prevDataset.map((document: DocumentItem) => ({
        ...document,
        props: { ...document.props, isSelected: selection },
      })),
    );
  };

  const toggleShowAnnotations = (id: string) => {
    setDataset((prevDataset: Dataset) =>
      prevDataset.map((document) =>
        document.id === id
          ? {
              ...document,
              props: {
                ...document.props,
                showAnnotations: !document.props.showAnnotations,
              },
            }
          : document,
      ),
    );
  };

  const deleteSelectedDocuments = () => {
    setDataset((prevDataset) =>
      prevDataset.filter((document) =>
        document.props.isSelected
          ? !deleteDocumentFromDatabase(document.id)
          : true,
      ),
    );
  };

  return (
    <Screen {...dragListeners} title="VISIAN Projects">
      <Main>
        <DatasetModal
          hideHeaderDivider={false}
          labelTx="Example Dataset"
          position="right"
          headerChildren={
            <DatasetNavbar
              inSelectMode={inSelectMode}
              allSelected={selectCount === dataset.length}
              toggleSelectMode={() => {
                if (inSelectMode) {
                  setSelectAll(false);
                }
                setInSelectMode((prev: boolean) => !prev);
              }}
              toggleSelectAll={() =>
                selectCount === dataset.length
                  ? setSelectAll(false)
                  : setSelectAll(true)
              }
              deleteSelectedDocuments={deleteSelectedDocuments}
            />
          }
        >
          <DatasetDocumentList
            inSelectMode={inSelectMode}
            dataset={dataset}
            setSelection={setSelection}
            toggleShowAnnotations={toggleShowAnnotations}
          />
        </DatasetModal>
      </Main>
    </Screen>
  );
});

export default DatasetScreen;
