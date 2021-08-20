import {
  ContextMenu,
  ContextMenuItem,
  ILayer,
  ListItem,
  PointerButton,
  useDelay,
  useModalRoot,
  useShortTap,
  useTranslation,
} from "@visian/ui-shared";
import { Pixel } from "@visian/utils";
import { Observer, observer } from "mobx-react-lite";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
} from "react-beautiful-dnd";
import ReactDOM from "react-dom";

import { useStore } from "../../../app/root-store";
import { ImageLayer } from "../../../models";
import { LayerSettings } from "../layer-settings";

// Utilities
const noop = () => {
  // Intentionally left blank
};

export const LayerListItem = observer<{
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
  const [schedule, cancel] = useDelay(resetOpeningRef, 30);
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

  // Set as active layer
  const [startTap, stopTap] = useShortTap(
    useCallback(() => {
      setTimeout(() => {
        store?.editor.activeDocument?.setActiveLayer(layer);
      }, 30);
    }, [layer, store?.editor.activeDocument]),
  );

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
        startTap();
      } else if (event.button === PointerButton.RMB) {
        setContextMenuPosition({ x: event.clientX, y: event.clientY });
      }
    },
    [colorRef, startTap],
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
                  onChangeText={isActive ? layer.setTitle : undefined}
                  onPointerDown={handlePointerDown}
                  onPointerUp={stopTap}
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
        anchor={colorRef}
        position="right"
        onOutsidePress={closeLayerSettings}
      />
      <ContextMenu
        anchor={contextMenuPosition}
        isOpen={Boolean(contextMenuPosition)}
        onOutsidePress={closeContextMenu}
      >
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
          labelTx="delete-layer"
          onPointerDown={deleteLayer}
          isLast
        />
      </ContextMenu>
    </>
  );
});
