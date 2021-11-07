import { withAuthenticator } from "@aws-amplify/ui-react";
import {
  getTheme,
  GlobalStyles,
  i18n,
  initI18n,
  ModalRoot,
  ThemeProvider,
} from "@visian/ui-shared";
import { isFromWHO, isUsingLocalhost } from "@visian/utils";
import Amplify from "aws-amplify";
import { observer } from "mobx-react-lite";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Route, Switch } from "react-router-dom";

import {
  IS_FLOY_DEMO,
  whoAwsConfigDeployment,
  whoAwsConfigDevelopment,
  whoRequiresAuthentication,
} from "../constants";
import { setUpEventHandling } from "../event-handling";
import { EditorScreen } from "../screens";
import { setupRootStore, StoreProvider } from "./root-store";

import type { RootStore } from "../models";

if (isFromWHO()) {
  if (isUsingLocalhost()) {
    Amplify.configure(whoAwsConfigDevelopment);
  } else {
    Amplify.configure(whoAwsConfigDeployment);
  }
}

const queryClient = new QueryClient();

const withWhoAuthenticator = (wrappedComponent: React.ComponentType) =>
  isFromWHO() && whoRequiresAuthentication
    ? withAuthenticator(wrappedComponent)
    : wrappedComponent;

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

        if (IS_FLOY_DEMO) i18n.changeLanguage("de");

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
      <QueryClientProvider client={queryClient}>
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
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default withWhoAuthenticator(observer(App));
