import {
  color,
  coverMixin,
  Divider,
  FlexRow,
  InputLabel,
  Modal,
  SliderField,
  Switch,
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

const StyledDescription = styled(InputLabel)`
  font-size: 14px;
  font-weight: 300;
  color: ${color("gray")};
  line-height: 1.2em;
  margin-bottom: 6px;
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

const StyledCheckboxText = styled(InputLabel)`
  margin-bottom: 0;
  margin-left: 10px;
`;

const SpacedSliderField = styled(SliderField)`
  margin-bottom: 16px;
`;

const HistogramWrapper = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 16px;
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
  const { renderer, parentElement, ...rest } = props;

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
    (value: LightingModeType) => {
      renderer.setLightingMode(lightingModes[value]);
    },
    [renderer],
  );

  const setTransferFunction = useCallback(
    (value: TransferFunctionType) => {
      renderer.setTransferFunction(transferFunctions[value]);
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
    <Container
      {...rest}
      label="View Settings"
      parentElement={parentElement}
      position="right"
    >
      <SpacedSliderField
        label="Background"
        showValueLabel
        min={0}
        max={1}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={renderer.setBackgroundValue as any}
        value={renderer.backgroundValue}
      />
      <SpacedSliderField
        label="Opacity"
        showValueLabel
        min={0}
        max={1}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={renderer.setImageOpacity as any}
        value={renderer.imageOpacity}
        scaleType="quadratic"
      />
      <Switch
        label="Shading Mode"
        items={[
          {
            value: LightingModeType.None,
            label: "None",
            tooltip: "No Shading",
          },
          {
            value: LightingModeType.Phong,
            label: "Phong",
            tooltip: "Phong Shading",
          },
          {
            value: LightingModeType.LAO,
            label: "LAO",
            tooltip: "Local Ambient Occlusion",
          },
        ]}
        onChange={setLightingMode}
        value={
          renderer.suppressedLightingMode?.type || renderer.lightingMode.type
        }
      />
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
      <Switch
        label="Transfer Function"
        items={[
          { value: TransferFunctionType.Density, label: "Density" },
          { value: TransferFunctionType.FCEdges, label: "Edges" },
          { value: TransferFunctionType.FCCutaway, label: "Cutaway" },
          { value: TransferFunctionType.Custom, label: "Custom" },
        ]}
        onChange={setTransferFunction}
        value={renderer.transferFunction.type}
      />
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
          <SliderField
            label="Value Range"
            showValueLabel
            min={0}
            max={1}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={renderer.setRangeLimits as any}
            value={renderer.rangeLimits}
          />
        </HistogramWrapper>
      )}
      {renderer.transferFunction.type === TransferFunctionType.FCCutaway && (
        <SpacedSliderField
          label="Cutaway Angle"
          showValueLabel
          min={0}
          max={Math.PI}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={renderer.setCutAwayConeAngle as any}
          value={renderer.cutAwayConeAngle}
        />
      )}
      {(renderer.transferFunction.type === TransferFunctionType.FCEdges ||
        renderer.transferFunction.type === TransferFunctionType.FCCutaway) && (
        <>
          <InputLabel text="Focus Volume Color" />
          <StyledTextInput
            defaultValue={renderer?.focusColor || "rgba(255,255,255,1)"}
            onChange={setFocusColor}
          />
          <SpacedSliderField
            label="Context Opacity"
            showValueLabel
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
          <InputLabel text="Transfer Image" />
          <StyledFileInput type="file" onChange={setCustomTFImage} />
          <StyledDescription text="Import an n x 1 image that maps from the image density to an RGBA output." />
        </>
      )}
    </Container>
  );
});

export default Settings;
