import {
  ColorMode,
  getTheme,
  GlobalStyles,
  Screen,
  ThemeProvider,
} from "@visian/ui-shared";
import { useCallback, useEffect, useRef, useState } from "react";
import { Route, Routes } from "react-router-dom";

import UIOverlay from "../components/uiOverlay/uiOverlay";
import WebGLCanvas from "../components/webGLCanvas/webGLCanvas";
import { Renderer } from "../lib";

let renderer: Renderer | undefined;

// eslint-disable-next-line react/function-component-definition
export function App(): JSX.Element {
  const [mode] = useState<ColorMode>("light");
  const theme = getTheme(mode);

  /* Canvas Controller */

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
      renderer = new Renderer(canvasRef.current, forceUpdate);

      forceUpdate();
    }
    return () => {
      renderer?.dispose();
    };
  }, [forceUpdate]);

  /* Canvas Controller End */

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Routes>
        <Route
          path="/"
          element={
            <Screen title="VISIAN AR Demo">
              <WebGLCanvas ref={canvasRef} />
              {renderer && <UIOverlay renderer={renderer} />}
            </Screen>
          }
        />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
