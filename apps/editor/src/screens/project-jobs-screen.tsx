import {
  Box,
  FloatingUIButton,
  Screen,
  useTranslation,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { JobHistory } from "../components/menu/job-history";
import { ProjectViewSwitch } from "../components/menu/project-view-switch";

const Container = styled(Screen)`
  padding: 20px;
`;

const Main = styled(Box)`
  display: flex;
  justify-content: center;
  height: 100%;
  padding: 1rem 10rem 5rem;
`;

const MenuRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
`;

const StyledProjectViewSwitch = styled(Box)`
  display: flex;
  justify-content: center;
  width: 100%;
`;

const IconButton = styled(FloatingUIButton)`
  margin-right: 16px;
`;

export const ProjectJobsScreen: React.FC = observer(() => {
  const navigate = useNavigate();

  const { t: translate } = useTranslation();

  return (
    <Container title={`${translate("project-base-title")}`}>
      <MenuRow>
        <IconButton
          icon="home"
          tooltipTx="Home"
          onPointerDown={() => navigate(`/projects`)}
        />
        <StyledProjectViewSwitch>
          <ProjectViewSwitch defaultSwitchSelection="jobs" />
        </StyledProjectViewSwitch>
      </MenuRow>
      <Main>
        <JobHistory />
      </Main>
    </Container>
  );
});

export default ProjectJobsScreen;
