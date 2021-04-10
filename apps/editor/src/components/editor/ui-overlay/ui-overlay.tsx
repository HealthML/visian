import {
  AbsoluteCover,
  color,
  coverMixin,
  DropZone,
  Sheet,
  Slider,
  Text,
  Icon,
  SquareButton,
  Toolbar,
  Tool,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback, useState } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { SideViews } from "../side-views";
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

const StyledDropZone = styled(DropZone)`
  flex: 1;
  margin: 10% 0 10% 10%;
`;

const DropSheet = styled.div`
  ${coverMixin}

  align-items: stretch;
  background-color: ${color("modalUnderlay")};
  display: flex;
  flex-direction: row;
  padding-right: 10%;
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
  display: flex;
  width: 20%;
  overflow: auto;
  margin: auto;
  position: absolute;
  top: 20px;
  left: 0;
  bottom: 1;
  right: 0;
  justify-content: center;
`;

const SliceSlider = styled(Sheet)`
  width: 40px;
  padding: 4px 0;
  flex: 1 0;
`;

export const UIOverlay = observer<UIOverlayProps>(
  ({ isDraggedOver, onDropCompleted, ...rest }) => {
    const store = useStore();

    const [isLoadingImage, setIsLoadingImage] = useState(false);
    const importImage = useCallback(
      (files: FileList) => {
        (async () => {
          setIsLoadingImage(true);
          try {
            await store?.editor.importImage(files[0]);
          } catch (e) {
            // TODO: Display error
            console.error(e);
          }
          onDropCompleted();
          setIsLoadingImage(false);
        })();
      },
      [onDropCompleted, store],
    );

    const [isLoadingAnnotation, setIsLoadingAnnotation] = useState(false);
    const importAnnotation = useCallback(
      (files: FileList) => {
        (async () => {
          setIsLoadingAnnotation(true);
          try {
            await store?.editor.importAnnotation(files[0]);
          } catch (e) {
            // TODO: Display error
            console.error(e);
          }
          onDropCompleted();
          setIsLoadingAnnotation(false);
        })();
      },
      [onDropCompleted, store],
    );

    const setSelectedSlice = useCallback(
      (value: number | number[]) => {
        store?.editor.viewSettings.setSelectedSlice(value as number);
      },
      [store],
    );

    return (
      <Container {...rest}>
        {!store?.editor.image && (
          <StartTextContainer>
            <Text tx="start" />
          </StartTextContainer>
        )}
        <TopConsole>
          <Text tx="T1.nii" />
        </TopConsole>
        <ColumnLeft>
          <SquareButton style={{ marginBottom: 16 }}>
            <Icon icon="menu" />
          </SquareButton>
          <Toolbar style={{ marginBottom: 16 }}>
            <Tool icon="moveTool" />
            <Tool icon="pixelBrush" />
            <Tool icon="magicBrush" />
            <Tool icon="erase" />
            <Tool icon="trash" />
          </Toolbar>
          <SquareButton style={{ marginBottom: 16 }}>
            <Icon icon="layers" />
          </SquareButton>
        </ColumnLeft>
        <ColumnRight>
          <SideViews />
          <RightBar>
            <SquareButton style={{ marginBottom: 16 }}>
              <Icon icon="export" />
            </SquareButton>
            <SquareButton style={{ marginBottom: 16 }}>
              <Icon icon="settings" />
            </SquareButton>
            <SliceSlider>
              <Icon icon="arrowUp" />
              <Slider
                isVertical
                isInverted
                min={0}
                max={store?.editor.viewSettings.getMaxSlice() || 0}
                value={store?.editor.viewSettings.getSelectedSlice()}
                onChange={setSelectedSlice}
              />
              <Icon icon="arrowDown" />
            </SliceSlider>
          </RightBar>
        </ColumnRight>

        {isDraggedOver && (
          <DropSheet>
            <StyledDropZone
              isAlwaysVisible
              labelTx={isLoadingImage ? "loading" : "drop-image"}
              onFileDrop={importImage}
            />
            <StyledDropZone
              isAlwaysVisible
              labelTx={isLoadingAnnotation ? "loading" : "drop-annotation"}
              onFileDrop={importAnnotation}
            />
          </DropSheet>
        )}
      </Container>
    );
  },
);

export default UIOverlay;
