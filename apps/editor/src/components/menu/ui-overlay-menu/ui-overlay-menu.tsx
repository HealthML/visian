import { AbsoluteCover, FloatingUIButton, Modal } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { ProjectViewSwitch } from "../project-view-switch";
import { UIOverlayMenuProps } from "./ui-overlay-menu.props";

const Container = styled(AbsoluteCover)`
  align-items: stretch;
  display: flex;
  flex-direction: column;
  padding: 20px;
  z-index: 1;
  pointer-events: none;
  user-select: none;
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

const MenuRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
`;

const RightBar = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const LeftButton = styled(FloatingUIButton)`
  margin-right: 16px;
`;

const RightButton = styled(FloatingUIButton)`
  margin-left: 16px;
`;

const Main = styled.div`
  display: flex;
  margin: auto;
`;

const StyledModal = styled(Modal)`
  display: flex;
  height: 75vh;
  width: 75vw;
`;

export const UIOverlayMenu = observer<UIOverlayMenuProps>(
  ({
    backButton,
    editButton,
    projectViewSwitch,
    defaultSwitchSelection,
    main,
  }) => {
    const navigate = useNavigate();

    return (
      <Container>
        <TopBar>
          <ColumnLeft>
            <MenuRow>
              <LeftButton
                icon="home"
                tooltipTx="Home"
                tooltipPosition="right"
                onPointerDown={() => navigate(`/projects`)}
                isActive={false}
              />
              {backButton && (
                <LeftButton
                  icon="arrowBack"
                  tooltipTx="Back"
                  tooltipPosition="right"
                  onPointerDown={() => navigate(`../`)}
                  isActive={false}
                />
              )}
            </MenuRow>
          </ColumnLeft>
          <ColumnCenter>
            {projectViewSwitch && defaultSwitchSelection && (
              <ProjectViewSwitch
                defaultSwitchSelection={defaultSwitchSelection}
              />
            )}
          </ColumnCenter>
          <ColumnRight>
            <RightBar>
              {editButton && (
                <RightButton
                  icon="pixelBrush"
                  tooltipTx="Edit"
                  tooltipPosition="left"
                  isActive={false}
                />
              )}
            </RightBar>
          </ColumnRight>
        </TopBar>
        <Main>
          <StyledModal>{main}</StyledModal>
        </Main>
      </Container>
    );
  },
);

export default UIOverlayMenu;
