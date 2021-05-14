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
  const { volumeRendererModel, parentElement, ...rest } = props;

  const setFocusColor = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      volumeRendererModel.setFocusColor(event.target.value);
    },
    [volumeRendererModel],
  );

  const setUseFocusVolume = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      volumeRendererModel.setUseFocusVolume(event.target.checked);
    },
    [volumeRendererModel],
  );

  const setLightingMode = useCallback(
    (value: LightingModeType) => {
      volumeRendererModel.setLightingMode(lightingModes[value]);
    },
    [volumeRendererModel],
  );

  const setTransferFunction = useCallback(
    (value: TransferFunctionType) => {
      volumeRendererModel.setTransferFunction(transferFunctions[value]);
    },
    [volumeRendererModel],
  );

  const setLinkConeToCamera = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      volumeRendererModel.setIsConeLinkedToCamera(event.target.checked);
    },
    [volumeRendererModel],
  );

  const setCustomTFImage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { files } = event.target;
      if (!files?.length) return;
      volumeRendererModel.setCustomTFImage(files[0]);
    },
    [volumeRendererModel],
  );

  const histogram =
    volumeRendererModel.transferFunction.type === TransferFunctionType.FCEdges
      ? volumeRendererModel.gradientHistogram
      : volumeRendererModel.densityHistogram;
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
        onChange={volumeRendererModel.setBackgroundValue as any}
        value={volumeRendererModel.backgroundValue}
      />
      <SpacedSliderField
        label="Opacity"
        showValueLabel
        min={0}
        max={1}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={volumeRendererModel.setImageOpacity as any}
        value={volumeRendererModel.imageOpacity}
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
          volumeRendererModel.suppressedLightingMode?.type ||
          volumeRendererModel.lightingMode.type
        }
      />
      <StyledCheckboxRow>
        <input
          type="checkbox"
          checked={volumeRendererModel.useFocusVolume}
          onChange={setUseFocusVolume}
          disabled={!volumeRendererModel.focus}
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
        value={volumeRendererModel.transferFunction.type}
      />
      {(volumeRendererModel.transferFunction.type ===
        TransferFunctionType.Density ||
        volumeRendererModel.transferFunction.type ===
          TransferFunctionType.FCEdges) && (
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
            onChange={volumeRendererModel.setRangeLimits as any}
            value={volumeRendererModel.rangeLimits}
          />
        </HistogramWrapper>
      )}
      {volumeRendererModel.transferFunction.type ===
        TransferFunctionType.FCCutaway && (
        <>
          <SpacedSliderField
            label="Cutaway Angle"
            showValueLabel
            min={0}
            max={Math.PI}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={volumeRendererModel.setCutAwayConeAngle as any}
            value={volumeRendererModel.cutAwayConeAngle}
          />
          <StyledCheckboxRow>
            <input
              type="checkbox"
              checked={volumeRendererModel.isConeLinkedToCamera}
              onChange={setLinkConeToCamera}
            />
            <StyledCheckboxText text="Link cone to viewing angle?" />
          </StyledCheckboxRow>
        </>
      )}
      {(volumeRendererModel.transferFunction.type ===
        TransferFunctionType.FCEdges ||
        volumeRendererModel.transferFunction.type ===
          TransferFunctionType.FCCutaway) && (
        <>
          <InputLabel text="Focus Volume Color" />
          <StyledTextInput
            defaultValue={
              volumeRendererModel.focusColor || "rgba(255,255,255,1)"
            }
            onChange={setFocusColor}
          />
          <SpacedSliderField
            label="Context Opacity"
            showValueLabel
            min={0}
            max={1}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={volumeRendererModel.setContextOpacity as any}
            value={volumeRendererModel.contextOpacity}
            scaleType="quadratic"
          />
        </>
      )}
      {volumeRendererModel.transferFunction.type ===
        TransferFunctionType.Custom && (
        <>
          <InputLabel text="Transfer Image" />
          <StyledFileInput type="file" onChange={setCustomTFImage} />
          {/* eslint-disable-next-line max-len */}
          <StyledDescription text="Import an n x 1 image that maps from the image density to an RGBA output." />
        </>
      )}
    </Container>
  );
});

export default Settings;
