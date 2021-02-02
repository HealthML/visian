import {
  ColorMode,
  getTheme,
  GlobalStyles,
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
          <Text text="Replace me!" />
        </Route>
      </Switch>
    </ThemeProvider>
  );
}

export default App;
