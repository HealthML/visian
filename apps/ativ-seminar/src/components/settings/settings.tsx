import { color, Sheet, Slider, Text } from "@visian/ui-shared";
import React from "react";
import styled from "styled-components";
import { observer } from "mobx-react-lite";

import { SettingsProps } from "./settings.props";

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

const Settings: React.FC<SettingsProps> = observer((props) => {
  const { renderer, ...rest } = props;

  return (
    <Container {...rest}>
      <StyledText text="Background" />
      <StyledSlider
        min={0}
        max={1}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={renderer.setBackgroundValue as any}
        value={renderer.backgroundValue}
      />
      <StyledText text="Opacity" />
      <StyledSlider
        min={0}
        max={1}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={renderer.setImageOpacity as any}
        value={renderer.imageOpacity}
      />
    </Container>
  );
});

export default Settings;
