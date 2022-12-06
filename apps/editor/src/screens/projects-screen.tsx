import { Box, Modal, Screen, useIsDraggedOver } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import styled from "styled-components";

import { DatasetNavbar } from "../components/menu/dataset-navbar";

export const ProjectsScreen: React.FC = observer(() => {
  const [isDraggedOver, { onDrop, ...dragListeners }] = useIsDraggedOver();
  const [inSelectMode, setInSelectMode] = useState(false);

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
              toggleSelectMode={true}
            />
          }
        >
          <div>
            <h1>
              blasd asd as d asd asd asd as d as das da s das dsa das as d asd
              as d asd a sd asd a sd asd as da sd asd a
            </h1>
          </div>
          <h1>bla</h1>
          <h1>bla</h1>
          <h1>bla</h1>
        </TestModal>
      </Main>
    </Screen>
  );
});

export default ProjectsScreen;
