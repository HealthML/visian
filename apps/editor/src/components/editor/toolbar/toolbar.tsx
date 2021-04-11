import { Tool, Toolbar as GenericToolbar } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { ToolType } from "../../../models";

const StyledToolbar = styled(GenericToolbar)`
  margin-bottom: 16px;
`;

export const Toolbar: React.FC = observer(() => {
  const store = useStore();

  const activeTool = store?.editor.tools.activeTool;
  const setActiveTool = useCallback(
    (value?: string | number) => {
      store?.editor.tools.setActiveTool(value as ToolType);
    },
    [store],
  );
  const clearSlice = useCallback(() => {
    store?.editor.tools.clearSlice();
  }, [store]);

  return (
    <StyledToolbar style={{ marginBottom: 16 }}>
      <Tool
        icon="moveTool"
        tooltipTx="move-tool"
        activeTool={activeTool}
        value={ToolType.Hand}
        onPress={setActiveTool}
      />
      <Tool
        icon="pixelBrush"
        tooltipTx="pixel-brush"
        activeTool={activeTool}
        value={ToolType.Brush}
        onPress={setActiveTool}
      />
      <Tool
        icon="magicBrush"
        tooltipTx="smart-brush"
        activeTool={activeTool}
        value={ToolType.SmartBrush}
        onPress={setActiveTool}
      />
      <Tool
        icon="erase"
        tooltipTx="pixel-eraser"
        activeTool={activeTool}
        value={ToolType.Eraser}
        onPress={setActiveTool}
      />
      <Tool icon="trash" tooltipTx="clear-slice" onPointerDown={clearSlice} />
    </StyledToolbar>
  );
});
