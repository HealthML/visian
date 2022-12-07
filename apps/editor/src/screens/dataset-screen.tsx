import { Box, Modal, Screen, useIsDraggedOver } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import styled from "styled-components";

import { DatasetFileList } from "../components/menu/dataset-file-list";
import { DatasetNavbar } from "../components/menu/dataset-navbar";
import { datasetMoc } from "./dataset-moc";

const Main = styled(Box)`
  display: flex;
  justify-content: center;
  height: 100%;
  padding-top: 5rem;
  padding-bottom: 5rem;
  padding-left: 10rem;
  padding-right: 10rem;
`;

const TestModal = styled(Modal)`
  vertical-align: middle;
  width: 100%;
`;

export const DatasetScreen: React.FC = observer(() => {
  const [isDraggedOver, { onDrop, ...dragListeners }] = useIsDraggedOver();
  const [inSelectMode, setInSelectMode] = useState(false);
  const [dataset, setDataset] = useState(datasetMoc);

  const setSelection = (id: number, selection: boolean) => {
    setDataset((prevDataset) =>
      prevDataset.map((file) =>
        file.id === id ? { ...file, isSelected: selection } : file,
      ),
    );
  };

  const toggleSelectAll = (select: boolean) => {
    setDataset((prevDataset) =>
      prevDataset.map((file) => ({
        ...file,
        isSelected: select,
      })),
    );
  };

  return (
    <Screen {...dragListeners} title="VISIAN Projects">
      <Main>
        <TestModal
          hideHeaderDivider={false}
          labelTx="Example Dataset"
          position="right"
          headerChildren={
            <DatasetNavbar
              inSelectMode={inSelectMode}
              toggleSelectMode={() => {
                setInSelectMode((prev) => !prev);
              }}
              toggleSelectAll={toggleSelectAll}
            />
          }
        >
          <DatasetFileList
            inSelectMode={inSelectMode}
            dataset={dataset}
            setSelection={setSelection}
          />
        </TestModal>
      </Main>
    </Screen>
  );
});

export default DatasetScreen;
