import {
  AbsoluteCover,
  FloatingUIButton,
  Notification,
  Spacer,
  Text,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { ActionModal } from "../action-modal";
import { DropSheet } from "../drop-sheet";
import { Layers } from "../layers";
import { Menu } from "../menu";
import { ShortcutPopUp } from "../shortcut-popup";
import { SideViews } from "../side-views";
import { SliceSlider } from "../slice-slider";
import { Toolbar } from "../toolbar";
import { TopConsole } from "../top-console";
import { UndoRedoButtons } from "../undo-redo-buttons";
import { ViewSettings } from "../view-settings";
import { UIOverlayProps } from "./ui-overlay.props";

import type { ImageLayer } from "../../../models";

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
  min-width: 0;
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

    // Ref Management
    const containerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
      store?.setRef("uiOverlay", containerRef);

      return () => {
        store?.setRef("uiOverlay");
      };
    }, [store, containerRef]);

    const enterFloatingUI = useCallback(() => {
      store?.editor.activeDocument?.tools.setIsCursorOverFloatingUI(true);
    }, [store]);
    const leaveFloatingUI = useCallback(
      (event: React.PointerEvent) => {
        if (event.pointerType === "touch") return;
        store?.editor.activeDocument?.tools.setIsCursorOverFloatingUI(false);
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

    return (
      <Container
        {...rest}
        onPointerEnter={enterFloatingUI}
        onPointerLeave={leaveFloatingUI}
        ref={containerRef}
      >
        {!store?.editor.activeDocument?.layers.length && (
          <StartTextContainer>
            <Text tx="start" />
          </StartTextContainer>
        )}
        <ColumnLeft>
          <MenuRow>
            <Menu onOpenShortcutPopUp={openShortcutPopUp} />
            <UndoRedoButtons />
          </MenuRow>
          <Toolbar />
          <Layers />
          <Spacer />
          <ActionModal />
        </ColumnLeft>
        <ColumnCenter>
          <TopConsole />
        </ColumnCenter>
        <ColumnRight>
          <SideViews />
          <RightBar>
            <FloatingUIButton
              icon="export"
              tooltipTx="export-tooltip"
              tooltipPosition="left"
              onPointerDown={
                (store?.editor.activeDocument?.activeLayer as ImageLayer)
                  ?.quickExport
              }
              isActive={false}
            />
            <ViewSettings />
            <SliceSlider showValueLabelOnChange={!isDraggedOver} />
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
