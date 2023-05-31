import { AbsoluteCover, FloatingUIButton } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { ShortcutPopUp } from "../../editor";
import { MenuDataManager } from "../menu-data-manager";
import { UIOverlayDataManagerProps } from "./ui-overlay-data-manager.props";

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
  height: 75vh;
  width: 75vw;
`;

export const UIOverlayDataManager = observer<UIOverlayDataManagerProps>(
  ({ homeButton, backLink, topCenter, main }) => {
    const store = useStore();
    const navigate = useNavigate();

    // Shortcut Pop Up Toggling
    const [isShortcutPopUpOpen, setIsShortcutPopUpOpen] = useState(false);
    const openShortcutPopUp = useCallback(() => {
      setIsShortcutPopUpOpen(true);
    }, []);
    const closeShortcutPopUp = useCallback(() => {
      setIsShortcutPopUpOpen(false);
    }, [store]);

    return (
      <Container>
        <TopBar>
          <ColumnLeft>
            <MenuRow>
              <MenuDataManager onOpenShortcutPopUp={openShortcutPopUp} />
              {homeButton && (
                <LeftButton
                  icon="home"
                  tooltipTx="home"
                  tooltipPosition="right"
                  onPointerDown={() => navigate(`/projects`)}
                  isActive={false}
                />
              )}
              {backLink && (
                <LeftButton
                  icon="arrowBack"
                  tooltipTx="back"
                  tooltipPosition="right"
                  onPointerDown={() => navigate(backLink)}
                  isActive={false}
                />
              )}
            </MenuRow>
          </ColumnLeft>
          <ColumnCenter>{topCenter}</ColumnCenter>
          <ColumnRight>
            <RightBar>
              <RightButton
                icon="pixelBrush"
                tooltipTx="open-editor"
                tooltipPosition="left"
                onPointerDown={() => navigate(`/editor`)}
                isActive={false}
              />
            </RightBar>
          </ColumnRight>
        </TopBar>
        <ShortcutPopUp
          isOpen={isShortcutPopUpOpen}
          onClose={closeShortcutPopUp}
        />
        <Main>{main}</Main>
      </Container>
    );
  },
);

export default UIOverlayDataManager;
