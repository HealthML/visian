import {
  AbsoluteCover,
  color,
  coverMixin,
  DropZone,
  Icon,
  InvisibleButton,
  Modal,
  Sheet,
  Slider,
  SquareButton,
  Text,
  Tool,
  Toolbar,
  useModalPosition,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback, useState } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { SideViews } from "../side-views";
import { UIOverlayProps } from "./ui-overlay.props";

import { ToolType } from "../../../models";

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
    const increaseSelectedSlice = useCallback(() => {
      store?.editor.viewSettings.stepSelectedSlice(1);
    }, [store]);
    const decreaseSelectedSlice = useCallback(() => {
      store?.editor.viewSettings.stepSelectedSlice(-1);
    }, [store]);

    const activeTool = store?.editor.tools.activeTool;
    const setActiveTool = useCallback(
      (value?: string | number) => {
        store?.editor.tools.setActiveTool(value as ToolType);
      },
      [store],
    );
    const clearSlice = useCallback(() => {
      store?.editor.tools.clearSlice();
    }, [store]);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const toggleMenu = useCallback(() => {
      setIsMenuOpen(!isMenuOpen);
    }, [isMenuOpen]);
    const [menuRef, setMenuRef] = useState<HTMLButtonElement | null>(null);
    const menuPosition = useModalPosition(menuRef);

    const [isLayersOpen, setIsLayersOpen] = useState(false);
    const toggleLayers = useCallback(() => {
      setIsLayersOpen(!isLayersOpen);
    }, [isLayersOpen]);
    const [layersRef, setLayersRef] = useState<HTMLButtonElement | null>(null);
    const layersPosition = useModalPosition(layersRef);

    const [isViewSettingsOpen, setIsViewSettingsOpen] = useState(false);
    const toggleViewSettings = useCallback(() => {
      setIsViewSettingsOpen(!isViewSettingsOpen);
    }, [isViewSettingsOpen]);
    const [
      viewSettingsRef,
      setViewSettingsRef,
    ] = useState<HTMLButtonElement | null>(null);
    const viewSettingsPosition = useModalPosition(viewSettingsRef, "left");

    return (
      <Container {...rest}>
        {!store?.editor.image && (
          <StartTextContainer>
            <Text tx="start" />
          </StartTextContainer>
        )}
        <TopConsole>
          <Text text={store?.editor.image?.name} />
        </TopConsole>
        <ColumnLeft>
          <SquareButton
            style={{ marginBottom: 16 }}
            ref={setMenuRef}
            onPointerDown={toggleMenu}
          >
            <Icon icon="menu" />
          </SquareButton>
          <Modal style={menuPosition} isOpen={isMenuOpen} />

          <Toolbar style={{ marginBottom: 16 }}>
            <Tool
              icon="moveTool"
              activeTool={activeTool}
              value={ToolType.Hand}
              onPress={setActiveTool}
            />
            <Tool
              icon="pixelBrush"
              activeTool={activeTool}
              value={ToolType.Brush}
              onPress={setActiveTool}
            />
            <Tool
              icon="magicBrush"
              activeTool={activeTool}
              value={ToolType.SmartBrush}
              onPress={setActiveTool}
            />
            <Tool
              icon="erase"
              activeTool={activeTool}
              value={ToolType.Eraser}
              onPress={setActiveTool}
            />
            <Tool icon="trash" onPointerDown={clearSlice} />
          </Toolbar>

          <SquareButton
            style={{ marginBottom: 16 }}
            ref={setLayersRef}
            onPointerDown={toggleLayers}
          >
            <Icon icon="layers" />
          </SquareButton>
          <Modal style={layersPosition} isOpen={isLayersOpen} />
        </ColumnLeft>
        <ColumnRight>
          <SideViews />
          <RightBar>
            <SquareButton
              style={{ marginBottom: 16 }}
              onPointerDown={store?.editor.quickExport}
            >
              <Icon icon="export" />
            </SquareButton>

            <SquareButton
              style={{ marginBottom: 16 }}
              ref={setViewSettingsRef}
              onPointerDown={toggleViewSettings}
            >
              <Icon icon="settings" />
            </SquareButton>
            <Modal style={viewSettingsPosition} isOpen={isViewSettingsOpen} />

            <SliceSlider>
              <InvisibleButton onPointerDown={increaseSelectedSlice}>
                <Icon icon="arrowUp" />
              </InvisibleButton>
              <Slider
                isVertical
                isInverted
                min={0}
                max={store?.editor.viewSettings.getMaxSlice() || 0}
                value={store?.editor.viewSettings.getSelectedSlice()}
                onChange={setSelectedSlice}
              />
              <InvisibleButton onPointerDown={decreaseSelectedSlice}>
                <Icon icon="arrowDown" />
              </InvisibleButton>
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
