import {
  AbsoluteCover,
  FlexRow,
  FloatingUIButton,
  Notification,
  Spacer,
  Text,
} from "@visian/ui-shared";
import { isFromWHO } from "@visian/utils";
import { observer } from "mobx-react-lite";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { whoHome } from "../../../constants";
import { importFilesToDocument } from "../../../import-handling";
import {
  fetchAnnotationFile,
  fetchImageFile,
} from "../../../queries/use-files";
import {
  DilateErodeModal,
  MeasurementModal,
  SmartBrush3DModal,
  ThresholdAnnotationModal,
} from "../action-modal";
import { AIBar } from "../ai-bar";
import { AxesAndVoxel } from "../axes-and-voxel";
import { ImageImportDropSheet } from "../import-image-drop-sheet";
import { ImportPopUp } from "../import-popup";
import { Layers } from "../layers";
import { MeasurementPopUp } from "../measurement-popup";
import { Menu } from "../menu";
import { ProgressPopUp } from "../progress-popup";
import { SavePopUp } from "../save-popup";
import { ServerPopUp } from "../server-popup";
import { SettingsPopUp } from "../settings-popup";
import { ShortcutPopUp } from "../shortcut-popup";
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

const StartText = styled(Text)`
  max-width: 50%;
  text-align: center;
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

const AxesSpacer = styled(Spacer)`
  position: relative;
`;

const Axes3D = styled.div`
  position: absolute;
  bottom: -5px;
  left: -5px;
`;

const ModalRow = styled(FlexRow)`
  gap: 20px;
  align-items: flex-end;
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

    const axes3dRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
      store?.setRef("axes3D", axes3dRef);

      return () => {
        store?.setRef("axes3D");
      };
    }, [store, axes3dRef]);

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
      store?.editor.activeDocument?.tools.setIsCursorOverFloatingUI(false);
    }, [store]);

    // Settings Pop Up Toggling
    const [isSettingsPopUpOpen, setIsSettingsPopUpOpen] = useState(false);
    const openSettingsPopUp = useCallback(() => {
      setIsSettingsPopUpOpen(true);
    }, []);
    const closeSettingsPopUp = useCallback(() => {
      setIsSettingsPopUpOpen(false);
      store?.editor.activeDocument?.tools.setIsCursorOverFloatingUI(false);
    }, [store]);

    // Save Pop Up Toggling
    const [isSavePopUpOpen, setIsSavePopUpOpen] = useState(false);
    const openSavePopUp = useCallback(() => {
      setIsSavePopUpOpen(true);
    }, []);
    const closeSavePopUp = useCallback(() => {
      setIsSavePopUpOpen(false);
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

    const [searchParams] = useSearchParams();
    const loadImagesAndAnnotations = () => {
      async function asyncfunc() {
        if (store?.editor.activeDocument?.layers.length !== 0) {
          return store?.destroyReload();
        }
        const fileTransfer = new DataTransfer();
        const imageIdToOpen = searchParams.get("imageId");
        if (imageIdToOpen) {
          try {
            const imageFile = await fetchImageFile(imageIdToOpen);
            fileTransfer.items.add(imageFile);
          } catch (error) {
            store?.setError({
              titleTx: "import-error",
              descriptionTx: "image-open-error",
            });
          }
        }
        const annotationIdToOpen = searchParams.get("annotationId");
        if (annotationIdToOpen) {
          try {
            const annotationFile = await fetchAnnotationFile(
              annotationIdToOpen,
            );
            fileTransfer.items.add(annotationFile);
          } catch (error) {
            store?.setError({
              titleTx: "import-error",
              descriptionTx: "annotation-open-error",
            });
          }
        }
        if (store && fileTransfer.files.length) {
          importFilesToDocument(fileTransfer.files, store);
        }
      }
      asyncfunc();
    };
    useEffect(loadImagesAndAnnotations, [searchParams, store]);

    return (
      <Container
        {...rest}
        onPointerEnter={enterFloatingUI}
        onPointerLeave={leaveFloatingUI}
        ref={containerRef}
      >
        {!store?.editor.activeDocument?.layers.length && (
          <StartTextContainer>
            <StartText
              tx={store?.editor.isAvailable ? "start" : "no-webgl-2-error"}
            />
          </StartTextContainer>
        )}
        {store?.editor.isAvailable && (
          <>
            <ColumnLeft>
              <MenuRow>
                <Menu
                  onOpenShortcutPopUp={openShortcutPopUp}
                  onOpenSettingsPopUp={openSettingsPopUp}
                />
                <UndoRedoButtons />
              </MenuRow>
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
              <Toolbar />
              <Layers />
              <AxesSpacer>
                <Axes3D ref={axes3dRef} />
              </AxesSpacer>
              <ModalRow>
                <SmartBrush3DModal />
                <ThresholdAnnotationModal />
                <DilateErodeModal />
                <MeasurementModal />
                <AxesAndVoxel />
              </ModalRow>
            </ColumnLeft>
            <ColumnCenter>
              <TopConsole />
            </ColumnCenter>
            <ColumnRight>
              <SideViews />
              <RightBar>
                <FloatingUIButton
                  icon="exit"
                  tooltipTx="close-editor"
                  tooltipPosition="left"
                  onPointerDown={() => {
                    store?.destroyRedirect("/projects");
                  }}
                  isActive={false}
                />
                {store?.editor.activeDocument?.activeLayer?.isAnnotation &&
                  searchParams.get("imageId") && (
                    <FloatingUIButton
                      icon="save"
                      tooltipTx="annotation-saving"
                      tooltipPosition="left"
                      onPointerDown={openSavePopUp}
                      isActive={false}
                    />
                  )}
                {!isFromWHO() && (
                  <FloatingUIButton
                    icon="export"
                    tooltipTx="export-tooltip"
                    tooltipPosition="left"
                    onPointerDown={
                      store?.editor.activeDocument?.viewSettings.viewMode ===
                      "2D"
                        ? exportZip
                        : store?.editor.activeDocument?.viewport3D
                            .exportCanvasImage
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
              <ServerPopUp
                isOpen={isImportPopUpOpen}
                onClose={closeImportPopUp}
              />
            ) : (
              <ImportPopUp
                isOpen={isImportPopUpOpen}
                onClose={closeImportPopUp}
              />
            )}
            <MeasurementPopUp
              isOpen={Boolean(
                store?.editor.activeDocument?.measurementDisplayLayer,
              )}
              onClose={store?.editor.activeDocument?.setMeasurementDisplayLayer}
            />
            <SavePopUp isOpen={isSavePopUpOpen} onClose={closeSavePopUp} />
            {isDraggedOver && (
              <ImageImportDropSheet onDropCompleted={onDropCompleted} />
            )}
            {store?.progress && (
              <ProgressPopUp
                label={store.progress.label}
                labelTx={store.progress.labelTx}
                progress={store.progress.progress}
                showSplash={store.progress.showSplash}
              />
            )}
          </>
        )}
        {store?.error && (
          <ErrorNotification
            title={store?.error.title}
            titleTx={store?.error.titleTx}
            description={store?.error.description}
            descriptionTx={store?.error.descriptionTx}
            descriptionData={store?.error.descriptionData}
          />
        )}
      </Container>
    );
  },
);

export default UIOverlay;
