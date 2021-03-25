import {
  AbsoluteCover,
  Screen,
  useIsDraggedOver,
  WebGLCanvas,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useEffect, useRef, useState } from "react";

import { useStore } from "../app/root-store";
import { UIOverlay } from "../components/editor";
import { SliceRenderer } from "../rendering";

export const EditorScreen: React.FC = observer(() => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const store = useStore();

  const [, setRenderer] = useState<SliceRenderer | undefined>();
  useEffect(() => {
    let newRenderer: SliceRenderer | undefined;
    if (canvasRef.current && store) {
      newRenderer = new SliceRenderer(canvasRef.current, store.editor);
      setRenderer(newRenderer);
    }
    return () => {
      newRenderer?.dispose();
    };
  }, [store]);

  const [isDraggedOver, { onDrop, ...dragListeners }] = useIsDraggedOver();
  return (
    <Screen {...dragListeners} title="Visian Editor">
      <AbsoluteCover>
        <WebGLCanvas
          backgroundColor={store?.editor.backgroundColor}
          ref={canvasRef}
        />
      </AbsoluteCover>
      <UIOverlay isDraggedOver={isDraggedOver} onDropCompleted={onDrop} />
    </Screen>
  );
});

export default EditorScreen;
