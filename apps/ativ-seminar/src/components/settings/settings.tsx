import {
  color,
  coverMixin,
  FlexRow,
  IntervalSlider,
  Sheet,
  Slider,
  Text,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback } from "react";
import styled from "styled-components";

import {
  lightingModes,
  LightingModeType,
  transferFunctions,
  TransferFunctionType,
} from "../../lib/volume-renderer";
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

const StyledDescription = styled(StyledText)`
  font-size: 14px;
  font-weight: 300;
  color: ${color("gray")};
  margin-bottom: 6px;
`;

const StyledSlider = styled(Slider)`
  margin-bottom: 10px;
`;

const StyledIntervalSlider = styled(IntervalSlider)`
  margin-bottom: 10px;
`;

const StyledTextInput = styled.input`
  background: ${color("veryLightGray")};
  border: none;
  border-radius: 2px;
  color: ${color("text")};
  height: 28px;
  margin-bottom: 10px;
  width: 100%;
`;

const StyledFileInput = styled.input`
  margin-bottom: 10px;
`;

const StyledCheckboxRow = styled(FlexRow)`
  align-items: center;
  height: 28px;
  margin-bottom: 10px;
`;

const StyledCheckboxText = styled(StyledText)`
  margin-bottom: 0;
  margin-left: 10px;
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

const Separator = styled.hr`
  margin-bottom: 10px;
  width: 100%;
`;

const HistogramWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const Histogram = styled.div`
  ${coverMixin}
  align-items: flex-end;
  display: flex;
  opacity: 0.2;
`;

const HistogramBar = styled.div`
  background-color: ${color("text")};
  flex: 1;
`;

const Settings: React.FC<SettingsProps> = observer((props) => {
  const { renderer, ...rest } = props;

  const setFocusColor = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      renderer.setFocusColor(event.target.value);
    },
    [renderer],
  );

  const setShouldUseFocusVolume = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      renderer.setShouldUseFocusVolume(event.target.checked);
    },
    [renderer],
  );

  const setLightingMode = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      renderer.setLightingMode(lightingModes[parseInt(event.target.value)]);
    },
    [renderer],
  );

  const setTransferFunction = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      renderer.setTransferFunction(
        transferFunctions[parseInt(event.target.value)],
      );
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

  const setCustomTFImage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files?.length) return;
      renderer.setCustomTFImage(files[0]);
    },
    [renderer],
  );

  const histogram =
    renderer.transferFunction.type === TransferFunctionType.FCEdges
      ? renderer?.gradientHistogram
      : renderer?.densityHistogram;
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
      <StyledText text="Lighting Mode" />
      <StyledSelect
        onChange={setLightingMode}
        value={renderer.lightingMode.type}
      >
        <StyledOption value={LightingModeType.None}>None</StyledOption>
        <StyledOption value={LightingModeType.Phong}>Phong</StyledOption>
        <StyledOption value={LightingModeType.LAO}>LAO</StyledOption>
      </StyledSelect>
      <StyledCheckboxRow>
        <input
          type="checkbox"
          checked={renderer?.shouldUseFocusVolume}
          onChange={setShouldUseFocusVolume}
          disabled={!renderer?.isFocusLoaded}
        />
        <StyledCheckboxText text="Use focus volume?" />
      </StyledCheckboxRow>
      <Separator />
      <StyledText text="Transfer Function" />
      <StyledSelect
        onChange={setTransferFunction}
        value={renderer.transferFunction.type}
      >
        <StyledOption value={TransferFunctionType.Density}>
          Density
        </StyledOption>
        <StyledOption value={TransferFunctionType.FCEdges}>
          F+C: Edges
        </StyledOption>
        <StyledOption value={TransferFunctionType.FCCutaway}>
          F+C: Cutaway
        </StyledOption>
        <StyledOption value={TransferFunctionType.Custom}>Custom</StyledOption>
      </StyledSelect>
      {(renderer.transferFunction.type === TransferFunctionType.Density ||
        renderer.transferFunction.type === TransferFunctionType.FCEdges) && (
        <HistogramWrapper>
          {histogram && (
            <Histogram>
              {histogram[0].map((value, index) => (
                <HistogramBar
                  key={index}
                  style={{
                    height: `${
                      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                      ((value - histogram![1]) /
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        (histogram![2] - histogram![1])) *
                      100
                    }%`,
                  }}
                />
              ))}
            </Histogram>
          )}
          <StyledText text="Value Range" />
          <StyledIntervalSlider
            min={0}
            max={1}
            onChange={renderer.setRangeLimits}
            value={renderer.rangeLimits}
          />
        </HistogramWrapper>
      )}
      {renderer.transferFunction.type === TransferFunctionType.FCCutaway && (
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
      {(renderer.transferFunction.type === TransferFunctionType.FCEdges ||
        renderer.transferFunction.type === TransferFunctionType.FCCutaway) && (
        <>
          <StyledText text="Focus Volume Color" />
          <StyledTextInput
            defaultValue={renderer?.focusColor || "rgba(255,255,255,1)"}
            onChange={setFocusColor}
          />
          <StyledText text="Context Opacity" />
          <StyledSlider
            min={0}
            max={1}
            onChange={setContextOpacity}
            value={Math.sqrt(renderer.contextOpacity)}
          />
        </>
      )}
      {renderer.transferFunction.type === TransferFunctionType.Custom && (
        <>
          <StyledText text="Transfer Image" />
          <StyledFileInput type="file" onChange={setCustomTFImage} />
          <StyledDescription text="Import an n x 1 image that maps from the image density to an RGBA output." />
        </>
      )}
    </Container>
  );
});

export default Settings;
