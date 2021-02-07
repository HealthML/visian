import { FlexRow } from "@classifai/ui-shared";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { UIOverlayProps } from ".";
import ARButton from "../arButton/arButton";
import AROverlay from "../arOverlay/arOverlay";
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

  return (
    <FullScreenDiv {...rest}>
      <ToolBar renderer={renderer} />
      <UndoRedo renderer={renderer} />
      {aRAvailable && (
        <>
          <ARButton renderer={renderer} />
          <AROverlay renderer={renderer} />
        </>
      )}
    </FullScreenDiv>
  );
};

export default UIOverlay;
