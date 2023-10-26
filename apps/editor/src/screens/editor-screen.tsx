import { AbsoluteCover, Screen, useIsDraggedOver } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";

import { useStore } from "../app/root-store";
import { MainView, UIOverlay } from "../components";
import { setUpEventHandling } from "../event-handling";

export const EditorScreen: React.FC = observer(() => {
  const [isDraggedOver, { onDrop, ...dragListeners }] = useIsDraggedOver();

  const rootStore = useStore();
  useEffect(() => {
    if (!rootStore) return;
    const [dispatch, dispose] = setUpEventHandling(rootStore);
    rootStore.pointerDispatch = dispatch;
    return dispose;
  }, [rootStore]);

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
