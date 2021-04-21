import {
  AbsoluteCover,
  color,
  FloatingUIButton,
  InvisibleButton,
  Notification,
  Text,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React from "react";
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

const ColumnRight = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
`;

const RightBar = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const TopConsole = styled.div`
  align-items: center;
  align-self: flex-start;
  display: flex;
  flex: 1;
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

export const UIOverlay = observer<UIOverlayProps>(
  ({ isDraggedOver, onDropCompleted, ...rest }) => {
    const store = useStore();

    return (
      <Container {...rest}>
        {!store?.editor.image && (
          <StartTextContainer>
            <Text tx="start" />
          </StartTextContainer>
        )}
        <ColumnLeft>
          <Menu />
          <Toolbar />
          <Layers />
        </ColumnLeft>
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
