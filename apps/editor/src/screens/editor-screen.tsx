import { AbsoluteCover, Screen, useIsDraggedOver } from "@visian/ui-shared";
import { SliceRenderer } from "@visian/rendering";
import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";

import { useStore } from "../app/root-store";
import { MainView, UIOverlay } from "../components/editor";

export const EditorScreen: React.FC = observer(() => {
  const store = useStore();

  useEffect(() => {
    store?.editor.setSliceRenderer(new SliceRenderer(store.editor));

    return () => {
      store?.editor.sliceRenderer?.dispose();
    };
  }, [store]);

  const [isDraggedOver, { onDrop, ...dragListeners }] = useIsDraggedOver();
  return (
    <Screen {...dragListeners} title="VISIAN Editor">
      <AbsoluteCover>
        <MainView />
      </AbsoluteCover>
      <UIOverlay isDraggedOver={isDraggedOver} onDropCompleted={onDrop} />
    </Screen>
  );
});

export default EditorScreen;
