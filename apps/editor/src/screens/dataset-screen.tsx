import { Box, Modal, Screen, useIsDraggedOver } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";

import { DatasetDocumentList } from "../components/menu/dataset-document-list";
import { DatasetNavigationbar } from "../components/menu/dataset-navigationbar";
import {
  deleteDocumentFromDatabase,
  getDatasetFormDatabase,
} from "../components/menu/hub-actions";
import { Dataset, DocumentItem } from "../types/dataset-types";

const Main = styled(Box)`
  display: flex;
  justify-content: center;
  height: 100%;
  padding: 5rem 10rem;
`;

const DatasetModal = styled(Modal)`
  vertical-align: middle;
  width: 100%;
`;

export const DatasetScreen: React.FC = observer(() => {
  const [, { onDrop, ...dragListeners }] = useIsDraggedOver();

  const [isInSelectMode, setIsInSelectMode] = useState(false);
  const [dataset, setDataset] = useState([] as Dataset);
  const [selectCount, setSelectCount] = useState(0);

  // fetch dataset
  useEffect(() => {
    (async () => setDataset(await getDatasetFormDatabase()))();
  }, []);

  const setSelection = useCallback((id: string, selection: boolean) => {
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
  }, []);

  const setSelectAll = useCallback(
    (selection: boolean) => {
      setSelectCount(selection ? dataset.length : 0);
      setDataset((prevDataset: Dataset) =>
        prevDataset.map((document: DocumentItem) => ({
          ...document,
          props: { ...document.props, isSelected: selection },
        })),
      );
    },
    [dataset],
  );

  const deleteSelectedDocuments = useCallback(() => {
    setDataset((prevDataset) =>
      prevDataset.filter((document) =>
        document.props.isSelected
          ? !deleteDocumentFromDatabase(document.id)
          : true,
      ),
    );
  }, []);

  return (
    <Screen {...dragListeners} title="VISIAN Projects">
      <Main>
        <DatasetModal
          hideHeaderDivider={false}
          label="Example Dataset"
          position="right"
          headerChildren={
            <DatasetNavigationbar
              isInSelectMode={isInSelectMode}
              allSelected={selectCount === dataset.length}
              toggleSelectMode={() => {
                if (isInSelectMode) {
                  setSelectAll(false);
                }
                setIsInSelectMode((prev: boolean) => !prev);
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
            isInSelectMode={isInSelectMode}
            dataset={dataset}
            setSelection={setSelection}
          />
        </DatasetModal>
      </Main>
    </Screen>
  );
});

export default DatasetScreen;
