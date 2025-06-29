import {
  computeStyleValue,
  ContextMenu,
  ContextMenuItem,
  FloatingUIButton,
  IImageLayer,
  ILayer,
  InfoText,
  List,
  ListItem,
  Modal,
  ModalHeaderButton,
  PointerButton,
  size,
  stopPropagation,
  styledScrollbarMixin,
  SubtleText,
  useDelay,
  useDoubleTap,
  useForwardEvent,
  useModalRoot,
  useShortTap,
  useTranslation,
} from "@visian/ui-shared";
import { Pixel } from "@visian/utils";
import { Observer, observer } from "mobx-react-lite";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  DragDropContext,
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
  DragUpdate,
  Droppable,
  DroppableProvided,
} from "react-beautiful-dnd";
import ReactDOM from "react-dom";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { ImageLayer } from "../../../models";
import { InfoShortcuts } from "../info-shortcuts";
import { LayerSettings } from "../layer-settings";

// Utilities
const noop = () => {
  // Intentionally left blank
};

// Styled Components
const StyledInfoText = styled(InfoText)`
  margin-right: 10px;
`;

const LayerList = styled(List)`
  ${styledScrollbarMixin}

  margin-top: -16px;
  padding-bottom: 7px;
  padding-left: 8px;
  padding-right: 8px;
  margin-left: -8px;
  margin-right: -8px;
  max-height: ${computeStyleValue(
    [size("listElementHeight"), size("dividerHeight")],
    (listElementHeight, dividerHeight) =>
      6 * (listElementHeight + dividerHeight),
  )};
  max-width: 100%;
  overflow-x: visible;
  overflow-y: auto;
`;

const LayerListItem = observer<{
  layer: ILayer;
  index: number;
  isActive?: boolean;
  isLast?: boolean;
}>(({ layer, index, isActive, isLast }) => {
  const store = useStore();

  const toggleAnnotationVisibility = useCallback(() => {
    layer.setIsVisible(!layer.isVisible);
  }, [layer]);

  // Color Modal Toggling
  const [areLayerSettingsOpen, setAreLayerSettingsOpen] = useState(false);
  const isOpeningRef = useRef(false);
  const resetOpeningRef = useCallback(() => {
    isOpeningRef.current = false;
  }, []);
  const [schedule, cancel] = useDelay(resetOpeningRef, 25);
  const openLayerSettings = useCallback(() => {
    setAreLayerSettingsOpen(true);
    isOpeningRef.current = true;
    schedule();
  }, [schedule]);
  const closeLayerSettings = useCallback(() => {
    if (!isOpeningRef.current) setAreLayerSettingsOpen(false);
    isOpeningRef.current = false;
    cancel();
  }, [cancel]);

  // Color Modal Positioning
  const [colorRef, setColorRef] = useState<
    HTMLDivElement | SVGSVGElement | null
  >(null);

  const trailingIconRef = useRef<SVGSVGElement | null>(null);

  const [startTap1, stopTap] = useShortTap(
    useCallback(() => {
      store?.editor.activeDocument?.setActiveLayer(layer);
    }, [layer, store?.editor.activeDocument]),
  );
  const startTap2 = useDoubleTap(
    useCallback((event: React.PointerEvent) => {
      if (event.pointerType === "mouse") return;
      setContextMenuPosition({ x: event.clientX, y: event.clientY });
    }, []),
  );
  const startTap = useForwardEvent(startTap1, startTap2);

  // Context Menu
  const [contextMenuPosition, setContextMenuPosition] = useState<Pixel | null>(
    null,
  );
  const closeContextMenu = useCallback(() => {
    setContextMenuPosition(null);
  }, []);
  useEffect(() => {
    setContextMenuPosition(null);
  }, [store?.editor.activeDocument?.viewSettings.viewMode]);

  const { t } = useTranslation();
  const calculateVolume = useCallback(() => {
    if (layer.kind !== "image") return;
    (layer as IImageLayer).computeVolume();
    store?.editor.activeDocument?.setMeasurementType("volume");
    store?.editor.activeDocument?.setMeasurementDisplayLayer(
      layer as IImageLayer,
    );
  }, [layer, store]);
  const calculateArea = useCallback(() => {
    if (layer.kind !== "image" || !store?.editor.activeDocument?.viewport2D)
      return;
    store?.editor.activeDocument?.setMeasurementType("area");
    (layer as IImageLayer).computeArea(
      store.editor.activeDocument.viewport2D.mainViewType,
      store.editor.activeDocument.viewport2D.getSelectedSlice(),
    );
    store.editor.activeDocument.setMeasurementDisplayLayer(
      layer as IImageLayer,
    );
  }, [layer, store]);
  const toggleAnnotation = useCallback(() => {
    store?.editor.activeDocument?.toggleTypeAndRepositionLayer(layer);
    setContextMenuPosition(null);
  }, [layer, store?.editor.activeDocument]);
  const exportLayer = useCallback(() => {
    if (layer.kind !== "image") return;
    (layer as ImageLayer).quickExport().then(() => {
      setContextMenuPosition(null);
    });
  }, [layer]);
  const exportLayerSlice = useCallback(() => {
    if (layer.kind !== "image") return;
    (layer as ImageLayer).quickExportSlice().then(() => {
      setContextMenuPosition(null);
    });
  }, [layer]);
  const deleteLayer = useCallback(() => {
    if (
      // eslint-disable-next-line no-alert
      window.confirm(t("delete-layer-confirmation", { layer: layer.title }))
    ) {
      layer.delete();
    }
    setContextMenuPosition(null);
  }, [layer, t]);

  // Press Handler
  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (
        colorRef?.contains(event.target as Node) ||
        trailingIconRef.current?.contains(event.target as Node)
      ) {
        return;
      }

      if (event.button === PointerButton.LMB) {
        startTap(event);
      } else if (event.button === PointerButton.RMB) {
        setContextMenuPosition({ x: event.clientX, y: event.clientY });
      }
    },
    [colorRef, startTap],
  );

  const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  // Layer Renaming Handling
  const [isLayerNameEditable, setIsLayerNameEditable] = useState(false);
  const startEditingLayerName = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsLayerNameEditable(true);
      closeContextMenu();
    },
    [closeContextMenu],
  );
  const stopEditingLayerName = useCallback(() => {
    setIsLayerNameEditable(false);
  }, []);

  const modalRootRef = useModalRoot();
  return (
    <>
      <Draggable
        draggableId={layer.id}
        index={index}
        isDragDisabled={areLayerSettingsOpen}
      >
        {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => {
          const node = (
            <Observer>
              {() => (
                <ListItem
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  ref={provided.innerRef}
                  icon={{
                    color: layer.color || "text",
                    icon:
                      layer.kind === "image" && !layer.isAnnotation
                        ? "image"
                        : undefined,
                  }}
                  iconRef={setColorRef}
                  onIconPress={areLayerSettingsOpen ? noop : openLayerSettings}
                  labelTx={layer.title ? undefined : "untitled-layer"}
                  label={layer.title}
                  isLabelEditable={isLayerNameEditable}
                  onChangeLabelText={layer.setTitle}
                  onConfirmLabelText={stopEditingLayerName}
                  trailingIcon={layer.isVisible ? "eye" : "eyeCrossed"}
                  disableTrailingIcon={!layer.isVisible}
                  trailingIconRef={trailingIconRef}
                  onTrailingIconPress={toggleAnnotationVisibility}
                  isActive={isActive}
                  isLast={isLast || snapshot.isDragging}
                  onPointerDown={handlePointerDown}
                  onPointerUp={stopTap}
                  onContextMenu={handleContextMenu}
                >
                  {layer === store?.editor.activeDocument?.mainImageLayer && (
                    <InfoText
                      icon="circle"
                      infoTx="info-main-image-layer"
                      titleTx="main-image-layer"
                    />
                  )}
                </ListItem>
              )}
            </Observer>
          );

          return snapshot.isDragging && modalRootRef.current
            ? ReactDOM.createPortal(node, modalRootRef.current)
            : node;
        }}
      </Draggable>
      <LayerSettings
        layer={layer}
        isOpen={areLayerSettingsOpen}
        anchor={colorRef}
        position="right"
        onOutsidePress={closeLayerSettings}
      />
      <ContextMenu
        anchor={contextMenuPosition}
        isOpen={Boolean(contextMenuPosition)}
        onOutsidePress={closeContextMenu}
      >
        {layer.kind === "image" && layer.isAnnotation && (
          <>
            {layer.is3DLayer && (
              <ContextMenuItem
                labelTx="calculate-volume"
                onPointerDown={calculateVolume}
              />
            )}
            <ContextMenuItem
              labelTx="calculate-area"
              onPointerDown={calculateArea}
            />
          </>
        )}
        <ContextMenuItem
          labelTx={
            layer.isAnnotation ? "mark-not-annotation" : "mark-annotation"
          }
          onPointerDown={toggleAnnotation}
        />
        <ContextMenuItem labelTx="export-layer" onPointerDown={exportLayer} />
        {store?.editor.activeDocument?.viewSettings.viewMode === "2D" && (
          <ContextMenuItem
            labelTx="export-slice"
            onPointerDown={exportLayerSlice}
          />
        )}
        <ContextMenuItem
          labelTx="rename-layer"
          onPointerDown={startEditingLayerName}
        />
        <ContextMenuItem
          labelTx="delete-layer"
          onPointerDown={deleteLayer}
          isLast
        />
      </ContextMenu>
    </>
  );
});

const LayerModal = styled(Modal)`
  padding-bottom: 0px;
  width: 230px;
  justify-content: center;
`;

export const Layers: React.FC = observer(() => {
  const store = useStore();

  // Menu State
  const isModalOpen = Boolean(store?.editor.activeDocument?.showLayerMenu);

  // Menu Positioning
  const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null);

  const handleDrag = useCallback(
    (result: DragUpdate) => {
      if (!result.destination) return;
      store?.editor.activeDocument?.moveLayer(
        result.draggableId,
        result.destination.index,
      );
    },
    [store],
  );

  // This is required to force an update when the view mode changes
  // (otherwise the layer menu stays fixed in place when switching the view mode)
  const viewMode = store?.editor.activeDocument?.viewSettings.viewMode;
  const [, setLastUpdatedViewMode] = useState<string>();
  useEffect(() => {
    setTimeout(() => {
      setLastUpdatedViewMode(viewMode);
    }, 50);
  }, [viewMode]);

  const layers = store?.editor.activeDocument?.layers;
  const layerCount = layers?.length;
  const activeLayer = store?.editor.activeDocument?.activeLayer;
  const activeLayerIndex = layers?.findIndex((layer) => layer === activeLayer);
  return (
    <>
      <FloatingUIButton
        icon="layers"
        tooltipTx="layers"
        showTooltip={!isModalOpen}
        ref={setButtonRef}
        onPointerDown={store?.editor.activeDocument?.toggleLayerMenu}
        isActive={isModalOpen}
      />
      <LayerModal
        isOpen={isModalOpen}
        hideHeaderDivider={activeLayerIndex === 0}
        labelTx="layers"
        anchor={buttonRef}
        position="right"
        headerChildren={
          <>
            <StyledInfoText
              infoTx="info-layer-stack"
              shortcuts={
                <InfoShortcuts hotkeyGroupNames={["layer-controls"]} />
              }
            />
            <ModalHeaderButton
              icon="plus"
              tooltipTx="add-annotation-layer"
              isDisabled={
                !layerCount ||
                layerCount >= (store?.editor.activeDocument?.maxLayers || 0)
              }
              onPointerDown={
                store?.editor.activeDocument?.addNewAnnotationLayer
              }
            />
          </>
        }
      >
        {/* TODO: Should we update on every drag change or just on drop? */}
        <DragDropContext onDragUpdate={handleDrag} onDragEnd={noop}>
          <Droppable droppableId="layer-stack">
            {(provided: DroppableProvided) => (
              <LayerList
                {...provided.droppableProps}
                ref={provided.innerRef}
                onWheel={stopPropagation}
              >
                {layerCount ? (
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  layers!.map((layer, index) => (
                    <LayerListItem
                      key={layer.id}
                      layer={layer}
                      index={index}
                      isActive={layer === activeLayer}
                      isLast={
                        index === layerCount - 1 ||
                        index + 1 === activeLayerIndex
                      }
                    />
                  ))
                ) : (
                  <ListItem isLast>
                    <SubtleText tx="no-layers" />
                  </ListItem>
                )}
                {provided.placeholder}
              </LayerList>
            )}
          </Droppable>
        </DragDropContext>
      </LayerModal>
    </>
  );
});
