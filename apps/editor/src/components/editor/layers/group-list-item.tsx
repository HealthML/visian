import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  ContextMenu,
  ContextMenuItem,
  FullWidthListItem,
  IAnnotationGroup,
  ILayer,
  PointerButton,
  useDoubleTap,
  useForwardEvent,
  useTranslation,
} from "@visian/ui-shared";
import { Pixel } from "@visian/utils";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { DraggableLayerListItem } from "./draggable-layer-list-item";

const ChildLayerContainer = styled.div`
  margin-left: 16px;
`;

export const AnnotationGroupListItem = observer<{
  group: IAnnotationGroup;
  isActive: boolean;
  isLast?: boolean;
  draggedLayer?: ILayer;
}>(({ group, isActive, isLast, draggedLayer }) => {
  const store = useStore();

  const toggleCollapse = useCallback(() => {
    group.setCollapsed(!group.collapsed);
  }, [group]);

  const hideDividerForLayer = useCallback(
    (layerIndex: number) => {
      if (isLast && layerIndex === group.layers.length - 1) return true;
      const indexOfActiveLayer = group.layers.findIndex((l) => l.isActive);
      return layerIndex === indexOfActiveLayer - 1;
    },
    [group, isLast],
  );

  const startTap2 = useDoubleTap(
    useCallback((event: React.PointerEvent) => {
      if (event.pointerType === "mouse") return;
      setContextMenuPosition({ x: event.clientX, y: event.clientY });
    }, []),
  );
  const startTap = useForwardEvent(startTap2);

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

  // Press Handler
  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button === PointerButton.LMB) {
        startTap(event);
      } else if (event.button === PointerButton.RMB) {
        setContextMenuPosition({ x: event.clientX, y: event.clientY });
      }
    },
    [startTap],
  );

  const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  // Layer Renaming Handling
  const [isAnnotationGroupNameEditable, setIsAnnotationGroupNameEditable] =
    useState(false);

  const startEditingAnnotationGroupName = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsAnnotationGroupNameEditable(true);
      closeContextMenu();
    },
    [closeContextMenu],
  );
  const stopEditingAnnotationGroupName = useCallback(() => {
    setIsAnnotationGroupNameEditable(false);
  }, []);

  return (
    <>
      <FullWidthListItem
        icon={group.collapsed ? "arrowRight" : "arrowDown"}
        onIconPress={toggleCollapse}
        labelTx={group.title ? undefined : "untitled-group"}
        label={group.title}
        isLabelEditable={isAnnotationGroupNameEditable}
        onChangeLabelText={group.setTitle}
        onConfirmLabelText={stopEditingAnnotationGroupName}
        isActive={isActive}
        isLast={isLast && group.collapsed}
        onPointerDown={handlePointerDown}
        onContextMenu={handleContextMenu}
      />
      {!group.collapsed && (
        <ChildLayerContainer>
          <SortableContext
            items={group.layerIds}
            strategy={verticalListSortingStrategy}
          >
            {group.layers.map((layer, index) => (
              <DraggableLayerListItem
                key={layer.id}
                layer={layer}
                isActive={layer.isActive}
                isDragged={layer === draggedLayer}
                isLast={hideDividerForLayer(index)}
              />
            ))}
          </SortableContext>
        </ChildLayerContainer>
      )}
      <ContextMenu
        anchor={contextMenuPosition}
        isOpen={Boolean(contextMenuPosition)}
        onOutsidePress={closeContextMenu}
      >
        <ContextMenuItem
          labelTx="rename-group"
          onPointerDown={startEditingAnnotationGroupName}
          isLast
        />
      </ContextMenu>
    </>
  );
});
