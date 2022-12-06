import { Box, Modal, Screen, useIsDraggedOver } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import styled from "styled-components";

import { DatasetNavbar } from "../components/menu/dataset-navbar";

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
            />
          }
        >
          <div>
            <h1>blasd asd</h1>
          </div>
        </TestModal>
      </Main>
    </Screen>
  );
});

export default DatasetScreen;
