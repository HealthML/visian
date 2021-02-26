import {
  ColorMode,
  getTheme,
  GlobalStyles,
  Text,
  ThemeProvider,
} from "@visian/ui-shared";
import React, { useCallback, useState } from "react";
import { Route, Switch } from "react-router-dom";

import DragAndDropWrapper from "../components/dragAndDropWrapper/dragAndDropWrapper";

export function App() {
  const [mode] = useState<ColorMode>("light");
  const theme = getTheme(mode);

  const onFileDrop = useCallback((fileList: FileList) => {
    console.log(fileList);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Switch>
        <Route path="/">
          <DragAndDropWrapper processFiles={onFileDrop}>
            <Text text="Replace me!" />
          </DragAndDropWrapper>
        </Route>
      </Switch>
    </ThemeProvider>
  );
}

export default App;
