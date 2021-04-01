import {
  AbsoluteCover,
  EventLike,
  preventDefault,
  Screen,
  useIsDraggedOver,
  WebGLCanvas,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback, useEffect, useRef } from "react";

import { useStore } from "../app/root-store";
import { UIOverlay } from "../components/editor";
import { SliceRenderer } from "../rendering";

export const EditorScreen: React.FC = observer(() => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const store = useStore();

  useEffect(() => {
    if (canvasRef.current && store) {
      store.editor.setSliceRenderer(
        new SliceRenderer(
          canvasRef.current,
          store.refs.upperSideView.current as HTMLCanvasElement,
          store.refs.lowerSideView.current as HTMLCanvasElement,
          store.editor,
        ),
      );
    }
    return () => {
      store?.editor.sliceRenderer?.dispose();
    };
  }, [store]);

  const pointerDispatch = store?.pointerDispatch;
  const onPointerDown = useCallback(
    (event: EventLike) => {
      if (!pointerDispatch) return;
      pointerDispatch(event, "mainView");
    },
    [pointerDispatch],
  );

  const [isDraggedOver, { onDrop, ...dragListeners }] = useIsDraggedOver();
  return (
    <Screen {...dragListeners} title="Visian Editor">
      <AbsoluteCover>
        <WebGLCanvas
          backgroundColor={store?.editor.backgroundColor}
          onContextMenu={preventDefault}
          onPointerDown={onPointerDown}
          ref={canvasRef}
        />
      </AbsoluteCover>
      <UIOverlay isDraggedOver={isDraggedOver} onDropCompleted={onDrop} />
    </Screen>
  );
});

export default EditorScreen;
