import {
  AbsoluteCover,
  color,
  FloatingUIButton,
  InvisibleButton,
  Notification,
  Text,
  SquareButton,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { DropSheet } from "../drop-sheet";
import { Layers } from "../layers";
import { Menu } from "../menu";
import { SideViews } from "../side-views";
import { SliceSlider } from "../slice-slider";
import { Toolbar } from "../toolbar";
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

const TopConsole = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  justify-content: center;
  margin: 0 12px;
  overflow: hidden;
  padding-bottom: 8px;
  top: 20px;
`;

const FileTitle = styled(Text)`
  line-height: 16px;
  opacity: 0.5;
  overflow: hidden;
  margin-bottom: -8px;
  padding-bottom: 8px;
  text-overflow: ellipsis;
`;

const UnsavedChangesIndicator = styled(InvisibleButton)<{ isDirty?: boolean }>`
  background-color: ${(props) =>
    props.isDirty ? color("red") : color("green")};
  border-radius: 50%;
  cursor: ${(props) => (props.isDirty ? "pointer" : "default")};
  height: 12px;
  margin-left: 14px;
  min-width: 12px;
  opacity: 0.4;
  pointer-events: auto;
  transition: background-color 0.3s, opacity 0.3s;
  width: 12px;

  &:hover {
    opacity: 1;
  }
`;

const ErrorNotification = styled(Notification)`
  position: absolute;
  min-width: 15%;
  left: 50%;
  bottom: 12%;
  transform: translateX(-50%);
`;

const UndoRedoButton = styled(SquareButton)`
  margin-right: 8px;
`;

export const UIOverlay = observer<UIOverlayProps>(
  ({ isDraggedOver, onDropCompleted, ...rest }) => {
    const store = useStore();

    const enterFloatingUI = useCallback(() => {
      store?.editor.tools.setIsCursorOverFloatingUI(true);
    }, [store]);
    const leaveFloatingUI = useCallback(() => {
      store?.editor.tools.setIsCursorOverFloatingUI(false);
    }, [store]);

    return (
      <Container
        {...rest}
        onPointerEnter={enterFloatingUI}
        onPointerLeave={leaveFloatingUI}
      >
        {!store?.editor.image && (
          <StartTextContainer>
            <Text tx="start" />
          </StartTextContainer>
        )}
        <ColumnLeft>
          <MenuRow>
            <Menu />
            <UndoRedoButton
              icon="undo"
              isActive={false}
              isDisabled={!store?.editor.undoRedo.isUndoAvailable}
              onPointerDown={store?.editor.undoRedo.undo}
            />
            <UndoRedoButton
              icon="redo"
              isActive={false}
              isDisabled={!store?.editor.undoRedo.isRedoAvailable}
              onPointerDown={store?.editor.undoRedo.redo}
            />
          </MenuRow>
          <Toolbar />
          <Layers />
        </ColumnLeft>
        <ColumnCenter>
          {store?.editor.image && (
            <TopConsole>
              <FileTitle text={store?.editor.image.name} />
              <UnsavedChangesIndicator
                isDirty={store?.isDirty}
                tooltipTx={
                  store?.isDirty ? "unsaved-changes" : "saved-in-browser"
                }
                tooltipPosition="bottom"
                onPointerDown={store?.persistImmediately}
              />
            </TopConsole>
          )}
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
            />
            <ViewSettings />
            <SliceSlider />
          </RightBar>
        </ColumnRight>

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
