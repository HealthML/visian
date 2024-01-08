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
import {
  SimpleTreeItemWrapper,
  SortableTree,
  TreeItem,
  TreeItemComponentProps,
  TreeItems,
} from "dnd-kit-sortable-tree";
import { ItemChangedReason } from "dnd-kit-sortable-tree/dist/types";
import { observer } from "mobx-react-lite";
import React, { ReactNode, useCallback, useEffect, useState } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { ImageLayer } from "../../../models";
import { AnnotationGroup } from "../../../models/editor/annotation-groups";
import { InfoShortcuts } from "../info-shortcuts";
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

interface TreeItemStyleWrapperProps
  extends TreeItemComponentProps<TreeItemData> {
  passedRef: React.ForwardedRef<HTMLDivElement>;
  children: ReactNode;
}

const TreeItemStyleWrapper = (props: TreeItemStyleWrapperProps) => {
  const { passedRef, className, ...restProps } = props;
  const newProps = { contentClassName: className, ...restProps };
  return (
    <SimpleTreeItemWrapper
      {...newProps}
      ref={passedRef}
      showDragHandle={false}
      hideCollapseButton
      disableCollapseOnItemClick
    />
  );
};

const indentationWidth = 20;
const treeWidth = 235;

const StyledTreeItem = styled(TreeItemStyleWrapper)`
  padding: 0px;
  border: none;
  background: none;
  width: 100%;
  max-width: ${treeWidth}px;
`;

type TreeItemData = {
  value: string;
};

const LayerItem = ({ id }: { id: string }) => {
  const store = useStore();
  const hideLayerDivider = useCallback(
    (element: ILayer | IAnnotationGroup) => {
      if (!element) return false;
      const flatRenderingOrder =
        store?.editor.activeDocument?.flatRenderingOrder;
      if (!flatRenderingOrder) return false;
      const renderingOrder = store?.editor.activeDocument?.renderingOrder;
      if (!renderingOrder) return false;
      const layerIndex = flatRenderingOrder.indexOf(element);
      if (layerIndex === flatRenderingOrder.length - 1) return true;
      if (
        element instanceof AnnotationGroup &&
        element.collapsed &&
        renderingOrder.indexOf(element) === renderingOrder.length - 1
      ) {
        return true;
      }
      const nextElement = flatRenderingOrder[layerIndex + 1];
      return (
        nextElement.isActive &&
        (nextElement instanceof AnnotationGroup ? nextElement.collapsed : true)
      );
    },
    [
      store?.editor.activeDocument?.flatRenderingOrder,
      store?.editor.activeDocument?.renderingOrder,
    ],
  );

  const group = store?.editor.activeDocument?.getAnnotationGroup(id);
  if (group) {
    const isActive = !!group.collapsed && group.isActive;
    return (
      <div style={{ width: `${treeWidth}px`, maxWidth: "100%" }}>
        <AnnotationGroupListItem
          key={group.id}
          group={group}
          isActive={isActive}
          isLast={hideLayerDivider(group)}
        />
      </div>
    );
  }
  const layer = store?.editor.activeDocument?.getLayer(id);
  if (layer) {
    return (
      <div
        style={{
          width: `${
            treeWidth - indentationWidth * (layer.annotationGroup ? 1 : 0)
          }px`,
          maxWidth: "100%",
        }}
      >
        <LayerListItem
          key={layer.id}
          layer={layer}
          isActive={layer.isActive}
          isLast={hideLayerDivider(layer)}
        />
      </div>
    );
  }
  return (
    <ListItem isLast>
      <SubtleText tx="no-layers" />
    </ListItem>
  );
};

const TreeItemComponent = React.forwardRef<
  HTMLDivElement,
  TreeItemComponentProps<TreeItemData>
>((props, ref) => (
  <StyledTreeItem {...props} passedRef={ref}>
    <LayerItem id={props.item.value} />
  </StyledTreeItem>
));

const layerToTreeItemData = (layer: ILayer) => ({
  id: layer.id,
  value: layer.id,
  canHaveChildren: false,
});

export const Layers: React.FC = observer(() => {
  const store = useStore();

  // Menu State
  const isModalOpen = Boolean(store?.editor.activeDocument?.showLayerMenu);

  // Menu Positioning
  const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null);

  // This is required to force an update when the view mode changes
  // (otherwise the layer menu stays fixed in place when switching the view mode)
  const viewMode = store?.editor.activeDocument?.viewSettings.viewMode;
  const [, setLastUpdatedViewMode] = useState<string>();
  useEffect(() => {
    setTimeout(() => {
      setLastUpdatedViewMode(viewMode);
    }, 50);
  }, [viewMode]);

  // This is required to force an update when the active layer changes and the layer view must change its position
  // (otherwise the layer menu stays fixed in place when switching the active layer between image and annotation)
  // eslint-disable-next-line no-unused-expressions, @typescript-eslint/no-unused-expressions
  store?.editor.activeDocument?.activeLayer;

  const layers = store?.editor.activeDocument?.layers;
  const canGroupHaveChildren = useCallback(
    (group: IAnnotationGroup) => {
      const callback = (draggedItem: TreeItem<TreeItemData>) => {
        const layer = store?.editor.activeDocument?.getLayer(draggedItem.value);
        if (store?.reviewStrategy && layer && !group.layers.includes(layer)) {
          return false;
        }

        return !!layer;
      };
      return callback;
    },
    [store?.editor.activeDocument, store?.reviewStrategy],
  );

  const getTreeItems = useCallback(() => {
    const annotationGroupToTreeItemData = (group: IAnnotationGroup) => ({
      id: group.id,
      value: group.id,
      children: group.layers.map((layer) => layerToTreeItemData(layer)),
      collapsed: group.collapsed,
      canHaveChildren: canGroupHaveChildren(group),
      disableSorting: false,
    });

    const renderingOrder = store?.editor.activeDocument?.renderingOrder;
    if (!renderingOrder) {
      return [];
    }

    return renderingOrder.map((element) => {
      if (element instanceof AnnotationGroup) {
        const group = element as AnnotationGroup;
        return annotationGroupToTreeItemData(group);
      }
      if (element instanceof ImageLayer) {
        const layer = element as ImageLayer;
        return layerToTreeItemData(layer);
      }
      return { id: "undefined", value: "undefined" };
    });
  }, [canGroupHaveChildren, store?.editor.activeDocument?.renderingOrder]);

  const treeItems = getTreeItems();

  const canRootHaveChildren = useCallback(
    (item) => {
      const layer = store?.editor.activeDocument?.getLayer(item.value);
      if (!layer) return true; // layerFamilies can always be children of root
      return layer.annotationGroup === undefined;
    },
    [store?.editor.activeDocument],
  );
  const updateRenderingOrder = useCallback(
    (
      newTreeItems: TreeItems<TreeItemData>,
      change: ItemChangedReason<TreeItemData>,
    ) => {
      if (change.type === "removed") return;
      if (change.type === "collapsed" || change.type === "expanded") {
        const group = store?.editor.activeDocument?.getAnnotationGroup(
          change.item.value,
        );
        if (!group) return;
        group.collapsed = change.item.collapsed;
        return;
      }
      if (change.type === "dropped") {
        const draggedLayer = store?.editor.activeDocument?.getLayer(
          change.draggedItem.value,
        );
        if (
          store?.reviewStrategy &&
          draggedLayer &&
          (change.draggedFromParent
            ? change.draggedFromParent.value
            : undefined) !==
            (change.droppedToParent ? change.droppedToParent.value : undefined)
        ) {
          return;
        }
        newTreeItems.forEach((item, index) => {
          const layer = store?.editor.activeDocument?.getLayer(item.value);
          if (layer) {
            layer?.setAnnotationGroup(undefined, index);
          }
          const group = store?.editor.activeDocument?.getAnnotationGroup(
            item.value,
          );
          if (group) {
            item.children?.forEach((childItem, childIndex) => {
              const childLayer = store?.editor.activeDocument?.getLayer(
                childItem.value,
              );
              if (childLayer) {
                childLayer.setAnnotationGroup(group.id, childIndex);
              }
            });
            group.collapsed = item.collapsed;
            store?.editor.activeDocument?.addAnnotationGroup(
              group as AnnotationGroup,
              index,
            );
          }
        });
      }
    },
    [store?.editor.activeDocument, store?.reviewStrategy],
  );

  const firstElement = store?.editor.activeDocument?.renderingOrder[0];
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
        onPointerDown={store?.editor.activeDocument?.toggleLayerMenu}
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
                !store?.editor.activeDocument?.imageLayers?.length ||
                store?.editor.activeDocument?.imageLayers?.length >=
                  (store?.editor.activeDocument?.maxVisibleLayers || 0)
              }
              onPointerDown={
                store?.editor.activeDocument?.addNewAnnotationLayer
              }
            />
          </>
        }
      >
        <OuterWrapper>
          <LayerList onWheel={stopPropagation}>
            <SortableTree
              items={treeItems}
              onItemsChanged={updateRenderingOrder}
              canRootHaveChildren={
                store?.reviewStrategy ? canRootHaveChildren : undefined
              }
              TreeItemComponent={TreeItemComponent}
              dropAnimation={null}
              sortableProps={{ animateLayoutChanges: () => false }}
              indentationWidth={20}
            />
            {layers.length === 0 ? (
              <ListItem isLast>
                <SubtleText tx="no-layers" />
              </ListItem>
            ) : (
              false
            )}
          </LayerList>
        </OuterWrapper>
      </LayerModal>
    </>
  );
});
