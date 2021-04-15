import {
  color,
  coverMixin,
  Divider,
  FlexRow,
  Modal,
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

const Container = styled(Modal)`
  width: 250px;
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

export const Settings: React.FC<SettingsProps> = observer((props) => {
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
    <Container {...rest} label="View Settings">
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
        scaleType="quadratic"
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
      <Divider />
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
          <StyledSlider
            min={0}
            max={1}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={renderer.setRangeLimits as any}
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={renderer.setCutAwayConeAngle as any}
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={renderer.setContextOpacity as any}
            value={renderer.contextOpacity}
            scaleType="quadratic"
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
