import { FlexColumn, FlexRow } from "@classifai/ui-shared";
import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";

import { UIOverlayProps } from ".";
import ARButton from "../arButton/arButton";
import AROverlay from "../arOverlay/arOverlay";
import Crosshair from "../crosshair/crosshair";
import MagicAIButton from "../magicAIButton/magicAIButton";
import Settings from "../settings/settings";
import ToolBar from "../toolBar/toolBar";
import UndoRedo from "../undoRedo/undoRedo";

const FullScreenDiv = styled(FlexRow)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  align-items: flex-start;
  padding: 10px;
  z-index: 1;
  pointer-events: none;
  user-select: none;
`;

const UIColumn = styled(FlexColumn)`
  margin-left: 12px;
`;

const UIOverlay: React.FC<UIOverlayProps> = (props) => {
  const { renderer, ...rest } = props;

  const [aRAvailable, setARAvailable] = useState<boolean>(false);

  useEffect(() => {
    if ("xr" in navigator) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      (navigator as THREE.Navigator)
        .xr!.isSessionSupported("immersive-ar")
        .then(setARAvailable)
        .catch((e) => {
          console.error(e);
        });
    }
  }, [setARAvailable]);

  const [showSettings, setShowSettings] = useState(false);
  const toggleSettings = useCallback(() => {
    setShowSettings(!showSettings);
  }, [showSettings, setShowSettings]);

  return (
    <FullScreenDiv {...rest}>
      <ToolBar
        renderer={renderer}
        showSettings={showSettings}
        toggleSettings={toggleSettings}
      />
      <UIColumn>
        <FlexRow>
          <UndoRedo renderer={renderer} />
          {aRAvailable && (
            <>
              <ARButton renderer={renderer} />
              <AROverlay renderer={renderer} />
            </>
          )}
        </FlexRow>
        {showSettings && <Settings renderer={renderer} />}
      </UIColumn>
      <MagicAIButton renderer={renderer} />
      {renderer.cameraNavigator.isPointerLocked && <Crosshair />}
    </FullScreenDiv>
  );
};

export default UIOverlay;
