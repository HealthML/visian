import { IDisposer, ViewType } from "@visian/utils";
import hotkeys from "hotkeys-js";

import { skipSlices } from "../constants";
import {
  DilateErodeTool,
  ImageLayer,
  RootStore,
  SmartBrush3D,
} from "../models";

export const setUpHotKeys = (store: RootStore): IDisposer => {
  // Tool Selection
  hotkeys("h", (event) => {
    event.preventDefault();
    store.editor.activeDocument?.tools.setActiveTool("navigation-tool");
  });
  hotkeys("c", (event) => {
    event.preventDefault();
    if (store.editor.activeDocument?.viewSettings.viewMode !== "2D") return;
    if (!store.editor.activeDocument?.has3DLayers) return;

    store.editor.activeDocument?.tools.setActiveTool("crosshair-tool");
  });
  hotkeys("b", (event) => {
    event.preventDefault();
    if (store.editor.activeDocument?.viewSettings.viewMode !== "2D") return;

    store.editor.activeDocument?.tools.setActiveTool("pixel-brush");
  });
  hotkeys("s", (event) => {
    event.preventDefault();
    if (store.editor.activeDocument?.viewSettings.viewMode !== "2D") return;

    store.editor.activeDocument?.tools.setActiveTool("smart-brush");
  });
  hotkeys("r", (event) => {
    event.preventDefault();
    if (store.editor.activeDocument?.viewSettings.viewMode !== "2D") return;

    store.editor.activeDocument?.tools.setActiveTool("bounded-smart-brush");
  });
  hotkeys("d", (event) => {
    event.preventDefault();
    if (store.editor.activeDocument?.viewSettings.viewMode !== "2D") return;

    store.editor.activeDocument?.tools.setActiveTool("smart-brush-3d");
  });
  hotkeys("e", (event) => {
    event.preventDefault();
    if (store.editor.activeDocument?.viewSettings.viewMode !== "2D") return;

    store.editor.activeDocument?.tools.setActiveTool("pixel-eraser");
  });
  hotkeys("o", (event) => {
    event.preventDefault();
    if (store.editor.activeDocument?.viewSettings.viewMode !== "2D") return;

    store.editor.activeDocument?.tools.setActiveTool("outline-tool");
  });
  hotkeys("ctrl+d", (event) => {
    event.preventDefault();
    store.editor.activeDocument?.tools.setActiveTool("dilate-erode");
  });
  hotkeys("shift+f,f", (event) => {
    event.preventDefault();
    if (store.editor.activeDocument?.viewSettings.viewMode !== "3D") return;

    const activeTool = store.editor.activeDocument?.tools.activeTool?.name;
    store.editor.activeDocument?.tools.setActiveTool(
      activeTool === "fly-tool" ? "navigation-tool" : "fly-tool",
    );
  });
  hotkeys("p", (event) => {
    event.preventDefault();
    if (store.editor.activeDocument?.viewSettings.viewMode !== "3D") return;

    store.editor.activeDocument?.tools.setActiveTool("plane-tool");
  });

  // Tools
  hotkeys("del,backspace", (event) => {
    event.preventDefault();
    if (store.editor.activeDocument?.viewSettings.viewMode !== "2D") return;

    store.editor.activeDocument?.tools.setActiveTool("clear-slice");
  });
  hotkeys("ctrl+del,ctrl+backspace", (event) => {
    event.preventDefault();
    store.editor.activeDocument?.tools.setActiveTool("clear-image");
  });
  hotkeys("enter", (event) => {
    event.preventDefault();

    if (store.editor.activeDocument?.tools.dilateErodeRenderer3D.holdsPreview) {
      (store.editor.activeDocument?.tools.tools[
        "dilate-erode"
      ] as DilateErodeTool).submit();
    }

    if (
      store.editor.activeDocument?.tools.regionGrowingRenderer3D.holdsPreview
    ) {
      (store.editor.activeDocument?.tools.tools[
        "smart-brush-3d"
      ] as SmartBrush3D).submit();
    }
  });
  hotkeys("escape", (event) => {
    event.preventDefault();

    if (store.editor.activeDocument?.tools.dilateErodeRenderer3D.holdsPreview) {
      (store.editor.activeDocument?.tools.tools[
        "dilate-erode"
      ] as DilateErodeTool).discard();
    }

    if (
      store.editor.activeDocument?.tools.regionGrowingRenderer3D.holdsPreview
    ) {
      (store.editor.activeDocument?.tools.tools[
        "smart-brush-3d"
      ] as SmartBrush3D).discard();
    }
  });

  // Brush Size/Clipping Plane Distance
  hotkeys("*", (event) => {
    // "+" doesn't currently work with hotkeys-js (https://github.com/jaywcjlove/hotkeys/issues/270)
    if (event.key === "+" && !event.ctrlKey) {
      if (store.editor.activeDocument?.viewSettings.viewMode === "3D") {
        store.editor.activeDocument?.viewport3D.increaseClippingPlaneDistance();
        return;
      }

      store.editor.activeDocument?.tools.incrementBrushSize();
    }
  });
  hotkeys("-", () => {
    if (store.editor.activeDocument?.viewSettings.viewMode === "3D") {
      store.editor.activeDocument?.viewport3D.decreaseClippingPlaneDistance();
      return;
    }

    store.editor.activeDocument?.tools.decrementBrushSize();
  });

  // Undo/Redo
  hotkeys("ctrl+z", (event) => {
    event.preventDefault();
    store.editor.activeDocument?.history.undo();
  });
  hotkeys("ctrl+shift+z,ctrl+y", (event) => {
    event.preventDefault();
    store.editor.activeDocument?.history.redo();
  });

  // Layer Controls
  hotkeys("m", () => {
    store.editor.activeDocument?.activeLayer?.setIsVisible(
      !store.editor.activeDocument.activeLayer.isVisible,
    );
  });

  // View Types
  const handleXR = async (enterXR = false) => {
    if (enterXR) {
      store.editor.activeDocument?.viewport3D.enterXR();
    } else if (store.editor.activeDocument?.viewport3D.isInXR) {
      await store?.editor.activeDocument?.viewport3D.exitXR();
    }
  };
  hotkeys("1", () => {
    handleXR().then(() => {
      // View mode has to be set first to ensure brush cursor alignment
      store.editor.activeDocument?.viewSettings.setViewMode("2D");
      store.editor.activeDocument?.viewport2D.setMainViewType(
        ViewType.Transverse,
      );
    });
  });
  hotkeys("2", () => {
    handleXR().then(() => {
      // View mode has to be set first to ensure brush cursor alignment
      store.editor.activeDocument?.viewSettings.setViewMode("2D");
      store.editor.activeDocument?.viewport2D.setMainViewType(
        ViewType.Sagittal,
      );
    });
  });
  hotkeys("3", () => {
    handleXR().then(() => {
      // View mode has to be set first to ensure brush cursor alignment
      store.editor.activeDocument?.viewSettings.setViewMode("2D");
      store.editor.activeDocument?.viewport2D.setMainViewType(ViewType.Coronal);
    });
  });
  hotkeys("4", () => {
    handleXR().then(() => {
      store.editor.activeDocument?.viewSettings.setViewMode("3D");
    });
  });
  hotkeys("5", () => {
    handleXR(true);
  });
  hotkeys("0", () => {
    store.editor.activeDocument?.viewport2D.toggleSideViews();
  });
  hotkeys("ctrl+1", () => {
    if (store.editor.activeDocument?.viewSettings.viewMode !== "3D") return;

    store.editor.activeDocument?.viewport3D.setCameraToFaceViewType(
      ViewType.Transverse,
    );
  });
  hotkeys("ctrl+2", () => {
    if (store.editor.activeDocument?.viewSettings.viewMode !== "3D") return;

    store.editor.activeDocument?.viewport3D.setCameraToFaceViewType(
      ViewType.Sagittal,
    );
  });
  hotkeys("ctrl+3", () => {
    if (store.editor.activeDocument?.viewSettings.viewMode !== "3D") return;

    store.editor.activeDocument?.viewport3D.setCameraToFaceViewType(
      ViewType.Coronal,
    );
  });
  hotkeys("alt+1", () => {
    if (store.editor.activeDocument?.viewSettings.viewMode !== "3D") return;

    store.editor.activeDocument?.viewport3D.setCameraToFaceViewType(
      ViewType.Transverse,
      true,
    );
  });
  hotkeys("alt+2", () => {
    if (store.editor.activeDocument?.viewSettings.viewMode !== "3D") return;

    store.editor.activeDocument?.viewport3D.setCameraToFaceViewType(
      ViewType.Sagittal,
      true,
    );
  });
  hotkeys("alt+3", () => {
    if (store.editor.activeDocument?.viewSettings.viewMode !== "3D") return;

    store.editor.activeDocument?.viewport3D.setCameraToFaceViewType(
      ViewType.Coronal,
      true,
    );
  });

  // Slice Navigation
  hotkeys("up", (event) => {
    event.preventDefault();
    if (store.editor.activeDocument?.viewSettings.viewMode !== "2D") return;

    store.editor.activeDocument?.viewport2D.stepSelectedSlice(undefined, 1);
  });
  hotkeys("shift+up", (event) => {
    event.preventDefault();
    if (store.editor.activeDocument?.viewSettings.viewMode !== "2D") return;

    store.editor.activeDocument?.viewport2D.stepSelectedSlice(
      undefined,
      skipSlices,
    );
  });
  hotkeys("down", (event) => {
    event.preventDefault();
    if (store.editor.activeDocument?.viewSettings.viewMode !== "2D") return;

    store.editor.activeDocument?.viewport2D.stepSelectedSlice(undefined, -1);
  });
  hotkeys("shift+down", (event) => {
    event.preventDefault();
    if (store.editor.activeDocument?.viewSettings.viewMode !== "2D") return;

    store.editor.activeDocument?.viewport2D.stepSelectedSlice(
      undefined,
      -skipSlices,
    );
  });
  hotkeys("alt+0", (event) => {
    event.preventDefault();
    if (store.editor.activeDocument?.viewSettings.viewMode !== "2D") return;

    store.editor.activeDocument?.viewSettings.setSelectedVoxel();
  });

  // Zoom
  hotkeys("*", (event) => {
    // "+" doesn't currently work with hotkeys-js (https://github.com/jaywcjlove/hotkeys/issues/270)
    if (event.key === "+" && event.ctrlKey) {
      event.preventDefault();
      if (store.editor.activeDocument?.viewSettings.viewMode !== "2D") return;

      store.editor.activeDocument?.viewport2D.zoomIn();
    }
  });
  hotkeys("ctrl+-", (event) => {
    event.preventDefault();
    if (store.editor.activeDocument?.viewSettings.viewMode !== "2D") return;

    store.editor.activeDocument?.viewport2D.zoomOut();
  });
  hotkeys("ctrl+0", (event) => {
    event.preventDefault();
    const mode = store.editor.activeDocument?.viewSettings.viewMode;

    switch (mode) {
      case "2D":
        store.editor.activeDocument?.viewport2D.setZoomLevel();
        store.editor.activeDocument?.viewport2D.setOffset();
        store.editor.sliceRenderer?.resetCrosshairOffset();
        store.editor.sliceRenderer?.lazyRender();
        return;
      case "3D":
        store.editor.activeDocument?.viewport3D.setCameraMatrix();
        store.editor.activeDocument?.viewport3D.setOrbitTarget();
        store.editor.volumeRenderer?.lazyRender();
    }
  });

  // New Document
  // Ctrl + N in Chrome only works in application mode
  // See https://src.chromium.org/viewvc/chrome?revision=127787&view=revision
  hotkeys("ctrl+n,ctrl+alt+n", (event) => {
    event.preventDefault();
    store.editor.newDocument();
  });

  // Save & Export
  hotkeys("ctrl+s", (event) => {
    event.preventDefault();
    store.editor.activeDocument?.save();
  });
  hotkeys("ctrl+e", (event) => {
    event.preventDefault();

    if (store.editor.activeDocument?.viewSettings.viewMode === "2D") {
      (store.editor.activeDocument?.activeLayer as ImageLayer)?.quickExport?.();
    } else {
      store.editor.activeDocument?.viewport3D.exportCanvasImage();
    }
  });
  hotkeys("ctrl+shift+e", (event) => {
    event.preventDefault();
    if (store.editor.activeDocument?.viewSettings.viewMode === "2D") {
      (store.editor.activeDocument
        ?.activeLayer as ImageLayer)?.quickExportSlice?.();
    } else {
      store.editor.activeDocument?.viewport3D.exportCanvasImage();
    }
  });

  return () => hotkeys.unbind();
};
