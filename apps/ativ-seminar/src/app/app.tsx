import {
  ColorMode,
  getTheme,
  GlobalStyles,
  ThemeProvider,
} from "@visian/ui-shared";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Route, Switch } from "react-router-dom";

import DragAndDropWrapper from "../components/dragAndDropWrapper/dragAndDropWrapper";
import WebGLCanvas from "../components/webGLCanvas/webGLCanvas";
import VolumeRenderer from "../lib/volumeRenderer/volumeRenderer";

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
          <DragAndDropWrapper processFiles={onFileDrop}>
            <WebGLCanvas ref={canvasRef} />
          </DragAndDropWrapper>
        </Route>
      </Switch>
    </ThemeProvider>
  );
}

export default App;
