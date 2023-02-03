import { Box, Modal, Screen, Text, useTranslation } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React from "react";
import styled from "styled-components";

import { JobHistory } from "../components/menu/job-history";

const Main = styled(Box)`
  display: flex;
  justify-content: center;
  height: 100%;
  padding: 5rem 10rem;
`;

const StyledModal = styled(Modal)`
  vertical-align: middle;
  width: 100%;
`;

// const projectId = "3c0e0243-cabe-4bb4-aa50-369f1c4a8fc3";

export const ProjectScreen: React.FC = observer(() => {
  const { t: translate } = useTranslation();

  return (
    <Screen>
      <Main>
        <JobHistory />
      </Main>
    </Screen>
  );
});

export default ProjectScreen;
