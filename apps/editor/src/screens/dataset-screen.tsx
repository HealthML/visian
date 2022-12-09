import { Box, Modal, Screen, useIsDraggedOver } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

import {
  Dataset,
  DatasetProps,
  DocumentItem,
} from "../components/menu/data-types";
import { DatasetDocumentList } from "../components/menu/dataset-document-list";
import { DatasetNavbar } from "../components/menu/dataset-navbar";
import { getDataset } from "./dataset-moc";

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
  const [datasetProps, setDatasetProps] = useState({} as DatasetProps);
  const [selectCount, setSelectCount] = useState(0);

  // fetch dataset
  useEffect(() => {
    (async () => setDataset(await getDataset()))();
  }, []);

  // sync datasetProps with dataset
  useEffect(() => {
    setDatasetProps((prevDatasetProps) => {
      const newDatasetProps: DatasetProps = {};
      dataset.forEach((documentItem: DocumentItem) => {
        newDatasetProps[documentItem.id] = prevDatasetProps[
          documentItem.id
        ] ?? {
          isSelected: false,
        };
      });
      return newDatasetProps;
    });
  }, [dataset]);

  const setSelection = (id: string, selection: boolean) => {
    if (datasetProps[id].isSelected !== selection) {
      setSelectCount(
        (prevCount) =>
          prevCount + (datasetProps[id].isSelected && !selection ? -1 : 1),
      );
    }
    setDatasetProps((prevDatasetProps: DatasetProps) => ({
      ...prevDatasetProps,
      [id]: { ...prevDatasetProps[id], isSelected: selection },
    }));
  };

  const setSelectAll = (select: boolean) => {
    setSelectCount(select ? dataset.length : 0);
    setDatasetProps((prevDatasetProps: DatasetProps) => {
      const newDatasetProps: DatasetProps = {};
      Object.keys(prevDatasetProps).forEach((id: string) => {
        newDatasetProps[id] = { ...prevDatasetProps[id], isSelected: select };
      });
      return newDatasetProps;
    });
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
            />
          }
        >
          <DatasetDocumentList
            inSelectMode={inSelectMode}
            dataset={dataset}
            datasetProps={datasetProps}
            setSelection={setSelection}
          />
        </DatasetModal>
      </Main>
    </Screen>
  );
});

export default DatasetScreen;
