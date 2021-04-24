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
    isDrawable?: boolean;
    isNavigationDragged?: boolean;
  }
>`
  cursor: ${(props) => {
    switch (props.activeTool) {
      case ToolType.Navigate:
        if (props.isNavigationDragged) document.body.style.cursor = "grabbing";
        return props.isNavigationDragged ? "grabbing" : "grab";

      case ToolType.Crosshair:
        return "crosshair";

      case undefined:
        return "auto";

      default:
        return props.isDrawable ? "none" : "auto";
    }
  }};
`;

// eslint-disable-next-line @typescript-eslint/ban-types
export const MainView = observer<{}, HTMLCanvasElement>(
  (_props, ref) => {
    const store = useStore();

    const pointerDispatch = store?.pointerDispatch;
    const handlePointerDown = useCallback(
      (event: EventLike) => {
        if (!pointerDispatch) return;
        pointerDispatch(event, "mainView");
      },
      [pointerDispatch],
    );

    const handlePointerOut = useCallback(() => {
      store?.editor.tools.setIsCursorOverDrawableArea(false);
    }, [store]);

    return (
      <SyledCanvas
        activeTool={store?.editor.tools.activeTool}
        isDrawable={store?.editor.tools.canDraw}
        isNavigationDragged={store?.editor.tools.isNavigationDragged}
        onContextMenu={preventDefault}
        onPointerDown={handlePointerDown}
        onPointerOut={handlePointerOut}
        ref={ref}
      />
    );
  },
  { forwardRef: true },
);
