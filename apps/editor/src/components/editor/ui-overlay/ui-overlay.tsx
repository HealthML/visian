import {
  AbsoluteCover,
  FloatingUIButton,
  Notification,
  Spacer,
  Text,
} from "@visian/ui-shared";
import { isFromWHO } from "@visian/utils";
import { observer } from "mobx-react-lite";
import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { whoHome } from "../../../constants";
import { ActionModal } from "../action-modal";
import { AIBar } from "../ai-bar";
import { AxesAndVoxel } from "../axes-and-voxel";
import { DropSheet } from "../drop-sheet";
import { ImportPopUp } from "../import-popup";
import { Layers } from "../layers";
import { Menu } from "../menu";
import { ProgressPopUp } from "../progress-popup";
import { ServerPopUp } from "../server-popup";
import { ShortcutPopUp } from "../shortcut-popup";
import { SideViews } from "../side-views";
import { SliceSlider } from "../slice-slider";
import { Toolbar } from "../toolbar";
import { TopConsole } from "../top-console";
import { UndoRedoButtons } from "../undo-redo-buttons";
import { ViewSettings } from "../view-settings";
import { UIOverlayProps } from "./ui-overlay.props";
import { SettingsPopUp } from "../settings-popup";

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
  justify-content: flex-end;
  align-items: flex-end;
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

const ImportButton = styled(FloatingUIButton)`
  margin-right: 16px;
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

    // Import Button
    const [isImportPopUpOpen, setIsImportPopUpOpen] = useState(false);
    const openImportPopUp = useCallback(() => {
      setIsImportPopUpOpen(true);
    }, []);
    const closeImportPopUp = useCallback(() => {
      setIsImportPopUpOpen(false);
    }, []);

    // Shortcut Pop Up Toggling
    const [isShortcutPopUpOpen, setIsShortcutPopUpOpen] = useState(false);
    const openShortcutPopUp = useCallback(() => {
      setIsShortcutPopUpOpen(true);
    }, []);
    const closeShortcutPopUp = useCallback(() => {
      setIsShortcutPopUpOpen(false);
    }, []);

    // Settings Pop Up Toggling
    const [isSettingsPopUpOpen, setIsSettingsPopUpOpen] = useState(false);
    const openSettingsPopUp = useCallback(() => {
      setIsSettingsPopUpOpen(true);
    }, []);
    const closeSettingsPopUp = useCallback(() => {
      setIsSettingsPopUpOpen(false);
    }, []);

    // Export Button
    const exportZip = useCallback(() => {
      store?.setProgress({ labelTx: "exporting" });
      store?.editor.activeDocument
        ?.exportZip(true)
        .catch()
        .then(() => {
          store?.setProgress();
        });
    }, [store]);

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
            {isFromWHO() ? (
              <a href={whoHome}>
                <ImportButton
                  icon="whoAI"
                  tooltipTx="return-who"
                  tooltipPosition="right"
                  isActive={false}
                />
              </a>
            ) : (
              <ImportButton
                icon="import"
                tooltipTx="import-tooltip"
                tooltipPosition="right"
                isActive={false}
                onPointerDown={openImportPopUp}
              />
            )}
            <UndoRedoButtons />
          </MenuRow>
          <Menu
            onOpenShortcutPopUp={openShortcutPopUp}
            onOpenSettingsPopUp={openSettingsPopUp}
          />
          <Toolbar />
          <Layers />
          <Spacer />
          <AxesAndVoxel />
          <ActionModal />
        </ColumnLeft>
        <ColumnCenter>
          <TopConsole />
        </ColumnCenter>
        <ColumnRight>
          <SideViews />
          <RightBar>
            {!isFromWHO() && (
              <FloatingUIButton
                icon="export"
                tooltipTx="export-tooltip"
                tooltipPosition="left"
                onPointerDown={
                  store?.editor.activeDocument?.viewSettings.viewMode === "2D"
                    ? exportZip
                    : store?.editor.activeDocument?.viewport3D.exportCanvasImage
                }
                isActive={false}
              />
            )}
            <ViewSettings />
            <SliceSlider showValueLabelOnChange={!isDraggedOver} />
          </RightBar>
        </ColumnRight>

        {isFromWHO() && <AIBar />}

        <SettingsPopUp
          isOpen={isSettingsPopUpOpen}
          onClose={closeSettingsPopUp}
        />
        <ShortcutPopUp
          isOpen={isShortcutPopUpOpen}
          onClose={closeShortcutPopUp}
        />
        {store?.dicomWebServer ? (
          <ServerPopUp isOpen={isImportPopUpOpen} onClose={closeImportPopUp} />
        ) : (
          <ImportPopUp isOpen={isImportPopUpOpen} onClose={closeImportPopUp} />
        )}
        {isDraggedOver && <DropSheet onDropCompleted={onDropCompleted} />}
        {store?.progress && (
          <ProgressPopUp
            label={store.progress.label}
            labelTx={store.progress.labelTx}
            progress={store.progress.progress}
          />
        )}
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
