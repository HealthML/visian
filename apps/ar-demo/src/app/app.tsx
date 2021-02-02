import {
  ColorMode,
  getTheme,
  GlobalStyles,
  Screen,
  Text,
  ThemeProvider,
} from "@classifai/ui-shared";
import React, { useState } from "react";
import { Route, Switch } from "react-router-dom";

export function App() {
  const [mode] = useState<ColorMode>("light");
  const theme = getTheme(mode);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Switch>
        <Route path="/">
          <Screen title="Visian AR Demo">
            <Text text="Replace me!" />
          </Screen>
        </Route>
      </Switch>
    </ThemeProvider>
  );
}

export default App;
