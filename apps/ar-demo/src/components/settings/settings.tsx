import { color, Sheet, Slider, Text } from "@visian/ui-shared";
import React, { useCallback, useState } from "react";
import styled from "styled-components";

import { SettingsProps } from ".";

const Container = styled(Sheet)`
  display: flex;
  flex-direction: column;
  margin-top: 12px;
  width: 250px;
  padding: 15px 16px;
  pointer-events: auto;
  align-items: flex-start;
`;

const StyledText = styled(Text)`
  font-size: 16px;
  font-weight: bold;
  color: ${color("gray")};
  margin-bottom: 6px;
`;

const StyledSlider = styled(Slider)`
  margin-bottom: 10px;
`;

const Settings: React.FC<SettingsProps> = (props) => {
  const { renderer, ...rest } = props;

  const [opacity, setOpacity] = useState(renderer.spriteHandler.opacity);
  const opacityCallback = useCallback(
    (value: number) => {
      setOpacity(value);
      renderer.spriteHandler.setOpacity(value);
    },
    [renderer, setOpacity],
  );

  const [contrast, setContrast] = useState(
    Math.log(renderer.spriteHandler.contrast),
  );
  const contrastCallback = useCallback(
    (value: number) => {
      setContrast(value);
      renderer.spriteHandler.setContrast(Math.exp(value));
    },
    [renderer, setContrast],
  );

  const [brightness, setBrightness] = useState(
    Math.log(renderer.spriteHandler.brightness),
  );
  const brightnessCallback = useCallback(
    (value: number) => {
      setBrightness(value);
      renderer.spriteHandler.setBrightness(Math.exp(value));
    },
    [renderer, setBrightness],
  );

  const [speed, setSpeed] = useState(renderer.cameraNavigator.speed);
  const speedCallback = useCallback(
    (value: number) => {
      setSpeed(value);
      renderer.cameraNavigator.setSpeed(value);
    },
    [renderer, setSpeed],
  );

  return (
    <Container {...rest}>
      <StyledText text="Opacity" />
      <StyledSlider
        value={opacity}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={opacityCallback as any}
        min={0}
        max={1}
      />
      <StyledText text="Contrast" />
      <StyledSlider
        value={contrast}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={contrastCallback as any}
        min={-1}
        max={1}
      />
      <StyledText text="Brightness" />
      <StyledSlider
        value={brightness}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={brightnessCallback as any}
        min={-1}
        max={1}
      />
      <StyledText text="Speed (Fly Controls)" />
      <Slider
        value={speed}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={speedCallback as any}
        min={0.001}
        max={0.015}
      />
    </Container>
  );
};

export default Settings;
