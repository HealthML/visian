import {
  AbsoluteCover,
  Box,
  FloatingUIButton,
  useTranslation,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";

import { JobHistory } from "../components/menu/job-history";
import { ProjectViewSwitch } from "../components/menu/project-view-switch";

const Container = styled(AbsoluteCover)`
  display: flex;
  flex-direction: column;
  padding: 20px;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 55px;
`;

const ColumnLeft = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 33.33%;
`;

const ColumnCenter = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  width: 33.33%;
`;

const ColumnRight = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  width: 33.33%;
`;

const Main = styled(Box)`
  display: flex;
  justify-content: center;
  height: 85%;
  width: 85%;
  margin: auto;
`;

const MenuRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
`;

const LeftButton = styled(FloatingUIButton)`
  margin-right: 16px;
`;

const StyledProjectViewSwitch = styled(Box)`
  display: flex;
  justify-content: center;
  width: 100%;
`;

export const ProjectJobsScreen: React.FC = observer(() => {
  const navigate = useNavigate();

  const projectId = useParams().projectId || "";

  const { t: translate } = useTranslation();

  return (
    <Container title={`${translate("project-base-title")}`}>
      <TopBar>
        <ColumnLeft>
          <MenuRow>
            <LeftButton
              icon="home"
              tooltipTx="home"
              onPointerDown={() => navigate(`/projects`)}
              isActive={false}
            />
            <LeftButton
              icon="pixelBrush"
              tooltipTx="open-editor"
              onPointerDown={() => navigate(`/editor`)}
              isActive={false}
            />
          </MenuRow>
        </ColumnLeft>
        <ColumnCenter>
          <StyledProjectViewSwitch>
            <ProjectViewSwitch defaultSwitchSelection="jobs" />
          </StyledProjectViewSwitch>
        </ColumnCenter>
        <ColumnRight />
      </TopBar>
      <Main>{projectId && <JobHistory projectId={projectId} />}</Main>
    </Container>
  );
});

export default ProjectJobsScreen;
