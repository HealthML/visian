import {
  ContextMenu,
  ContextMenuItem,
  FullWidthListItem,
  IImageLayer,
  ILayer,
  InfoText,
  PointerButton,
  useDelay,
  useDoubleTap,
  useForwardEvent,
  useShortTap,
  useTranslation,
} from "@visian/ui-shared";
import { Pixel } from "@visian/utils";
import { Observer, observer } from "mobx-react-lite";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { useStore } from "../../../app/root-store";
import { ImageLayer } from "../../../models";
import { LayerSettings } from "../layer-settings";

// Utilities
const noop = () => {
  // Intentionally left blank
};
export const LayerListItem = observer<{
  layer: ILayer;
  isActive?: boolean;
  isLast?: boolean;
}>(({ layer, isActive, isLast }) => {
  const store = useStore();

  const layerCount = store?.editor.activeDocument?.imageLayers?.length;

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

  const duplicateAnnotationLayer = useCallback(() => {
    if (layer.kind !== "image" || !layer.isAnnotation) return;

    const layerCopy = (layer as ImageLayer).copy();
    layerCopy.setTitle(`copy_${layer.title}`);
    layerCopy.id = uuidv4();
    layerCopy.setColor(store?.editor.activeDocument?.getFirstUnusedColor());

    store?.editor.activeDocument?.addLayer(layerCopy);

    setContextMenuPosition(null);
  }, [layer, store]);

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

  const node = (
    <Observer>
      {() => (
        <FullWidthListItem
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
          isLast={isLast}
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
        </FullWidthListItem>
      )}
    </Observer>
  );
  return (
    <>
      {node}
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
        {layerCount &&
          layerCount < (store?.editor.activeDocument?.maxVisibleLayers || 0) &&
          layer.kind === "image" &&
          layer.isAnnotation && (
            <ContextMenuItem
              labelTx="duplicate-layer"
              onPointerDown={duplicateAnnotationLayer}
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
