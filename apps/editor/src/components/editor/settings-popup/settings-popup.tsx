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
  PopUp,
  Switch,
  Theme,
  useTranslation,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback } from "react";
import styled, { useTheme } from "styled-components";

import { useStore } from "../../../app/root-store";
import { SettingsPopUpProps } from "./settings-popup.props";

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
    const setTheme = useCallback(
      (value: string) => {
        store?.setColorMode(value as ColorMode);
      },
      [store],
    );

    const { i18n } = useTranslation();
    const setLanguage = useCallback(
      (language: string) => {
        i18n.changeLanguage(language);
      },
      [i18n],
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
                value={store?.colorMode || "dark"}
                setValue={setTheme}
              />
              <EnumParam
                labelTx="language"
                options={languageSwitchOptions}
                value={i18n.language.split("-")[0]}
                setValue={setLanguage}
              />
              <Divider />
              <BooleanParam
                labelTx="exclusive-segmentations"
                infoTx="info-exclusive-segmentations"
                infoBaseZIndex={theme.zIndices.overlay}
                value={store?.editor.activeDocument?.useExclusiveSegmentations}
                setValue={
                  store?.editor.activeDocument?.setUseExclusiveSegmentations
                }
              />
              <EnumParam
                labelTx="voxel-data"
                infoTx="info-voxel-data"
                infoBaseZIndex={theme.zIndices.overlay}
                options={voxelInfoSwitchOptions}
                value={store?.editor.activeDocument?.viewport2D.voxelInfoMode}
                setValue={
                  store?.editor.activeDocument?.viewport2D?.setVoxelInfoMode
                }
              />
              <Switch
                labelTx="performance-mode"
                infoTx="info-performance-mode"
                infoBaseZIndex={theme.zIndices.overlay}
                options={performanceSwitchOptions}
                value={store?.editor.performanceMode}
                onChange={store?.editor.setPerformanceMode}
              />
            </LargePopUpGroup>
          </LargePopUpColumn>
        </LargePopUpColumnContainer>
      </StyledPopUp>
    );
  },
);
