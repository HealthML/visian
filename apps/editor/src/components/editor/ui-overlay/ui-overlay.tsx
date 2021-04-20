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
  width: 50%;
  justify-content: flex-start;
`;

const ColumnRight = styled.div`
  display: flex;
  flex-direction: row;
  width: 50%;
  justify-content: flex-end;
`;

const RightBar = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const TopConsole = styled.div`
  align-items: center;
  display: flex;
  overflow: hidden;
  margin: auto;
  position: absolute;
  top: 20px;
  left: 0;
  bottom: 1;
  right: 0;
  justify-content: center;
`;

const FileTitle = styled(Text)`
  opacity: 0.5;
  line-height: 16px;
`;

const UnsavedChangesIndicator = styled(InvisibleButton)<{ isDirty?: boolean }>`
  background-color: ${(props) =>
    props.isDirty ? color("red") : color("green")};
  border-radius: 50%;
  height: 12px;
  margin-left: 14px;
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
        <TopConsole>
          <FileTitle text={store?.editor.image?.name} />
          <UnsavedChangesIndicator
            isDirty={store?.isDirty}
            tooltipTx={store?.isDirty ? "unsaved-changes" : "saved-in-browser"}
            tooltipPosition="bottom"
            onPointerDown={store?.persistImmediately}
          />
        </TopConsole>
        <ColumnLeft>
          <Menu />
          <Toolbar />
          <Layers />
        </ColumnLeft>
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
