import {
  FloatingUIButton,
  ILayer,
  List,
  ListItem,
  Modal,
  ModalHeaderButton,
  PointerButton,
  SubtleText,
  useDelay,
  useModalRoot,
} from "@visian/ui-shared";
import { Observer, observer } from "mobx-react-lite";
import React, { useCallback, useRef, useState } from "react";
import ReactDOM from "react-dom";
import {
  DragDropContext,
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
  DragUpdate,
  Droppable,
  DroppableProvided,
} from "react-beautiful-dnd";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { LayerSettings } from "../layer-settings";

// Utilities
const noop = () => {
  // Intentionally left blank
};

// Styled Components
const LayerList = styled(List)`
  margin-top: -16px;
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

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (
        colorRef?.contains(event.target as Node) ||
        trailingIconRef.current?.contains(event.target as Node)
      ) {
        return;
      }

      if (event.button === PointerButton.LMB) {
        store?.editor.activeDocument?.setActiveLayer(layer);
      } else if (event.button === PointerButton.RMB) {
        layer.setIsAnnotation(!layer.isAnnotation);
        store?.editor.activeDocument?.updateLayerOrder();
      }
    },
    [colorRef, layer, store?.editor.activeDocument],
  );

  const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

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
                  trailingIcon={layer.isVisible ? "eye" : "eyeCrossed"}
                  disableTrailingIcon={!layer.isVisible}
                  trailingIconRef={trailingIconRef}
                  onTrailingIconPress={toggleAnnotationVisibility}
                  isActive={isActive}
                  isLast={isLast || snapshot.isDragging}
                  onPointerDown={handlePointerDown}
                  onContextMenu={handleContextMenu}
                />
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
        parentElement={colorRef}
        position="right"
        onOutsidePress={closeLayerSettings}
      />
    </>
  );
});

const LayerModal = styled(Modal)`
  padding-bottom: 0px;
`;

export const Layers: React.FC = observer(() => {
  const store = useStore();

  // Menu Toggling
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toggleModal = useCallback(() => {
    setIsModalOpen(!isModalOpen);
  }, [isModalOpen]);

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
  const _viewMode = store?.editor.activeDocument?.viewSettings.viewMode;

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
        onPointerDown={toggleModal}
        isActive={isModalOpen}
      />
      <LayerModal
        isOpen={isModalOpen}
        hideHeaderDivider={activeLayerIndex === 0}
        labelTx="layers"
        parentElement={buttonRef}
        position="right"
        headerChildren={
          <ModalHeaderButton
            icon="plus"
            tooltipTx="add-annotation-layer"
            isDisabled={!layerCount}
            onPointerDown={store?.editor.activeDocument?.addNewAnnotationLayer}
          />
        }
      >
        {/* TODO: Should we update on every drag change or just on drop? */}
        <DragDropContext onDragUpdate={handleDrag} onDragEnd={handleDrag}>
          <Droppable droppableId="layer-stack">
            {(provided: DroppableProvided) => (
              <LayerList {...provided.droppableProps} ref={provided.innerRef}>
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
