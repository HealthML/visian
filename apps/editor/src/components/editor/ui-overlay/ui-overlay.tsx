import {
  AbsoluteCover,
  duration,
  FloatingUIButton,
  Notification,
  Text,
  Theme,
  useDelay,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback, useEffect, useRef, useState } from "react";
import styled, { useTheme } from "styled-components";

import { useStore } from "../../../app/root-store";
import { DropSheet } from "../drop-sheet";
import { ShortcutPopUp } from "../shortcut-popup";
import { Layers } from "../layers";
import { Menu } from "../menu";
import { SideViews } from "../side-views";
import { SliceSlider } from "../slice-slider";
import { Toolbar } from "../toolbar";
import { TopConsole } from "../top-console";
import { UndoRedoButtons } from "../undo-redo-buttons";
import { ViewSettings } from "../view-settings";
import { UIOverlayProps } from "./ui-overlay.props";

const Container = styled(AbsoluteCover)`
  align-items: stretch;
  display: flex;
  padding: 20px;
  z-index: 1;
  pointer-events: none;
  user-select: none;
`;

const StartTextContainer = styled(AbsoluteCover)`
  align-items: center;
  display: flex;
  justify-content: center;
  opacity: 0.4;
`;

const ColumnLeft = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

const ColumnCenter = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: flex-start;
`;

const ColumnRight = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
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

const ErrorNotification = styled(Notification)`
  position: absolute;
  min-width: 15%;
  left: 50%;
  bottom: 12%;
  transform: translateX(-50%);
`;

export const UIOverlay = observer<UIOverlayProps>(
  ({ isDraggedOver, onDropCompleted, ...rest }) => {
    const store = useStore();
    const theme = useTheme() as Theme;

    // Ref Management
    const containerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
      store?.setRef("uiOverlay", containerRef);

      return () => {
        store?.setRef("uiOverlay");
      };
    }, [store, containerRef]);

    const enterFloatingUI = useCallback(() => {
      store?.editor.tools.setIsCursorOverFloatingUI(true);
    }, [store]);
    const leaveFloatingUI = useCallback(
      (event: React.PointerEvent) => {
        if (event.pointerType === "touch") return;
        store?.editor.tools.setIsCursorOverFloatingUI(false);
      },
      [store],
    );

    // Shortcut Pop Up Toggling
    const [isShortcutPopUpOpen, setIsShortcutPopUpOpen] = useState(false);
    const openShortcutPopUp = useCallback(() => {
      setIsShortcutPopUpOpen(true);
    }, []);
    const closeShortcutPopUp = useCallback(() => {
      setIsShortcutPopUpOpen(false);
    }, []);

    // Tooltip Delay Handling
    const [shouldDelayTooltips, setShouldDelayTooltips] = useState(true);
    const [scheduleTooltipsDelay, cancelTooltipsDelay] = useDelay(
      useCallback(() => {
        setShouldDelayTooltips(true);
      }, []),
      duration("noTooltipDelayInterval")({ theme }) as number,
    );
    const setNoTooltipDelayTimer = useCallback(() => {
      setShouldDelayTooltips(false);
      scheduleTooltipsDelay();
    }, [scheduleTooltipsDelay]);

    return (
      <Container
        {...rest}
        onPointerEnter={enterFloatingUI}
        onPointerLeave={leaveFloatingUI}
        ref={containerRef}
      >
        {!store?.editor.image && (
          <StartTextContainer>
            <Text tx="start" />
          </StartTextContainer>
        )}
        <ColumnLeft>
          <MenuRow>
            <Menu
              onOpenShortcutPopUp={openShortcutPopUp}
              onPointerEnterButton={cancelTooltipsDelay}
              onPointerLeaveButton={setNoTooltipDelayTimer}
              shouldForceTooltip={!shouldDelayTooltips}
            />
            <UndoRedoButtons
              onPointerEnterButton={cancelTooltipsDelay}
              onPointerLeaveButton={setNoTooltipDelayTimer}
              shouldForceTooltip={!shouldDelayTooltips}
            />
          </MenuRow>
          <Toolbar
            onPointerEnterButton={cancelTooltipsDelay}
            onPointerLeaveButton={setNoTooltipDelayTimer}
            shouldForceTooltip={!shouldDelayTooltips}
          />
          <Layers
            onPointerEnterButton={cancelTooltipsDelay}
            onPointerLeaveButton={setNoTooltipDelayTimer}
            shouldForceTooltip={!shouldDelayTooltips}
          />
        </ColumnLeft>
        <ColumnCenter>
          <TopConsole />
        </ColumnCenter>
        <ColumnRight>
          <SideViews />
          <RightBar>
            <FloatingUIButton
              icon="export"
              tooltipTx="export"
              tooltipPosition="left"
              onPointerDown={store?.editor.quickExport}
              isActive={false}
              onPointerEnter={cancelTooltipsDelay}
              onPointerLeave={setNoTooltipDelayTimer}
              shouldForceTooltip={!shouldDelayTooltips}
            />
            <ViewSettings
              onPointerEnterButton={cancelTooltipsDelay}
              onPointerLeaveButton={setNoTooltipDelayTimer}
              shouldForceTooltip={!shouldDelayTooltips}
            />
            <SliceSlider />
          </RightBar>
        </ColumnRight>

        <ShortcutPopUp
          isOpen={isShortcutPopUpOpen}
          onClose={closeShortcutPopUp}
        />
        {isDraggedOver && <DropSheet onDropCompleted={onDropCompleted} />}
        {store?.error && (
          <ErrorNotification
            title={store?.error.title}
            titleTx={store?.error.titleTx}
            description={store?.error.description}
            descriptionTx={store?.error.descriptionTx}
          />
        )}
      </Container>
    );
  },
);

export default UIOverlay;
