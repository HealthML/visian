import {
  ColorMode,
  getTheme,
  GlobalStyles,
  initI18n,
  Text,
  ThemeProvider,
} from "@visian/ui-shared";
import React, { useEffect, useState } from "react";
import { Route, Switch } from "react-router-dom";

export function App() {
  const [mode] = useState<ColorMode>("light");
  const theme = getTheme(mode);

  // TODO: Push loading down to components that need i18n
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    initI18n().then(() => {
      setIsReady(true);
    });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      {isReady && (
        <Switch>
          <Route path="/">
            <Text tx="replace-me" />
          </Route>
        </Switch>
      )}
    </ThemeProvider>
  );
}

export default App;
