import { AbsoluteCover, Screen, useIsDraggedOver } from "@visian/ui-shared";
import { SliceRenderer } from "@visian/rendering";
import { observer } from "mobx-react-lite";
import React, { useEffect, useRef } from "react";

import { useStore } from "../app/root-store";
import { MainView, UIOverlay } from "../components/editor";

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
          // TODO: Integrate new model
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          store.editor as any,
        ),
      );
    }
    return () => {
      store?.editor.sliceRenderer?.dispose();
    };
  }, [store]);

  const [isDraggedOver, { onDrop, ...dragListeners }] = useIsDraggedOver();
  return (
    <Screen {...dragListeners} title="Visian Editor">
      <AbsoluteCover>
        <MainView ref={canvasRef} />
      </AbsoluteCover>
      <UIOverlay isDraggedOver={isDraggedOver} onDropCompleted={onDrop} />
    </Screen>
  );
});

export default EditorScreen;
