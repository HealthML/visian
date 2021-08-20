import {
  color,
  computeStyleValue,
  FloatingUIButton,
  List,
  ListItem,
  Modal,
  ModalHeaderButton,
  size,
  stopPropagation,
  SubtleText,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback, useState } from "react";
import {
  DragDropContext,
  DragUpdate,
  Droppable,
  DroppableProvided,
} from "react-beautiful-dnd";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { LayerListItem } from "./layer";

// Utilities
const noop = () => {
  // Intentionally left blank
};

// Styled Components
const LayerList = styled(List)`
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

  /* width */
  ::-webkit-scrollbar {
    width: 4px;
    margin-bottom: 10px;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    background: transparent;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: ${color("lightGray")};
    border-radius: 10px;
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: ${color("gray")};
  }
`;

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
          <ModalHeaderButton
            icon="plus"
            tooltipTx="add-annotation-layer"
            isDisabled={!layerCount}
            onPointerDown={store?.editor.activeDocument?.addNewAnnotationLayer}
          />
        }
      >
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
