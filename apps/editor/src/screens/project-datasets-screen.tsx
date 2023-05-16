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

import { DatasetsGrid } from "../components/data-manager/datasets-grid";
import { ProjectViewSwitch } from "../components/data-manager/project-view-switch";

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

const RightButton = styled(FloatingUIButton)`
  margin-left: 16px;
`;

const StyledProjectViewSwitch = styled(Box)`
  display: flex;
  justify-content: center;
  width: 100%;
`;

export const ProjectDatasetsScreen: React.FC = observer(() => {
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
              tooltipPosition="bottom"
              onPointerDown={() => navigate(`/projects`)}
              isActive={false}
            />
          </MenuRow>
        </ColumnLeft>
        <ColumnCenter>
          <StyledProjectViewSwitch>
            <ProjectViewSwitch defaultSwitchSelection="datasets" />
          </StyledProjectViewSwitch>
        </ColumnCenter>
        <ColumnRight>
          <RightButton
            icon="pixelBrush"
            tooltipTx="open-editor"
            tooltipPosition="left"
            onPointerDown={() => navigate(`/editor`)}
            isActive={false}
          />
        </ColumnRight>
      </TopBar>
      <Main>{projectId && <DatasetsGrid projectId={projectId} />}</Main>
    </Container>
  );
});

export default ProjectDatasetsScreen;
