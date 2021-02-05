import {
  ColorMode,
  getTheme,
  GlobalStyles,
  Screen,
  ThemeProvider,
} from "@classifai/ui-shared";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Route, Switch } from "react-router-dom";

import WebGLCanvas from "../components/webGLCanvas/webGLCanvas";
import { Renderer } from "../lib";

let renderer: Renderer | undefined;

export function App() {
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
      <Switch>
        <Route path="/">
          <Screen title="Visian AR Demo">
            <WebGLCanvas ref={canvasRef} />
          </Screen>
        </Route>
      </Switch>
    </ThemeProvider>
  );
}

export default App;
