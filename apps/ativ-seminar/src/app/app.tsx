import {
  ColorMode,
  getTheme,
  GlobalStyles,
  ThemeProvider,
} from "@visian/ui-shared";
import { ITKImage, readMedicalImage } from "@visian/util";
import localForage from "localforage";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Route, Switch } from "react-router-dom";

import { DropZone } from "../components/drop-zone";
import { WebGLCanvas } from "../components/webgl-canvas";
import { VolumeRenderer } from "../lib/volume-renderer";

let renderer: VolumeRenderer | undefined;

export function App() {
  const [mode] = useState<ColorMode>("light");
  const theme = getTheme(mode);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Since the renderer is volatile state we trick React to force
  // an update when necessary by assigning a new object as state
  // through forceUpdate.
  const [, forceUpdateHelper] = useState({});
  const forceUpdate = useCallback(() => {
    // Here we asign the new object to force the update
    forceUpdateHelper({});
  }, [forceUpdateHelper]);

  useEffect(() => {
    if (canvasRef.current) {
      renderer = new VolumeRenderer(canvasRef.current);

      forceUpdate();
    }
    return () => {
      renderer?.dispose();
    };
  }, [forceUpdate]);

  // Load caches image
  useEffect(() => {
    (async () => {
      const image = await localForage.getItem<ITKImage>("image");
      if (image) renderer?.setImage(image);
    })();
  }, []);

  /** Tries to load a new image from the first dropped file. */
  const onFileDrop = useCallback((fileList: FileList) => {
    if (!fileList.length) return;
    (async () => {
      try {
        const image = await readMedicalImage(fileList[0]);
        if (image.imageType.dimension !== 3) {
          throw new Error("Only 3D volumetric images are supported.");
        }
        await localForage.setItem("image", image);
        if (image) renderer?.setImage(image);
      } catch (err) {
        console.error("The dropped file could not be opened:", err);
      }
    })();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Switch>
        <Route path="/">
          <DropZone onFileDrop={onFileDrop}>
            <WebGLCanvas ref={canvasRef} />
          </DropZone>
        </Route>
      </Switch>
    </ThemeProvider>
  );
}

export default App;
