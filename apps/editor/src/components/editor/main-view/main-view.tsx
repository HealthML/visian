import { coverMixin, EventLike, preventDefault } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { ToolName } from "../../../models";

const MainViewContainer = styled.div<{
  activeTool?: ToolName;
  isDrawable?: boolean;
  isToolInUse?: boolean;
  isIn3DView?: boolean;
}>`
  ${coverMixin}

  cursor: ${(props) => {
    switch (props.activeTool) {
      case "navigation-tool":
      case "plane-tool":
        if (props.isToolInUse) document.body.style.cursor = "grabbing";
        return props.isToolInUse ? "grabbing" : "grab";

      case "crosshair-tool":
      case "outline-tool":
      case "outline-eraser":
        return "crosshair";

      case undefined:
        return "auto";

      case "smart-brush-3d":
        if (props.isIn3DView && props.isDrawable) return "crosshair";
      // eslint-disable-next-line no-fallthrough
      default:
        return props.isDrawable ? "none" : "auto";
    }
  }};
`;

export const MainView = observer(() => {
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
    store?.editor.activeDocument?.tools.setIsCursorOverDrawableArea(false);
  }, [store]);

  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const canvas = store?.editor.renderers[0].domElement;
  useEffect(() => {
    if (ref && canvas) {
      ref.appendChild(canvas);
      store?.editor.sliceRenderer?.resize();
    }

    return () => {
      if (ref) ref.innerHTML = "";
    };
  }, [canvas, ref, store]);

  return (
    <MainViewContainer
      activeTool={store?.editor.activeDocument?.tools.activeTool?.name}
      isDrawable={store?.editor.activeDocument?.tools.canDraw}
      isToolInUse={store?.editor.activeDocument?.tools.isToolInUse}
      isIn3DView={store?.editor.activeDocument?.viewSettings.viewMode === "3D"}
      onContextMenu={preventDefault}
      onPointerDown={handlePointerDown}
      onPointerOut={handlePointerOut}
      ref={setRef}
    />
  );
});
