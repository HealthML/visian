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
import { Tool } from "../../../models";

const SyledCanvas = styled(WebGLCanvas)<
  WebGLCanvasProps & { activeTool?: Tool; isCursorOverDrawableArea?: boolean }
>`
  cursor: ${(props) => {
    if (!props.isCursorOverDrawableArea) return "crosshair";

    switch (props.activeTool) {
      case Tool.Hand:
        // TODO: `cursor: "grabbing"` while dragged
        return "grab";

      case Tool.Crosshair:
      case undefined:
        return "crosshair";

      default:
        return "none";
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
        backgroundColor={store?.editor.backgroundColor}
        isCursorOverDrawableArea={store?.editor.tools.isCursorOverDrawableArea}
        onContextMenu={preventDefault}
        onPointerDown={onPointerDown}
        ref={ref}
      />
    );
  },
  { forwardRef: true },
);
