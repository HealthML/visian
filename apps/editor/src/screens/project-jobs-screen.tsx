import {
  Box,
  InvisibleButton,
  Screen,
  useTranslation,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { JobHistory } from "../components/menu/job-history";
import { ProjectViewSwitch } from "../components/menu/project-view-switch";

const Main = styled(Box)`
  display: flex;
  justify-content: center;
  height: 90%;
  padding: 1rem 10rem;
`;

const StyledProjectViewSwitch = styled(Box)`
  display: flex;
  justify-content: center;
  width: 100%;
  position: absolute;
  top: 20px;
`;

const IconButton = styled(InvisibleButton)`
  width: 40px;
  margin: 5px;
  z-index: 51;
`;

// TODO z-index logic

export const ProjectJobsScreen: React.FC = observer(() => {
  const navigate = useNavigate();

  const { t: translate } = useTranslation();

  return (
    <Screen title={`${translate("project-base-title")}`}>
      <IconButton icon="menu" onPointerDown={() => navigate(`/projects`)} />
      <Main>
        <StyledProjectViewSwitch>
          <ProjectViewSwitch defaultSwitchSelection="jobs" />
        </StyledProjectViewSwitch>
        <JobHistory />
      </Main>
    </Screen>
  );
});

export default ProjectJobsScreen;
