import {
  ColorMode,
  getTheme,
  GlobalStyles,
  ThemeProvider,
} from "@visian/ui-shared";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Route, Switch } from "react-router-dom";

import { DropZone } from "../components/drop-zone";
import { WebGLCanvas } from "../components/webgl-canvas";
import { VolumeRenderer } from "../lib/volume-renderer";

let renderer: VolumeRenderer | undefined;

export function App() {
  const [mode] = useState<ColorMode>("light");
  const theme = getTheme(mode);

  const onFileDrop = useCallback((fileList: FileList) => {
    console.log(fileList);
  }, []);

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
