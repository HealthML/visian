import {
  ColorMode,
  getTheme,
  GlobalStyles,
  initI18n,
  ThemeProvider,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useEffect, useRef, useState } from "react";
import { Route, Switch } from "react-router-dom";

import { EditorScreen } from "../screens";
import { setupRootStore, StoreProvider } from "./root-store";

import type { RootStore } from "../models";
function App() {
  // TODO: Push loading down to components that need i18n
  const [isReady, setIsReady] = useState(false);
  const rootStoreRef = useRef<RootStore | null>(null);
  useEffect(() => {
    Promise.all([setupRootStore(), initI18n()]).then(([rootStore]) => {
      rootStoreRef.current = rootStore;
      setIsReady(true);
    });
  }, []);

  return (
    <ThemeProvider
      theme={getTheme(rootStoreRef.current?.editor.theme || "dark")}
    >
      <StoreProvider value={rootStoreRef.current}>
        <GlobalStyles />
        {isReady && (
          <Switch>
            <Route path="/">
              <EditorScreen />
            </Route>
          </Switch>
        )}
      </StoreProvider>
    </ThemeProvider>
  );
}

export default observer(App);
