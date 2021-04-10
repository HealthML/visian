import {
  EventLike,
  preventDefault,
  WebGLCanvas,
  WebGLCanvasProps,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { ToolType } from "../../../models";

const SyledCanvas = styled(WebGLCanvas)<
  WebGLCanvasProps & {
    activeTool?: ToolType;
    isCursorOverDrawableArea?: boolean;
  }
>`
  cursor: ${(props) => {
    switch (props.activeTool) {
      case ToolType.Hand:
        // TODO: `cursor: "grabbing"` while dragged
        return "grab";

      case ToolType.Crosshair:
        return "crosshair";

      case undefined:
        return "auto";

      default:
        return props.isCursorOverDrawableArea ? "none" : "auto";
    }
  }};
`;

// eslint-disable-next-line @typescript-eslint/ban-types
export const MainView = observer<{}, HTMLCanvasElement>(
  (_props, ref) => {
    const store = useStore();
    const pointerDispatch = store?.pointerDispatch;
    const onPointerDown = useCallback(
      (event: EventLike) => {
        if (!pointerDispatch) return;
        pointerDispatch(event, "mainView");
      },
      [pointerDispatch],
    );

    return (
      <SyledCanvas
        activeTool={store?.editor.tools.activeTool}
        backgroundColor={store?.editor.getBackgroundColor()}
        isCursorOverDrawableArea={
          store?.editor.image && store?.editor.tools.isCursorOverDrawableArea
        }
        onContextMenu={preventDefault}
        onPointerDown={onPointerDown}
        ref={ref}
      />
    );
  },
  { forwardRef: true },
);
