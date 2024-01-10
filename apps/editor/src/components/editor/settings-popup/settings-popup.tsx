import {
  BooleanParam,
  ColorMode,
  Divider,
  EnumParam,
  LargePopUpColumn,
  LargePopUpColumnContainer,
  LargePopUpGroup,
  LargePopUpGroupTitle,
  LargePopUpGroupTitleContainer,
  PerformanceMode,
  PopUp,
  SupportedLanguage,
  Switch,
  Theme,
} from "@visian/ui-shared";
import { VoxelInfoMode } from "@visian/utils";
import { observer } from "mobx-react-lite";
import React, { useCallback } from "react";
import styled, { useTheme } from "styled-components";

import { SettingsPopUpProps } from "./settings-popup.props";
import { useStore } from "../../../app/root-store";
import { InfoShortcuts } from "../info-shortcuts";

const StyledPopUp = styled(PopUp)`
  width: 280px;
`;

// Settings Items
const themeSwitchOptions = [
  { value: "dark", labelTx: "dark" },
  { value: "light", labelTx: "light" },
];

const languageSwitchOptions = [
  { label: "English", value: "en" },
  { label: "Deutsch", value: "de" },
];

const performanceSwitchOptions = [
  { labelTx: "low", value: "low" },
  { labelTx: "high", value: "high" },
];

const voxelInfoSwitchOptions = [
  { labelTx: "off", value: "off" },
  { labelTx: "delay", value: "delay" },
  { labelTx: "on", value: "on" },
];

export const SettingsPopUp: React.FC<SettingsPopUpProps> = observer(
  ({ isOpen, onClose }) => {
    const store = useStore();

    // Menu Actions
    const setColorMode = useCallback(
      (value: ColorMode) => store?.settings.setColorMode(value),
      [store],
    );
    const setLanguage = useCallback(
      (language: SupportedLanguage) => store?.settings.setLanguage(language),
      [store],
    );
    const setUseExclusiveSegmentations = useCallback(
      (value: boolean) => store?.settings.setUseExclusiveSegmentations(value),
      [store],
    );
    const setVoxelInfoMode = useCallback(
      (mode: VoxelInfoMode) => store?.settings.setVoxelInfoMode(mode),
      [store],
    );
    const setPerformanceMode = useCallback(
      (mode: PerformanceMode) => store?.settings.setPerformanceMode(mode),
      [store],
    );

    const theme = useTheme() as Theme;

    return (
      <StyledPopUp
        titleTx="settings"
        isOpen={isOpen}
        dismiss={onClose}
        shouldDismissOnOutsidePress
      >
        <LargePopUpColumnContainer>
          <LargePopUpColumn>
            <LargePopUpGroup>
              <LargePopUpGroupTitleContainer>
                <LargePopUpGroupTitle text="General" />
              </LargePopUpGroupTitleContainer>
              <EnumParam
                labelTx="theme"
                options={themeSwitchOptions}
                value={store?.settings.colorMode}
                setValue={setColorMode}
              />
              <EnumParam
                labelTx="language"
                options={languageSwitchOptions}
                value={store?.settings.language}
                setValue={setLanguage}
              />
              <Divider />
              <BooleanParam
                labelTx="exclusive-segmentations"
                infoTx="info-exclusive-segmentations"
                infoBaseZIndex={theme.zIndices.overlay}
                value={store?.settings.useExclusiveSegmentations}
                setValue={setUseExclusiveSegmentations}
              />
              <EnumParam
                labelTx="voxel-data"
                infoTx="info-voxel-data"
                infoShortcuts={
                  <InfoShortcuts hotkeyGroupNames={["voxel-info"]} />
                }
                infoBaseZIndex={theme.zIndices.overlay}
                options={voxelInfoSwitchOptions}
                value={store?.settings.voxelInfoMode}
                setValue={setVoxelInfoMode}
              />
              <Switch
                labelTx="performance-mode"
                infoTx="info-performance-mode"
                infoBaseZIndex={theme.zIndices.overlay}
                options={performanceSwitchOptions}
                value={store?.settings.performanceMode}
                onChange={setPerformanceMode}
              />
            </LargePopUpGroup>
          </LargePopUpColumn>
        </LargePopUpColumnContainer>
      </StyledPopUp>
    );
  },
);
