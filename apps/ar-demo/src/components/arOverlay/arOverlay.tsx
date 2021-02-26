import { Button, Sheet, Slider, SquareButton } from "@classifai/ui-shared";
import React, { useCallback, useState } from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";

import { AROverlayProps } from ".";
import { ClearIcon } from "../icons";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const overlayContainer = document.getElementById("ar-overlay")!;

const OverlayPortal: React.FC = ({ children }) =>
  ReactDOM.createPortal(children, overlayContainer);

const ExitContainer = styled.div`
  right: 20px;
  position: absolute;
  top: 20px;
`;

const UIButton = styled(SquareButton)`
  position: absolute;
  left: 20px;
  top: 20px;
`;

const AnimationButton = styled(Button)`
  position: absolute;
  left: 20px;
  bottom: 90px;
`;

const RotationSliderContainer = styled(Sheet)`
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  height: 50px;
  padding: 0 10px 0;
`;

const AROverlay: React.FC<AROverlayProps> = (props) => {
  const { renderer, ...rest } = props;

  const [ui, setUI] = useState(false);
  const uiCallback = useCallback(() => {
    renderer.toggleARSelect();
    setUI(!ui);
  }, [setUI, ui, renderer]);

  const [rotation, setRotation] = useState<number>(renderer.scanRotation);
  const rotationCallback = useCallback(
    (value: number) => {
      setRotation(value);
      renderer.setScanRotation(value);
    },
    [setRotation, renderer],
  );

  return (
    <OverlayPortal>
      <ExitContainer {...rest} onPointerUp={renderer.exitAR}>
        <ClearIcon />
      </ExitContainer>
      <UIButton text="UI" onClick={uiCallback} />
      {ui && (
        <>
          <AnimationButton
            text="Animation"
            onClick={renderer.toggleScanAnimation}
          />
          <RotationSliderContainer>
            <Slider
              defaultValue={0}
              max={2 * Math.PI}
              min={-2 * Math.PI}
              onChange={rotationCallback}
              value={rotation}
            />
          </RotationSliderContainer>
        </>
      )}
    </OverlayPortal>
  );
};

export default AROverlay;
