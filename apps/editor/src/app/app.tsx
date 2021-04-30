import {
  getTheme,
  GlobalStyles,
  initI18n,
  ModalRoot,
  ThemeProvider,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Route, Switch } from "react-router-dom";

import { setUpEventHandling } from "../event-handling";
import { EditorScreen } from "../screens";
import { setupRootStore, StoreProvider } from "./root-store";

import type { RootStore } from "../models";
function App() {
  // TODO: Push loading down to components that need i18n
  const [isReady, setIsReady] = useState(false);
  const rootStoreRef = useRef<RootStore | null>(null);
  useEffect(() => {
    const result = Promise.all([setupRootStore(), initI18n()]).then(
      ([rootStore]) => {
        rootStoreRef.current = rootStore;
        const [dispatch, dispose] = setUpEventHandling(rootStore);
        rootStore.pointerDispatch = dispatch;

        setIsReady(true);
        return dispose;
      },
    );
    return () => {
      result.then((dispose) => dispose());
    };
  }, []);

  const storeTheme = rootStoreRef.current?.theme;
  const theme = useMemo(() => storeTheme || getTheme("dark"), [storeTheme]);

  return (
    <ThemeProvider theme={theme}>
      <StoreProvider value={rootStoreRef.current}>
        <GlobalStyles />
        {isReady && (
          <React.StrictMode>
            <ModalRoot />
            <Switch>
              <Route path="/">
                <EditorScreen />
              </Route>
            </Switch>
          </React.StrictMode>
        )}
      </StoreProvider>
    </ThemeProvider>
  );
}

export default observer(App);
