import { color, Sheet, Slider, Text } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback } from "react";
import styled from "styled-components";

import { TransferFunction } from "../../lib/volume-renderer";
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

const StyledSelect = styled.select`
  background: ${color("veryLightGray")};
  border: none;
  border-radius: 2px;
  color: ${color("text")};
  height: 28px;
  margin-bottom: 10px;
  outline: none;
  padding-left: 4px;
  width: 100%;
`;

const StyledOption = styled.option`
  background-color: ${color("background")};
`;

const Settings: React.FC<SettingsProps> = observer((props) => {
  const { renderer, ...rest } = props;

  const setTransferFunction = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      renderer.setTransferFunction(parseInt(event.target.value));
    },
    [renderer],
  );

  const setOpacity = useCallback(
    (value: number) => {
      renderer.setImageOpacity(value * value);
    },
    [renderer],
  );

  const setContextOpacity = useCallback(
    (value: number) => {
      renderer.setContextOpacity(value * value);
    },
    [renderer],
  );

  return (
    <Container {...rest}>
      <StyledText text="Background" />
      <StyledSlider
        min={0}
        max={1}
        onChange={renderer.setBackgroundValue}
        value={renderer.backgroundValue}
      />
      <StyledText text="Opacity" />
      <StyledSlider
        min={0}
        max={1}
        onChange={setOpacity}
        value={Math.sqrt(renderer.imageOpacity)}
      />
      <StyledText text="Transfer Function" />
      <StyledSelect
        onChange={setTransferFunction}
        value={renderer.transferFunction}
      >
        <StyledOption value={TransferFunction.Density}>Density</StyledOption>
        <StyledOption value={TransferFunction.FCEdges}>F+C: Edges</StyledOption>
        <StyledOption value={TransferFunction.FCCutaway}>
          F+C: Cutaway
        </StyledOption>
      </StyledSelect>
      {renderer.transferFunction === TransferFunction.FCCutaway && (
        <>
          <StyledText text="Cutaway Angle" />
          <StyledSlider
            min={0}
            max={Math.PI}
            onChange={renderer.setCutAwayConeAngle}
            value={renderer.cutAwayConeAngle}
          />
        </>
      )}

      {(renderer.transferFunction === TransferFunction.FCEdges ||
        renderer.transferFunction === TransferFunction.FCCutaway) && (
        <>
          <StyledText text="Context Opacity" />
          <StyledSlider
            min={0}
            max={1}
            onChange={setContextOpacity}
            value={Math.sqrt(renderer.contextOpacity)}
          />
        </>
      )}
    </Container>
  );
});

export default Settings;
