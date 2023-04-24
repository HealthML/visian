import { withAuthenticator } from "@aws-amplify/ui-react";
import {
  getTheme,
  GlobalStyles,
  initI18n,
  ModalRoot,
  ThemeProvider,
} from "@visian/ui-shared";
import { isFromWHO, isUsingLocalhost } from "@visian/utils";
import Amplify from "aws-amplify";
import { observer } from "mobx-react-lite";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { Navigate, Route, Routes } from "react-router-dom";

import {
  whoAwsConfigDeployment,
  whoAwsConfigDevelopment,
  whoRequiresAuthentication,
} from "../constants";
import { setUpEventHandling } from "../event-handling";
import type { RootStore } from "../models";
import hubBaseUrl from "../queries/hub-base-url";
import {
  DatasetScreen,
  EditorScreen,
  ProjectDatasetsScreen,
  ProjectJobsScreen,
  ProjectsScreen,
} from "../screens";
import ProjectScreen from "../screens/project-screen";
import { setupRootStore, StoreProvider } from "./root-store";

if (isFromWHO()) {
  if (isUsingLocalhost()) {
    Amplify.configure(whoAwsConfigDevelopment);
  } else {
    Amplify.configure(whoAwsConfigDeployment);
  }
}

const queryClient = new QueryClient();

const withWhoAuthenticator = (
  wrappedComponent: React.ComponentType,
): React.ComponentType =>
  isFromWHO() && whoRequiresAuthentication
    ? withAuthenticator(wrappedComponent)
    : wrappedComponent;

// eslint-disable-next-line react/function-component-definition
function App(): JSX.Element {
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
        return () => {
          dispose();
          rootStore.dispose();
        };
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
              {hubBaseUrl ? (
                <Routes>
                  <Route path="projects">
                    <Route path="" element={<ProjectsScreen />} />
                    <Route path=":projectId" element={<ProjectScreen />}>
                      <Route index element={<ProjectDatasetsScreen />} />
                      <Route
                        path="datasets"
                        element={<ProjectDatasetsScreen />}
                      />
                      <Route path="jobs" element={<ProjectJobsScreen />} />
                    </Route>
                    <Route
                      path=":projectId/datasets/:datasetId"
                      element={<DatasetScreen />}
                    />
                  </Route>
                  <Route
                    path="/"
                    element={<Navigate replace to="/projects" />}
                  />
                  <Route path="/editor" element={<EditorScreen />} />
                </Routes>
              ) : (
                <Routes>
                  <Route path="/" element={<EditorScreen />} />
                </Routes>
              )}
            </React.StrictMode>
          )}
        </StoreProvider>
        {process.env.NODE_ENV === "development" && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default withWhoAuthenticator(observer(App));
