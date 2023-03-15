import {
  Box,
  FloatingUIButton,
  Screen,
  useTranslation,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";

import { DatasetsGrid } from "../components/menu/datasets-grid";
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

export const ProjectDatasetsScreen: React.FC = observer(() => {
  const navigate = useNavigate();

  const projectId = useParams().projectId || "";

  const { t: translate } = useTranslation();

  return (
    <Container title={`${translate("project-base-title")}`}>
      <MenuRow>
        <IconButton
          icon="home"
          tooltipTx="Home"
          onPointerDown={() => navigate(`/projects`)}
          isActive={false}
        />
        <StyledProjectViewSwitch>
          <ProjectViewSwitch defaultSwitchSelection="datasets" />
        </StyledProjectViewSwitch>
      </MenuRow>
      <Main>{projectId && <DatasetsGrid projectId={projectId} />}</Main>
    </Container>
  );
});

export default ProjectDatasetsScreen;
