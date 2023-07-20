import { coverMixin, EventLike, preventDefault } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { MeasurementTool, AutoSegTool, ToolName } from "../../../models";

const MainViewContainer = styled.div<{
  activeTool?: ToolName;
  isDrawable?: boolean;
  isToolInUse?: boolean;
  isIn3DView?: boolean;
  cursor?: string;
}>`
  ${coverMixin}

  cursor: ${(props) => {
    if (props.cursor) return props.cursor;

    switch (props.activeTool) {
      case "navigation-tool":
      case "plane-tool":
        if (props.isToolInUse) document.body.style.cursor = "grabbing";
        return props.isToolInUse ? "grabbing" : "grab";

      case "crosshair-tool":
      case "outline-tool":
      case "outline-eraser":
      case "measurement-tool":
        return "crosshair";

      case undefined:
        return "auto";

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      case "smart-brush-3d":
        if (props.isIn3DView) return "crosshair";
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

  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const canvas = store?.editor.renderer.domElement;
  useEffect(() => {
    if (ref && canvas) {
      ref.appendChild(canvas);
      store?.editor.sliceRenderer?.resize();
    }

    return () => {
      if (ref) ref.innerHTML = "";
    };
  }, [canvas, ref, store]);

  const tools = store?.editor.activeDocument?.tools;
  const measurementTool = tools?.tools["measurement-tool"] as
    | MeasurementTool
    | undefined;
  const autoSegTool = tools?.tools["autoseg-tool"] as AutoSegTool | undefined;

  let cursor: string | undefined;
  if (
    (tools?.activeTool?.name === "measurement-tool" &&
      measurementTool?.isHoveringNode) ||
    (tools?.activeTool?.name === "autoseg-tool" && autoSegTool?.isHoveringPoint)
  ) {
    cursor = "move";
  }

  return (
    <MainViewContainer
      activeTool={store?.editor.activeDocument?.tools.activeTool?.name}
      isDrawable={store?.editor.activeDocument?.tools.canDraw}
      isToolInUse={store?.editor.activeDocument?.tools.isToolInUse}
      isIn3DView={store?.editor.activeDocument?.viewSettings.viewMode === "3D"}
      onContextMenu={preventDefault}
      onPointerDown={handlePointerDown}
      cursor={cursor}
      ref={setRef}
    />
  );
});
