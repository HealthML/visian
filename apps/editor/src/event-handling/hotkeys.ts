import { isMac, MergeFunction, ViewMode } from "@visian/ui-shared";
import { IDisposer, ViewType } from "@visian/utils";
import hotkeys from "hotkeys-js";

import { skipSlices } from "../constants";
import {
  DilateErodeTool,
  ImageLayer,
  MeasurementTool,
  RootStore,
  SmartBrush3D,
  ThresholdAnnotationTool,
} from "../models";

export interface IHotkey {
  keys: string;
  preventDefault?: boolean; // Defaults to true
  condition?: (store: RootStore, event: KeyboardEvent) => boolean;
  viewMode?: ViewMode;
  action: (store: RootStore) => void;
  label?: string;
  labelTx?: string;
  name?: string;
  shortcutGuideSection?: string;
  displayKeys?: string[];
}

const handleXR = async (store: RootStore, enterXR = false) => {
  if (enterXR) {
    store.editor.activeDocument?.viewport3D.enterXR();
  } else if (store.editor.activeDocument?.viewport3D.isInXR) {
    await store?.editor.activeDocument?.viewport3D.exitXR();
  }
};

export const generalHotkeys: IHotkey[] = [
  // Brush Size
  {
    // "+" doesn't currently work with hotkeys-js (https://github.com/jaywcjlove/hotkeys/issues/270)
    keys: "*",
    viewMode: "2D",
    condition: (_, event) =>
      (event.key === "+" || event.key === "w") &&
      (isMac() ? !event.metaKey : !event.ctrlKey),
    action: (store) => store.editor.activeDocument?.tools.incrementBrushSize(),
    labelTx: "increase-brush-size",
    name: "increase-brush-size",
    shortcutGuideSection: "brush-size",
    displayKeys: ["+"],
  },
  {
    keys: "-",
    viewMode: "2D",
    action: (store) => store.editor.activeDocument?.tools.decrementBrushSize(),
    labelTx: "decrease-brush-size",
    name: "decrease-brush-size",
    shortcutGuideSection: "brush-size",
  },

  // Clipping Plane
  {
    // "+" doesn't currently work with hotkeys-js (https://github.com/jaywcjlove/hotkeys/issues/270)
    keys: "*",
    viewMode: "3D",
    condition: (_, event) =>
      (event.key === "+" || event.key === "w") &&
      (isMac() ? !event.metaKey : !event.ctrlKey),
    action: (store) =>
      store.editor.activeDocument?.viewport3D.increaseClippingPlaneDistance(),
    labelTx: "increase-clipping-plane",
    name: "increase-clipping-plane",
    displayKeys: ["+"],
  },
  {
    keys: "-",
    viewMode: "3D",
    action: (store) =>
      store.editor.activeDocument?.viewport3D.decreaseClippingPlaneDistance(),
    labelTx: "decrease-clipping-plane",
    name: "decrease-clipping-plane",
  },

  // Undo/Redo
  {
    keys: "ctrl+z",
    action: (store) => store.editor.activeDocument?.history.undo(),
    labelTx: "undo",
    name: "undo",
    shortcutGuideSection: "undo-redo",
  },
  {
    keys: "ctrl+shift+z,ctrl+y",
    action: (store) => store.editor.activeDocument?.history.redo(),
    labelTx: "redo",
    name: "redo",
    shortcutGuideSection: "undo-redo",
  },

  // Layer Controls
  {
    keys: "m",
    action: (store) =>
      store.editor.activeDocument?.activeLayer?.setIsVisible(
        !store.editor.activeDocument.activeLayer.isVisible,
      ),
    labelTx: "toggle-active-layer",
    name: "toggle-active-layer",
    shortcutGuideSection: "layer-controls",
  },

  // View Types
  {
    keys: "1",
    action: (store) =>
      handleXR(store).then(() => {
        // View mode has to be set first to ensure brush cursor alignment
        store.editor.activeDocument?.viewSettings.setViewMode("2D");
        store.editor.activeDocument?.viewport2D.setMainViewType(
          ViewType.Transverse,
        );
      }),
    labelTx: "switch-transverse",
    shortcutGuideSection: "view-types",
  },
  {
    keys: "2",
    action: (store) =>
      handleXR(store).then(() => {
        // View mode has to be set first to ensure brush cursor alignment
        store.editor.activeDocument?.viewSettings.setViewMode("2D");
        store.editor.activeDocument?.viewport2D.setMainViewType(
          ViewType.Sagittal,
        );
      }),
    labelTx: "switch-sagittal",
    shortcutGuideSection: "view-types",
  },
  {
    keys: "3",
    action: (store) =>
      handleXR(store).then(() => {
        // View mode has to be set first to ensure brush cursor alignment
        store.editor.activeDocument?.viewSettings.setViewMode("2D");
        store.editor.activeDocument?.viewport2D.setMainViewType(
          ViewType.Coronal,
        );
      }),
    labelTx: "switch-coronal",
    shortcutGuideSection: "view-types",
  },
  {
    keys: "4",
    action: (store) =>
      handleXR(store).then(() => {
        store.editor.activeDocument?.viewSettings.setViewMode("3D");
      }),
    labelTx: "switch-3d",
    shortcutGuideSection: "view-types",
  },
  {
    keys: "5",
    action: (store) => handleXR(store, true),
  },
  {
    keys: "0",
    viewMode: "2D",
    action: (store) =>
      store.editor.activeDocument?.viewport2D.toggleSideViews(),
    labelTx: "toggle-side-views",
    shortcutGuideSection: "view-types",
  },
  {
    keys: "ctrl+1",
    viewMode: "3D",
    action: (store) =>
      store.editor.activeDocument?.viewport3D.setCameraToFaceViewType(
        ViewType.Transverse,
      ),
  },
  {
    keys: "ctrl+2",
    viewMode: "3D",
    action: (store) =>
      store.editor.activeDocument?.viewport3D.setCameraToFaceViewType(
        ViewType.Sagittal,
      ),
  },
  {
    keys: "ctrl+3",
    viewMode: "3D",
    action: (store) =>
      store.editor.activeDocument?.viewport3D.setCameraToFaceViewType(
        ViewType.Coronal,
      ),
  },
  {
    keys: "alt+1",
    viewMode: "3D",
    action: (store) =>
      store.editor.activeDocument?.viewport3D.setCameraToFaceViewType(
        ViewType.Transverse,
        true,
      ),
  },
  {
    keys: "alt+2",
    viewMode: "3D",
    action: (store) =>
      store.editor.activeDocument?.viewport3D.setCameraToFaceViewType(
        ViewType.Sagittal,
        true,
      ),
  },
  {
    keys: "alt+3",
    viewMode: "3D",
    action: (store) =>
      store.editor.activeDocument?.viewport3D.setCameraToFaceViewType(
        ViewType.Coronal,
        true,
      ),
  },

  // Slice Navigation
  {
    keys: "up",
    viewMode: "2D",
    action: (store: RootStore) =>
      store.editor.activeDocument?.viewport2D.stepSelectedSlice(undefined, 1),
    labelTx: "slice-up",
    shortcutGuideSection: "slice-navigation",
  },
  {
    keys: "shift+up",
    viewMode: "2D",
    action: (store: RootStore) =>
      store.editor.activeDocument?.viewport2D.stepSelectedSlice(
        undefined,
        skipSlices,
      ),
    labelTx: "slice-skip-up",
    shortcutGuideSection: "slice-navigation",
  },
  {
    keys: "down",
    viewMode: "2D",
    action: (store: RootStore) =>
      store.editor.activeDocument?.viewport2D.stepSelectedSlice(undefined, -1),
    labelTx: "slice-down",
    shortcutGuideSection: "slice-navigation",
  },
  {
    keys: "shift+down",
    viewMode: "2D",
    action: (store: RootStore) =>
      store.editor.activeDocument?.viewport2D.stepSelectedSlice(
        undefined,
        -skipSlices,
      ),
    labelTx: "slice-skip-down",
    shortcutGuideSection: "slice-navigation",
  },
  {
    keys: "alt+0",
    viewMode: "2D",
    action: (store: RootStore) =>
      store.editor.activeDocument?.viewSettings.setSelectedVoxel(),
    labelTx: "reset-selected-voxel",
    shortcutGuideSection: "slice-navigation",
  },

  // Zoom
  {
    // "+" doesn't currently work with hotkeys-js (https://github.com/jaywcjlove/hotkeys/issues/270)
    keys: "*",
    viewMode: "2D",
    condition: (_, event) =>
      event.key === "+" && (isMac() ? event.metaKey : event.ctrlKey),
    action: (store) => store.editor.activeDocument?.viewport2D.zoomIn(),
    labelTx: "zoom-in",
    shortcutGuideSection: "zoom",
    displayKeys: ["ctrl", "+"],
  },
  {
    keys: "ctrl+-",
    viewMode: "2D",
    action: (store) => store.editor.activeDocument?.viewport2D.zoomOut(),
    labelTx: "zoom-out",
    shortcutGuideSection: "zoom",
  },
  {
    keys: "ctrl+0",
    viewMode: "2D",
    action: (store) => {
      store.editor.activeDocument?.viewport2D.setZoomLevel();
      store.editor.activeDocument?.viewport2D.setOffset();
      store.editor.sliceRenderer?.resetCrosshairOffset();
      store.editor.sliceRenderer?.lazyRender();
    },
    labelTx: "reset-zoom",
    shortcutGuideSection: "zoom",
  },
  {
    keys: "ctrl+0",
    viewMode: "3D",
    action: (store) => {
      store.editor.activeDocument?.viewport3D.setCameraMatrix();
      store.editor.activeDocument?.viewport3D.setOrbitTarget();
      store.editor.volumeRenderer?.lazyRender();
    },
  },

  // Rotation
  {
    keys: "ctrl+right",
    viewMode: "2D",
    action: (store) => {
      store.editor.activeDocument?.viewport2D.rotateBy90Degrees(true);
      store.editor.sliceRenderer?.lazyRender();
    },
    labelTx: "rotate-right",
    shortcutGuideSection: "rotation",
  },
  {
    keys: "ctrl+left",
    viewMode: "2D",
    action: (store) => {
      store.editor.activeDocument?.viewport2D.rotateBy90Degrees(false);
      store.editor.sliceRenderer?.lazyRender();
    },
    labelTx: "rotate-left",
    shortcutGuideSection: "rotation",
  },
  {
    keys: "ctrl+shift+r",
    viewMode: "2D",
    action: (store) => {
      store.editor.activeDocument?.viewport2D.resetRotation();
      store.editor.sliceRenderer?.lazyRender();
    },
    labelTx: "reset-rotation",
    shortcutGuideSection: "rotation",
  },

  // New Document
  {
    // Ctrl + N in Chrome only works in application mode
    // See https://src.chromium.org/viewvc/chrome?revision=127787&view=revision
    keys: "ctrl+n,ctrl+alt+n",
    action: (store) => store.editor.newDocument(),
    labelTx: "create-new-document",
    shortcutGuideSection: "save-export",
    displayKeys: ["ctrl", "alt", "n"],
  },

  // Save & Export
  {
    keys: "ctrl+s",
    action: (store) => store.editor.activeDocument?.save(),
    labelTx: "save-in-browser",
    shortcutGuideSection: "save-export",
  },
  {
    keys: "ctrl+e",
    viewMode: "2D",
    action: (store) => {
      store.setProgress({ labelTx: "exporting" });
      store.editor.activeDocument
        ?.exportZip(store.editor.activeDocument.layers, true)
        .catch()
        .then(() => {
          store?.setProgress();
        });
    },
    labelTx: "export-current-image",
    shortcutGuideSection: "save-export",
  },
  {
    keys: "ctrl+e",
    viewMode: "3D",
    action: (store) =>
      store.editor.activeDocument?.viewport3D.exportCanvasImage(),
  },
  {
    keys: "ctrl+shift+e",
    viewMode: "2D",
    action: (store) =>
      (
        store.editor.activeDocument?.activeLayer as ImageLayer
      )?.quickExportSlice?.(),
    labelTx: "export-current-slice",
    shortcutGuideSection: "save-export",
  },

  // Voxel Info
  {
    keys: "i",
    viewMode: "2D",
    action: (store) =>
      store.editor.activeDocument?.viewport2D.setVoxelInfoMode(
        store.editor.activeDocument?.viewport2D.voxelInfoMode === "off"
          ? "on"
          : "off",
      ),
    labelTx: "toggle-voxel-display",
    shortcutGuideSection: "voxel-info",
  },
  {
    keys: "ctrl+i",
    viewMode: "2D",
    action: (store) =>
      store.editor.activeDocument?.viewport2D.setVoxelInfoMode(
        store.editor.activeDocument?.viewport2D.voxelInfoMode === "delay"
          ? "on"
          : "delay",
      ),
    labelTx: "toggle-voxel-delay",
    shortcutGuideSection: "voxel-info",
  },
  {
    keys: "ctrl+c",
    viewMode: "2D",
    action: (store) => store.editor.activeDocument?.clipboard.copy(),
    labelTx: "copy-slice",
    shortcutGuideSection: "copy-paste",
  },
  {
    keys: "ctrl+v",
    viewMode: "2D",
    action: (store) => store.editor.activeDocument?.clipboard.paste(),
    labelTx: "paste-slice-replace",
    shortcutGuideSection: "copy-paste",
  },
  {
    keys: "ctrl+shift+v",
    viewMode: "2D",
    action: (store) =>
      store.editor.activeDocument?.clipboard.paste(MergeFunction.Add),
    labelTx: "paste-slice-add",
    shortcutGuideSection: "copy-paste",
  },

  {
    keys: "enter",
    action: (store) => {
      if (
        store.editor.activeDocument?.tools.regionGrowingRenderer3D.holdsPreview
      ) {
        (
          store.editor.activeDocument?.tools.tools[
            "smart-brush-3d"
          ] as SmartBrush3D
        ).submit();
      }

      if (
        store.editor.activeDocument?.tools.thresholdAnnotationRenderer3D
          .holdsPreview
      ) {
        (
          store.editor.activeDocument?.tools.tools[
            "threshold-annotation"
          ] as ThresholdAnnotationTool
        ).submit();
      }

      if (
        store.editor.activeDocument?.tools.dilateErodeRenderer3D.holdsPreview
      ) {
        (
          store.editor.activeDocument?.tools.tools[
            "dilate-erode"
          ] as DilateErodeTool
        ).submit();
      }

      if (
        (
          store.editor.activeDocument?.tools.tools[
            "measurement-tool"
          ] as MeasurementTool
        ).hasPath
      ) {
        (
          store.editor.activeDocument?.tools.tools[
            "measurement-tool"
          ] as MeasurementTool
        ).submit();
      }
    },
  },
  {
    keys: "escape",
    action: (store) => {
      if (
        store.editor.activeDocument?.tools.regionGrowingRenderer3D.holdsPreview
      ) {
        (
          store.editor.activeDocument?.tools.tools[
            "smart-brush-3d"
          ] as SmartBrush3D
        ).discard();
      }

      if (
        store.editor.activeDocument?.tools.thresholdAnnotationRenderer3D
          .holdsPreview
      ) {
        (
          store.editor.activeDocument?.tools.tools[
            "threshold-annotation"
          ] as ThresholdAnnotationTool
        ).discard();
      }

      if (
        store.editor.activeDocument?.tools.dilateErodeRenderer3D.holdsPreview
      ) {
        (
          store.editor.activeDocument?.tools.tools[
            "dilate-erode"
          ] as DilateErodeTool
        ).discard();
      }

      if (
        (
          store.editor.activeDocument?.tools.tools[
            "measurement-tool"
          ] as MeasurementTool
        ).hasPath
      ) {
        (
          store.editor.activeDocument?.tools.tools[
            "measurement-tool"
          ] as MeasurementTool
        ).discard();
      }
    },
  },
  {
    keys: "f,shift+f",
    viewMode: "3D",
    action: (store) => {
      const activeTool = store.editor.activeDocument?.tools.activeTool?.name;
      store.editor.activeDocument?.tools.setActiveTool(
        activeTool === "fly-tool" ? "navigation-tool" : "fly-tool",
      );
    },
  },
];

export const setUpHotKeys = (store: RootStore): IDisposer => {
  if (store.editor.activeDocument) {
    Object.values(store.editor.activeDocument.tools.tools).forEach((tool) => {
      if (!tool.activationKeys) return;

      hotkeys(
        isMac()
          ? tool.activationKeys.replace(/ctrl/g, "command")
          : tool.activationKeys,
        (event) => {
          const isToolAlreadyActive =
            store.editor.activeDocument?.tools.activeTool?.name === tool.name;
          if (
            // Explicitly access from the active document in case the document changes
            !store?.editor.activeDocument?.tools.tools[
              tool.name
            ].canActivate() ||
            isToolAlreadyActive
          ) {
            if (isToolAlreadyActive) {
              store.editor.activeDocument?.tools.toggleToolSettings();
            }
            return;
          }

          event.preventDefault();
          store.editor.activeDocument?.tools.setActiveTool(tool.name);
        },
      );
    });
  }

  generalHotkeys.forEach((config) =>
    hotkeys(
      isMac() ? config.keys.replace(/ctrl/g, "command") : config.keys,
      (event) => {
        // Early `preventDefault` is required on Mac to reliably cancel system actions
        if (event.metaKey) event.preventDefault();

        if (config.condition && !config.condition(store, event)) return;

        if (
          config.viewMode &&
          store.editor.activeDocument?.viewSettings.viewMode !== config.viewMode
        ) {
          return;
        }

        if (config.preventDefault !== false) event.preventDefault();

        config.action(store);
      },
    ),
  );

  return () => hotkeys.unbind();
};
