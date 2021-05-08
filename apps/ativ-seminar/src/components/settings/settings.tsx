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
  const { volumeRendererModel: state, parentElement, ...rest } = props;

  const setFocusColor = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      state.setFocusColor(event.target.value);
    },
    [state],
  );

  const setShouldUseFocusVolume = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      state.setShouldUseFocusVolume(event.target.checked);
    },
    [state],
  );

  const setLightingMode = useCallback(
    (value: LightingModeType) => {
      state.setLightingMode(lightingModes[value]);
    },
    [state],
  );

  const setTransferFunction = useCallback(
    (value: TransferFunctionType) => {
      state.setTransferFunction(transferFunctions[value]);
    },
    [state],
  );

  const setCustomTFImage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files?.length) return;
      state.setCustomTFImage(files[0]);
    },
    [state],
  );

  const histogram =
    state.transferFunction.type === TransferFunctionType.FCEdges
      ? state.gradientHistogram
      : state.densityHistogram;
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
        onChange={state.setBackgroundValue as any}
        value={state.backgroundValue}
      />
      <SpacedSliderField
        label="Opacity"
        showValueLabel
        min={0}
        max={1}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={state.setImageOpacity as any}
        value={state.imageOpacity}
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
        value={state.suppressedLightingMode?.type || state.lightingMode.type}
      />
      <StyledCheckboxRow>
        <input
          type="checkbox"
          checked={state.shouldUseFocusVolume}
          onChange={setShouldUseFocusVolume}
          disabled={!state.isFocusLoaded}
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
        value={state.transferFunction.type}
      />
      {(state.transferFunction.type === TransferFunctionType.Density ||
        state.transferFunction.type === TransferFunctionType.FCEdges) && (
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
            onChange={state.setRangeLimits as any}
            value={state.rangeLimits}
          />
        </HistogramWrapper>
      )}
      {state.transferFunction.type === TransferFunctionType.FCCutaway && (
        <SpacedSliderField
          label="Cutaway Angle"
          showValueLabel
          min={0}
          max={Math.PI}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={state.setCutAwayConeAngle as any}
          value={state.cutAwayConeAngle}
        />
      )}
      {(state.transferFunction.type === TransferFunctionType.FCEdges ||
        state.transferFunction.type === TransferFunctionType.FCCutaway) && (
        <>
          <InputLabel text="Focus Volume Color" />
          <StyledTextInput
            defaultValue={state.focusColor || "rgba(255,255,255,1)"}
            onChange={setFocusColor}
          />
          <SpacedSliderField
            label="Context Opacity"
            showValueLabel
            min={0}
            max={1}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={state.setContextOpacity as any}
            value={state.contextOpacity}
            scaleType="quadratic"
          />
        </>
      )}
      {state.transferFunction.type === TransferFunctionType.Custom && (
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
