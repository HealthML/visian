import {
  CollisionDetection,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  computeStyleValue,
  FloatingUIButton,
  IAnnotationGroup,
  ILayer,
  InfoText,
  List,
  ListItem,
  Modal,
  ModalHeaderButton,
  size,
  stopPropagation,
  styledScrollbarMixin,
  SubtleText,
} from "@visian/ui-shared";
import { transaction } from "mobx";
import { observer } from "mobx-react-lite";
import React, { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { ImageLayer } from "../../../models";
import { AnnotationGroup } from "../../../models/editor/annotation-groups";
import { InfoShortcuts } from "../info-shortcuts";
import { DraggableAnnotationGroupListItem } from "./draggable-group-list-item";
import { DraggableLayerListItem } from "./draggable-layer-list-item";
import { AnnotationGroupListItem } from "./group-list-item";
import { LayerListItem } from "./layer-list-item";

// Styled Components
const StyledInfoText = styled(InfoText)`
  margin-right: 10px;
`;

const OuterWrapper = styled("div")`
  width: 100%;
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

const LayerModal = styled(Modal)`
  padding-bottom: 0px;
  width: 230px;
  justify-content: center;
`;

const customCollisionDetection: CollisionDetection = (args) => {
  const activeLayer = args.active.data.current?.layer as ILayer;
  if (!activeLayer) return rectIntersection(args);

  // Check if there is a collission with a group different from the
  // one of the dragged layer:
  const pointerCollisions = pointerWithin(args);
  const groupCollission = pointerCollisions.find((collission) => {
    const group = collission.data?.droppableContainer.data.current
      .annotationGroup as IAnnotationGroup;
    return group && group !== activeLayer.annotationGroup;
  });
  if (groupCollission) return [groupCollission];

  return pointerWithin(args);
};

export const Layers: React.FC = observer(() => {
  const store = useStore();
  const document = store?.editor.activeDocument;

  // Menu State
  const isModalOpen = Boolean(document?.showLayerMenu);

  // Menu Positioning
  const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null);

  // This is required to force an update when the view mode changes
  // (otherwise the layer menu stays fixed in place when switching the view mode)
  const viewMode = document?.viewSettings.viewMode;
  const [, setLastUpdatedViewMode] = useState<string>();
  useEffect(() => {
    setTimeout(() => {
      setLastUpdatedViewMode(viewMode);
    }, 50);
  }, [viewMode]);

  const layers = document?.layers;
  const [layerIds, setLayerIds] = useState(
    document?.renderingOrder.map((element) => element.id) || [],
  );

  const [draggedLayer, setDraggedLayer] = useState<ILayer>();
  const [draggedGroup, setDraggedGroup] = useState<IAnnotationGroup>();

  const dndSensors = useSensors(
    // Require the mouse to move before dragging so we capture normal clicks:
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  // This handler is called when the user starts dragging a layer or group:
  const dndDragStart = useCallback((event: DragStartEvent) => {
    if (event.active.data.current?.layer) {
      setDraggedLayer(event.active.data.current?.layer);
    } else if (event.active.data.current?.annotationGroup) {
      setDraggedGroup(event.active.data.current?.annotationGroup);
    }
  }, []);

  // This handler is called when the user currently drags a layer or group.
  // Be aware that the value in event.over is influenced by our custom
  // collission detection stragegy.
  const dndDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const activeLayer = active.data.current?.layer as ILayer;
      // Return if we are not dragging a layer:
      if (!activeLayer) return;
      // Return if we are dragging image layer within or above annotationGroup
      const activeLayerIndex = layers?.indexOf(activeLayer) || 0;
      if (
        !activeLayer.isAnnotation ||
        !layers?.[activeLayerIndex - 1]?.isAnnotation
      )
        return;
      // Return if we are not dragging OVER a
      // group or if we are dragging over the layer's own group:
      const overGroup = over.data.current?.annotationGroup as IAnnotationGroup;
      if (!overGroup) return;
      if (activeLayer.annotationGroup?.id === overGroup.id) return;

      // Move layer from its old group to the new one.
      // Use a transaction to make sure that mobx only updates
      // dependencies once we have completed the move:
      transaction(() => {
        (activeLayer.annotationGroup as AnnotationGroup)?.removeLayer(
          activeLayer,
        );
        if (!activeLayer.annotationGroup && document) {
          document.removeLayerFromRootList(activeLayer);
        }
        (overGroup as AnnotationGroup).addLayer(activeLayer);
      });
    },
    [document, layers],
  );

  // This handler is called when the user lets go of a layer or group after dragging:
  const dndDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!document || !over || active.id === over.id) {
        setDraggedGroup(undefined);
        setDraggedLayer(undefined);
        return;
      }

      const dragged = active.data.current;
      if (dragged?.annotationGroup) {
        const group = dragged?.annotationGroup as IAnnotationGroup;
        const oldIndex = document.renderingOrder.indexOf(group);
        const newIndex = document.renderingOrder.indexOf(
          over.data?.current?.annotationGroup,
        );
        if (newIndex !== -1) {
          const newLayerIds = arrayMove(
            document.renderingOrder.map((item) => item.id),
            oldIndex,
            newIndex,
          );
          document.setLayerIds(newLayerIds);
        }
      } else if (dragged?.layer) {
        const layer = dragged?.layer as ILayer;
        // Only re-sort the groups layers if
        //  - the current layer is in a group
        //  - the group has more than 1 layer
        //  - we are not just dragging into the group folder, but actually into the layers of the group
        if (
          layer.annotationGroup &&
          layer.annotationGroup.layers.length > 1 &&
          over.data?.current?.layer
        ) {
          const oldIndex = layer.annotationGroup.layerIds.indexOf(layer.id);
          const newIndex = layer.annotationGroup.layerIds.indexOf(
            over.data?.current?.layer.id,
          );
          const newLayerIds = arrayMove(
            layer.annotationGroup.layerIds,
            oldIndex,
            newIndex,
          );
          layer.annotationGroup.setLayerIds(newLayerIds);
        } else if (!layer.annotationGroup && !layer.isAnnotation && layers) {
          const oldIndex = layerIds.indexOf(layer.id);
          const newIndex = layerIds.indexOf(over.data?.current?.layer?.id);
          const draggedImageLayer = layers.find(
            (imageLayer) => imageLayer.id === layerIds[oldIndex],
          );
          if (draggedImageLayer && newIndex !== -1) {
            document.addLayer(draggedImageLayer, newIndex);
            const newLayerIds = arrayMove(layerIds, oldIndex, newIndex);
            setLayerIds(newLayerIds);
          }
        }
      }
      setDraggedLayer(undefined);
      setDraggedGroup(undefined);
    },
    [document, layerIds, layers],
  );

  const listItems = document?.renderingOrder.map((element, index) => {
    if (element instanceof AnnotationGroup) {
      const group = element as AnnotationGroup;
      return (
        <DraggableAnnotationGroupListItem
          key={group.id}
          group={group}
          isActive={group.isActive}
          draggedLayer={draggedLayer}
          isDragged={group === draggedGroup}
          isLast={
            index === layerIds.length - 1 ||
            document?.annotationGroups[index + 1]?.isActive
          }
        />
      );
    }
    const layer = element as ImageLayer;
    return (
      <DraggableLayerListItem
        key={layer.id}
        layer={layer}
        isActive={layer.isActive}
        isDragged={layer === draggedLayer}
      />
    );
  });

  const firstElement = document?.renderingOrder[0];
  const isHeaderDivideVisible = !(
    firstElement?.isActive &&
    (firstElement instanceof AnnotationGroup ? firstElement.collapsed : true)
  );

  if (!layers) {
    return (
      <ListItem isLast>
        <SubtleText tx="no-layers" />
      </ListItem>
    );
  }

  return (
    <>
      <FloatingUIButton
        icon="layers"
        tooltipTx="layers"
        showTooltip={!isModalOpen}
        ref={setButtonRef}
        onPointerDown={document?.toggleLayerMenu}
        isActive={isModalOpen}
      />
      <LayerModal
        isOpen={isModalOpen}
        hideHeaderDivider={!isHeaderDivideVisible}
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
                !document?.imageLayers?.length ||
                document?.imageLayers?.length >=
                  (document?.maxVisibleLayers || 0)
              }
              onPointerDown={document?.addNewAnnotationLayer}
            />
          </>
        }
      >
        <OuterWrapper>
          <DndContext
            collisionDetection={customCollisionDetection}
            sensors={dndSensors}
            onDragStart={dndDragStart}
            onDragEnd={dndDragEnd}
            onDragOver={dndDragOver}
          >
            <SortableContext
              items={layerIds}
              strategy={verticalListSortingStrategy}
            >
              <LayerList onWheel={stopPropagation}>
                {listItems}
                {layers.length === 0 ? (
                  <ListItem isLast>
                    <SubtleText tx="no-layers" />
                  </ListItem>
                ) : (
                  false
                )}
              </LayerList>
            </SortableContext>
            {createPortal(
              <DragOverlay>
                {draggedLayer ? (
                  <LayerListItem
                    layer={draggedLayer}
                    isActive={draggedLayer.isActive}
                    isLast
                  />
                ) : null}
                {draggedGroup ? (
                  <AnnotationGroupListItem
                    group={draggedGroup}
                    isActive={draggedGroup.isActive}
                    isLast
                  />
                ) : null}
              </DragOverlay>,
              window.document.body,
            )}
          </DndContext>
        </OuterWrapper>
      </LayerModal>
    </>
  );
});
